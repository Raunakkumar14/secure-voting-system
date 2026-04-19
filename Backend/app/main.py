from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi.middleware.cors import CORSMiddleware

from .database import SessionLocal, engine, Base
from . import models, schemas, crud
from .otp import (
    generate_otp, verify_otp, send_otp_email,
    generate_password_reset_otp, verify_password_reset_otp, use_password_reset_otp, send_password_reset_email
)

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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


# OTP
@app.post("/check-email")
def check_email(email: str, db: Session = Depends(get_db)):
    if crud.email_exists(db, email):
        raise HTTPException(400, "Email already registered")
    return {"msg": "Email available"}


@app.post("/send-otp")
async def send_otp(email: str):
    otp = generate_otp(email)
    try:
        await send_otp_email(email, otp)
        return {"msg": "OTP sent to your email"}
    except Exception as e:
        print(f"Email Error: {str(e)}")
        raise HTTPException(500, f"Failed to send OTP: {str(e)}")


@app.post("/verify-otp")
def check_otp(email: str, otp: str):
    if not verify_otp(email, otp):
        raise HTTPException(400, "Invalid OTP")
    return {"msg": "verified"}


# FORGOT PASSWORD
@app.post("/forgot-password")
async def forgot_password(email: str):
    otp = generate_password_reset_otp(email)
    try:
        await send_password_reset_email(email, otp)
        return {"msg": "Password reset OTP sent to your email"}
    except Exception as e:
        print(f"Email Error: {str(e)}")
        raise HTTPException(500, f"Failed to send reset OTP: {str(e)}")


@app.post("/verify-reset-otp")
def verify_reset_otp(email: str, otp: str):
    if not verify_password_reset_otp(email, otp):
        raise HTTPException(400, "Invalid OTP")
    return {"msg": "verified"}


@app.post("/reset-password")
def reset_password(email: str, otp: str, new_password: str, db: Session = Depends(get_db)):
    if not use_password_reset_otp(email, otp):
        raise HTTPException(400, "Invalid or expired OTP")
    
    user = crud.reset_password(db, email, new_password)
    if not user:
        raise HTTPException(400, "User not found")
    
    return {"msg": "Password reset successful"}

@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_user(db, user)
    except IntegrityError as e:
        db.rollback()
        if "users_email_key" in str(e):
            raise HTTPException(400, "Email already registered. Please login or use a different email.")
        raise HTTPException(400, "Registration failed. Please try again.")
    except Exception as e:
        db.rollback()
        raise HTTPException(500, "An error occurred during registration")


@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    u = crud.login_user(db, user.email, user.password)
    if not u:
        raise HTTPException(400, "Invalid login")
    return {"id": u.id, "name": u.name, "role": u.role}


# CORE
@app.get("/candidates")
def candidates(db: Session = Depends(get_db)):
    return crud.get_candidates(db)

@app.post("/vote")
def vote(vote: schemas.VoteCreate, db: Session = Depends(get_db)):
    result = crud.create_vote(db, vote)

    if result is None:
        raise HTTPException(status_code=400, detail="User already voted")

    return result

@app.get("/results")
def get_results(db: Session = Depends(get_db)):
    return crud.get_vote_counts(db)

@app.get("/stats")
def stats(db: Session = Depends(get_db)):
    return crud.get_stats(db)