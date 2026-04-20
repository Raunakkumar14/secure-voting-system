from fastapi import FastAPI, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi.middleware.cors import CORSMiddleware

from .database import SessionLocal, engine, Base
from . import models, schemas, crud
from .jwt_utils import create_access_token, get_user_from_token
from .otp import (
    generate_otp, verify_otp, send_otp_email, resend_otp,
    generate_password_reset_otp, verify_password_reset_otp, use_password_reset_otp, 
    send_password_reset_email, resend_password_reset_otp
)

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Restricted CORS - allow frontend on dev ports (3000, 3001, 3002) and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(authorization: str = Header(None)):
    """Dependency to get current authenticated user from JWT token."""
    if not authorization:
        raise HTTPException(401, "Not authenticated")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(401, "Invalid authentication scheme")
    except ValueError:
        raise HTTPException(401, "Invalid authorization header")
    
    user = get_user_from_token(token)
    if user is None:
        raise HTTPException(401, "Invalid or expired token")
    
    return user

def get_admin_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Dependency to get current authenticated admin user."""
    user = get_current_user(authorization)
    db_user = db.query(models.User).filter(models.User.id == user["id"]).first()
    if not db_user or db_user.role != "admin":
        raise HTTPException(403, "Admin access required")
    return user

# OTP
@app.post("/check-email")
def check_email(request: schemas.OTPRequest, db: Session = Depends(get_db)):
    if crud.email_exists(db, request.email):
        raise HTTPException(400, "Email already registered")
    return {"msg": "Email available"}


@app.post("/send-otp")
async def send_otp(request: schemas.OTPRequest):
    otp = generate_otp(request.email)
    try:
        await send_otp_email(request.email, otp)
        return {"msg": "OTP sent to your email"}
    except Exception as e:
        print(f"Email Error: {str(e)}")
        raise HTTPException(500, f"Failed to send OTP: {str(e)}")


@app.post("/verify-otp")
def check_otp(request: schemas.OTPVerifyRequest):
    success, message = verify_otp(request.email, request.otp)
    if not success:
        raise HTTPException(400, message)
    return {"msg": message}


# FORGOT PASSWORD
@app.post("/forgot-password")
async def forgot_password(request: schemas.OTPRequest):
    otp = generate_password_reset_otp(request.email)
    try:
        await send_password_reset_email(request.email, otp)
        return {"msg": "Password reset OTP sent to your email"}
    except Exception as e:
        print(f"Email Error: {str(e)}")
        raise HTTPException(500, f"Failed to send reset OTP: {str(e)}")


@app.post("/verify-reset-otp")
def verify_reset_otp(request: schemas.OTPVerifyRequest):
    success, message = verify_password_reset_otp(request.email, request.otp)
    if not success:
        raise HTTPException(400, message)
    return {"msg": message}


@app.post("/reset-password")
def reset_password(request: schemas.PasswordResetRequest, db: Session = Depends(get_db)):
    success, message = use_password_reset_otp(request.email, request.otp)
    if not success:
        raise HTTPException(400, message)
    
    user = crud.reset_password(db, request.email, request.new_password)
    if not user:
        raise HTTPException(400, "User not found")
    
    return {"msg": message}

# RESEND OTP
@app.post("/resend-otp")
async def resend_otp_endpoint(request: schemas.OTPRequest):
    """Resend OTP with cooldown check"""
    success, message, data = resend_otp(request.email)
    
    if not success:
        raise HTTPException(400, message)
    
    try:
        await send_otp_email(request.email, data["otp"])
        return {
            "msg": message,
            "remaining_cooldown": 0
        }
    except Exception as e:
        print(f"Email Error: {str(e)}")
        raise HTTPException(500, f"Failed to resend OTP: {str(e)}")

@app.post("/resend-reset-otp")
async def resend_reset_otp_endpoint(request: schemas.OTPRequest):
    """Resend password reset OTP with cooldown check"""
    success, message, data = resend_password_reset_otp(request.email)
    
    if not success:
        if "remaining" in data:
            raise HTTPException(429, f"Rate limited. Wait {data['remaining']} seconds")
        raise HTTPException(400, message)
    
    try:
        await send_password_reset_email(request.email, data["otp"])
        return {
            "msg": message,
            "remaining_cooldown": 0
        }
    except Exception as e:
        print(f"Email Error: {str(e)}")
        raise HTTPException(500, f"Failed to resend reset OTP: {str(e)}")

@app.post("/register", response_model=schemas.TokenResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        new_user = crud.create_user(db, user)
        access_token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {"id": new_user.id, "name": new_user.name, "role": new_user.role}
        }
    except IntegrityError as e:
        db.rollback()
        if "users_email_key" in str(e):
            raise HTTPException(400, "Email already registered. Please login or use a different email.")
        raise HTTPException(400, "Registration failed. Please try again.")
    except Exception as e:
        db.rollback()
        raise HTTPException(500, "An error occurred during registration")


@app.post("/login", response_model=schemas.TokenResponse)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    u = crud.login_user(db, user.email, user.password)
    if not u:
        raise HTTPException(400, "Invalid login")
    
    access_token = create_access_token(data={"sub": str(u.id), "email": u.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": u.id, "name": u.name, "role": u.role}
    }


# CORE
@app.get("/candidates")
def candidates(db: Session = Depends(get_db)):
    return crud.get_candidates(db)

@app.post("/vote")
def vote(vote: schemas.VoteCreate, db: Session = Depends(get_db), authorization: str = None):
    if not authorization:
        raise HTTPException(401, "Not authenticated")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(401, "Invalid authentication scheme")
    except ValueError:
        raise HTTPException(401, "Invalid authorization header")
    
    current_user = get_user_from_token(token)
    if not current_user:
        raise HTTPException(401, "Invalid or expired token")
    
    result = crud.create_vote(db, current_user["id"], vote.candidate_id)

    if result is None:
        raise HTTPException(400, "User already voted")

    return result

@app.get("/results")
def get_results(db: Session = Depends(get_db)):
    return crud.get_vote_counts(db)

@app.get("/stats")
def stats(db: Session = Depends(get_db)):
    return crud.get_stats(db)

# ADMIN - Candidate Management
@app.post("/admin/candidates")
def create_candidate_admin(candidate: schemas.CandidateCreate, user: dict = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Admin only - Create a new candidate"""
    return crud.create_candidate(db, candidate)

@app.put("/admin/candidates/{candidate_id}", response_model=schemas.CandidateResponse)
def update_candidate_admin(candidate_id: int, candidate: schemas.CandidateUpdate, user: dict = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Admin only - Update a candidate"""
    result = crud.update_candidate(db, candidate_id, candidate)
    if not result:
        raise HTTPException(404, "Candidate not found")
    return result

@app.delete("/admin/candidates/{candidate_id}")
def delete_candidate_admin(candidate_id: int, user: dict = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Admin only - Delete a candidate"""
    if not crud.delete_candidate(db, candidate_id):
        raise HTTPException(404, "Candidate not found")
    return {"msg": "Candidate deleted"}

# ADMIN - Election Management
@app.post("/admin/elections")
def create_election_admin(election: schemas.ElectionCreate, user: dict = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Admin only - Create a new election"""
    result = crud.create_election(db, election)
    return {"id": result.id, "title": result.title, "description": result.description, "status": result.status,
            "created_at": result.created_at.isoformat() if result.created_at else None,
            "started_at": result.started_at.isoformat() if result.started_at else None,
            "ended_at": result.ended_at.isoformat() if result.ended_at else None}

@app.get("/admin/elections")
def list_elections_admin(user: dict = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Admin only - List all elections"""
    elections = crud.get_all_elections(db)
    return [{"id": e.id, "title": e.title, "description": e.description, "status": e.status, 
             "created_at": e.created_at.isoformat() if e.created_at else None,
             "started_at": e.started_at.isoformat() if e.started_at else None,
             "ended_at": e.ended_at.isoformat() if e.ended_at else None} for e in elections]

@app.post("/admin/elections/{election_id}/start")
def start_election_admin(election_id: int, user: dict = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Admin only - Start an election"""
    election = crud.start_election(db, election_id)
    if not election:
        raise HTTPException(400, "Election not found or cannot be started")
    return {"id": election.id, "title": election.title, "description": election.description, "status": election.status,
            "created_at": election.created_at.isoformat() if election.created_at else None,
            "started_at": election.started_at.isoformat() if election.started_at else None,
            "ended_at": election.ended_at.isoformat() if election.ended_at else None}

@app.post("/admin/elections/{election_id}/end")
def end_election_admin(election_id: int, user: dict = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Admin only - End an election"""
    election = crud.end_election(db, election_id)
    if not election:
        raise HTTPException(400, "Election not found or cannot be ended")
    return {"id": election.id, "title": election.title, "description": election.description, "status": election.status,
            "created_at": election.created_at.isoformat() if election.created_at else None,
            "started_at": election.started_at.isoformat() if election.started_at else None,
            "ended_at": election.ended_at.isoformat() if election.ended_at else None}

@app.get("/admin/elections/{election_id}/results")
def get_election_results(election_id: int, user: dict = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Admin only - Get election results with vote counts"""
    election = crud.get_election(db, election_id)
    if not election:
        raise HTTPException(404, "Election not found")
    
    # Get candidates and vote counts for this election
    candidates = db.query(models.Candidate).filter(models.Candidate.election_id == election_id).all()
    results = []
    
    for candidate in candidates:
        vote_count = db.query(models.Vote).filter(
            models.Vote.candidate_id == candidate.id,
            models.Vote.election_id == election_id
        ).count()
        results.append({
            "id": candidate.id,
            "name": candidate.name,
            "description": candidate.description,
            "votes": vote_count
        })
    
    total_votes = sum(r["votes"] for r in results)
    
    return {
        "election_id": election.id,
        "title": election.title,
        "description": election.description,
        "status": election.status,
        "total_votes": total_votes,
        "candidates": results
    }

# USER PROFILE MANAGEMENT
@app.get("/profile", response_model=schemas.UserProfileResponse)
def get_profile(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user profile"""
    profile = crud.get_user_profile(db, user["id"])
    if not profile:
        raise HTTPException(404, "User not found")
    return profile

@app.put("/profile")
def update_profile(name: str = None, email: str = None, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update user profile (name and email)"""
    updated_user = crud.update_user_profile(db, user["id"], name, email)
    if not updated_user:
        raise HTTPException(404, "User not found")
    return {
        "msg": "Profile updated successfully",
        "user": {
            "id": updated_user.id,
            "name": updated_user.name,
            "email": updated_user.email,
            "role": updated_user.role
        }
    }

@app.post("/change-password")
def change_password(request: schemas.ChangePasswordRequest, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Change user password"""
    if request.new_password != request.confirm_password:
        raise HTTPException(400, "New passwords do not match")
    
    if len(request.new_password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    
    # Verify current password
    db_user = db.query(models.User).filter(models.User.id == user["id"]).first()
    if not db_user:
        raise HTTPException(404, "User not found")
    
    from .auth import verify_password
    if not verify_password(request.current_password, db_user.password):
        raise HTTPException(400, "Current password is incorrect")
    
    # Change password
    updated_user = crud.change_user_password(db, user["id"], request.new_password)
    if not updated_user:
        raise HTTPException(500, "Failed to change password")
    
    return {"msg": "Password changed successfully"}

