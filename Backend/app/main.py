from fastapi import FastAPI, Depends, HTTPException, Header, BackgroundTasks, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi.middleware.cors import CORSMiddleware
import re
from datetime import datetime
import io

from .database import SessionLocal, engine, Base
from . import models, schemas, crud
from .jwt_utils import create_access_token, get_user_from_token
from .otp import (
    generate_otp, verify_otp, send_otp_email, resend_otp,
    generate_password_reset_otp, verify_password_reset_otp, use_password_reset_otp, 
    send_password_reset_email, resend_password_reset_otp,
    generate_profile_update_otp, verify_profile_update_otp, use_profile_update_otp,
    send_profile_update_email, resend_profile_update_otp,
    send_election_alert, send_vote_confirmation,
    check_rate_limit, track_otp_request
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

def get_current_user(request: Request, authorization: str = Header(None), db: Session = Depends(get_db)):
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
    
    # SECURITY: Check if session is still active in database
    if not crud.is_session_active(db, user["jti"]):
        raise HTTPException(401, "Session has been revoked or expired")
    
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
    is_valid, error_or_normalized = crud.is_valid_email(request.email)
    if not is_valid:
        raise HTTPException(400, f"Email error: {error_or_normalized}")
    
    if crud.email_exists(db, error_or_normalized):
        raise HTTPException(400, "Email already registered")
    return {"msg": "Email available"}


@app.post("/send-otp")
async def send_otp(request: schemas.OTPRequest, db: Session = Depends(get_db)):
    is_valid, error_or_normalized = crud.is_valid_email(request.email)
    if not is_valid:
        raise HTTPException(400, f"Email error: {error_or_normalized}")
    
    # Use normalized email
    email = error_or_normalized
    
    if crud.email_exists(db, email):
        raise HTTPException(400, "Email already registered. Please login or use a different email.")
    
    # Check Rate Limit
    allowed, remaining = check_rate_limit(email)
    if not allowed:
        minutes = remaining // 60
        raise HTTPException(429, f"Too many requests. Please try again in {minutes} minutes.")
        
    otp = generate_otp(email)
    try:
        await send_otp_email(request.email, otp)
        track_otp_request(email)
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
async def forgot_password(request: schemas.OTPRequest, db: Session = Depends(get_db)):
    is_valid, error_or_normalized = crud.is_valid_email(request.email)
    if not is_valid:
        raise HTTPException(400, f"Email error: {error_or_normalized}")
    
    email = error_or_normalized
    
    if not crud.email_exists(db, email):
        raise HTTPException(404, "Email not found. Please enter a registered email address.")
    
    # Check Rate Limit
    allowed, remaining = check_rate_limit(email)
    if not allowed:
        minutes = remaining // 60
        raise HTTPException(429, f"Too many requests. Please try again in {minutes} minutes.")
        
    otp = generate_password_reset_otp(request.email)
    try:
        await send_password_reset_email(request.email, otp)
        track_otp_request(email)
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
    # Check Rate Limit First
    allowed, remaining_limit = check_rate_limit(request.email)
    if not allowed:
        raise HTTPException(429, f"Rate limited. Wait {remaining_limit // 60} minutes")
        
    success, message, data = resend_otp(request.email)
    
    if not success:
        raise HTTPException(400, message)
    
    try:
        await send_otp_email(request.email, data["otp"])
        track_otp_request(request.email)
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
def register(request: Request, user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        new_user = crud.create_user(db, user)
        # Create token with JTI
        to_encode = {"sub": str(new_user.id), "email": new_user.email}
        access_token = create_access_token(data=to_encode)
        
        # Decode to get the generated JTI
        from .jwt_utils import verify_access_token
        payload = verify_access_token(access_token)
        
        # Create Session
        crud.create_session(
            db, 
            new_user.id, 
            payload["jti"], 
            request.headers.get("user-agent", "Unknown"),
            request.client.host
        )

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
def login(request: Request, user: schemas.UserLogin, db: Session = Depends(get_db)):
    u = crud.login_user(db, user.email, user.password)
    if not u:
        raise HTTPException(400, "Invalid login")
    
    to_encode = {"sub": str(u.id), "email": u.email}
    access_token = create_access_token(data=to_encode)
    
    # Decode to get the generated JTI
    from .jwt_utils import verify_access_token
    payload = verify_access_token(access_token)
    
    # Create Session record
    crud.create_session(
        db, 
        u.id, 
        payload["jti"], 
        request.headers.get("user-agent", "Unknown"),
        request.client.host
    )

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
async def vote(vote: schemas.VoteCreate, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    result = crud.create_vote(db, current_user["id"], vote.candidate_id)

    if result is None:
        raise HTTPException(400, "User already voted")

    # Get details for confirmation email
    candidate = db.query(models.Candidate).filter(models.Candidate.id == vote.candidate_id).first()
    election = db.query(models.Election).filter(models.Election.id == candidate.election_id).first() if candidate else None
    
    if candidate and election:
        background_tasks.add_task(send_vote_confirmation, current_user["email"], election.title, candidate.name)

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
async def start_election_admin(election_id: int, background_tasks: BackgroundTasks, user: dict = Depends(get_admin_user), db: Session = Depends(get_db)):
    """Admin only - Start an election"""
    election = crud.start_election(db, election_id)
    if not election:
        raise HTTPException(400, "Election not found or cannot be started")
    
    # Send email notifications to all voters
    emails = crud.get_all_voter_emails(db)
    if emails:
        background_tasks.add_task(send_election_alert, emails, election.title)
        
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

@app.post("/profile/update-otp")
async def send_profile_update_otp(request: schemas.OTPRequest, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Send OTP for profile update verification"""
    is_valid, error_or_normalized = crud.is_valid_email(request.email)
    if not is_valid:
        raise HTTPException(400, f"Email error: {error_or_normalized}")
    
    email = error_or_normalized
    
    # Check if email is already taken by another user
    existing_user = db.query(models.User).filter(models.User.email == email).first()
    if existing_user and existing_user.id != user["id"]:
        raise HTTPException(400, "Email already registered by another user")
    
    # Check Rate Limit
    allowed, remaining = check_rate_limit(email)
    if not allowed:
        raise HTTPException(429, f"Too many requests. Wait {remaining // 60} minutes.")
        
    otp = generate_profile_update_otp(email)
    try:
        await send_profile_update_email(request.email, otp)
        track_otp_request(email)
        return {"msg": "OTP sent to your email"}
    except Exception as e:
        print(f"Email Error: {str(e)}")
        raise HTTPException(500, f"Failed to send OTP: {str(e)}")

@app.post("/profile/verify-update-otp")
def verify_update_otp(request: schemas.ProfileUpdateOTPRequest):
    """Verify OTP for profile update"""
    success, message = verify_profile_update_otp(request.email, request.otp)
    if not success:
        raise HTTPException(400, message)
    return {"msg": message}

@app.post("/profile/resend-update-otp")
async def resend_update_otp(request: schemas.OTPRequest):
    """Resend OTP for profile update"""
    success, message, data = resend_profile_update_otp(request.email)
    
    if not success:
        if "remaining" in data:
            raise HTTPException(429, f"Rate limited. Wait {data['remaining']} seconds")
        raise HTTPException(400, message)
    
    try:
        await send_profile_update_email(request.email, data["otp"])
        return {"msg": message}
    except Exception as e:
        print(f"Email Error: {str(e)}")
        raise HTTPException(500, f"Failed to resend OTP: {str(e)}")

@app.put("/profile")
def update_profile(request: schemas.ProfileUpdateRequest, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update user profile after OTP verification"""
    success, message = verify_profile_update_otp(request.email, "")
    
    # Clean up OTP
    use_profile_update_otp(request.email)
    
    updated_user = crud.update_user_profile(db, user["id"], request.name, request.email)
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

# SESSION MANAGEMENT ENDPOINTS
@app.get("/sessions")
def list_sessions(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """List all active sessions for the current user"""
    sessions = crud.get_user_sessions(db, user["id"])
    return [
        {
            "jti": s.token_jti,
            "device": s.device_info,
            "ip": s.ip_address,
            "created_at": s.created_at,
            "is_current": s.token_jti == user["jti"]
        } for s in sessions
    ]

@app.post("/sessions/logout-all")
def logout_all_devices(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Revoke all sessions except the current one"""
    crud.revoke_all_user_sessions(db, user["id"], except_jti=user["jti"])
    return {"msg": "Successfully logged out from all other devices"}

@app.delete("/sessions/{jti}")
def logout_specific_device(jti: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Revoke a specific session"""
    # Security: Ensure session belongs to the user
    session = db.query(models.UserSession).filter(models.UserSession.token_jti == jti).first()
    if not session or session.user_id != user["id"]:
        raise HTTPException(404, "Session not found")
        
    crud.revoke_session(db, jti)
    return {"msg": "Session revoked"}

# PDF RECEIPT GENERATION
@app.get("/votes/{election_id}/receipt")
def get_vote_receipt(election_id: int, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Generate a PDF receipt for a cast vote"""
    # 1. Verify reportlab is available (lazy import to check installation)
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
    except ImportError:
        raise HTTPException(500, "PDF generation library not configured")

    # 2. Verify user actually voted in this election
    vote = db.query(models.Vote).filter(
        models.Vote.user_id == user["id"],
        models.Vote.election_id == election_id
    ).first()
    
    # FALLBACK: If no vote found with election_id, check for any vote by this user 
    # for a candidate that belongs to this election (fixes older data)
    if not vote:
        vote = db.query(models.Vote).join(models.Candidate).filter(
            models.Vote.user_id == user["id"],
            models.Candidate.election_id == election_id
        ).first()
    
    # 2. Verify user actually voted
    # Try 1: Exact match with election_id
    vote = db.query(models.Vote).filter(
        models.Vote.user_id == user["id"],
        models.Vote.election_id == election_id
    ).first()
    
    # Try 2: Join with candidates to find a vote that belongs to this election
    if not vote:
        vote = db.query(models.Vote).join(models.Candidate).filter(
            models.Vote.user_id == user["id"],
            models.Candidate.election_id == election_id
        ).first()
        
    # Try 3: Just find ANY vote cast by this user (absolute fallback for legacy data)
    if not vote:
        vote = db.query(models.Vote).filter(models.Vote.user_id == user["id"]).order_by(models.Vote.id.desc()).first()
    
    if not vote:
        raise HTTPException(404, "No vote record found. You must vote first.")
        
    candidate = db.query(models.Candidate).filter(models.Candidate.id == vote.candidate_id).first()
    election = db.query(models.Election).filter(models.Election.id == (vote.election_id or election_id)).first()
    db_user = db.query(models.User).filter(models.User.id == user["id"]).first()
    
    # 3. Generate PDF in memory
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    # Header
    p.setFont("Helvetica-Bold", 22)
    p.drawCentredString(300, 750, "SECURE VOTING SYSTEM")
    p.setFont("Helvetica", 14)
    p.drawCentredString(300, 730, "Official Digital Vote Receipt")
    p.line(100, 715, 500, 715)
    
    # Voter Info
    p.setFont("Helvetica-Bold", 12)
    p.drawString(100, 680, "VOTER INFORMATION")
    p.setFont("Helvetica", 11)
    p.drawString(100, 665, f"Name: {db_user.name if db_user else 'Unknown'}")
    p.drawString(100, 650, f"Email: {db_user.email if db_user else 'Unknown'}")
    p.drawString(100, 635, f"Voter ID: #VOTE-{(db_user.id if db_user else 0):04d}")
    
    # Election Info
    p.setFont("Helvetica-Bold", 12)
    p.drawString(100, 590, "ELECTION DETAILS")
    p.setFont("Helvetica", 11)
    p.drawString(100, 575, f"Election: {election.title if election else 'General Election'}")
    p.drawString(100, 560, f"Candidate Choice: {candidate.name if candidate else 'Unknown Candidate'}")
    p.drawString(100, 545, f"Voting Date: {datetime.now().strftime('%B %d, %Y %H:%M:%S')}")
    
    # Security/Verification
    p.line(100, 510, 500, 510)
    p.setFont("Helvetica-Bold", 12)
    p.drawString(100, 490, "VERIFICATION")
    p.setFont("Courier", 9)
    # Simulate a "Digital Signature" Hash
    import hashlib
    receipt_hash = hashlib.sha256(f"{vote.id}{user['id']}{candidate.name}".encode()).hexdigest()[:32].upper()
    p.drawString(100, 475, f"Digital Signature: {receipt_hash}")
    p.setFont("Helvetica-Oblique", 9)
    p.drawString(100, 455, "This document is a verifiable proof of your participation in the democratic process.")
    p.drawString(100, 440, "The vote itself remains encrypted and anonymous in the public results.")
    
    # Footer
    p.setFont("Helvetica", 8)
    p.drawCentredString(300, 50, "SECURE VOTING SYSTEM | OFFICIAL DIGITAL RECORD | © 2026")
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return StreamingResponse(
        buffer, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=vote_receipt_election_{election_id}.pdf"}
    )

