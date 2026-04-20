import random
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from dotenv import load_dotenv
import os
import time

load_dotenv()

otp_store = {}  # Format: {email: {"otp": "123456", "timestamp": time.time(), "last_resend": time.time()}}
password_reset_otp = {}  # Separate store for password reset OTP
OTP_EXPIRY_TIME = 10 * 60  # 10 minutes in seconds
RESEND_COOLDOWN = 60  # 60 seconds between resends

def get_mail_config():
    return ConnectionConfig(
        MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
        MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
        MAIL_FROM=os.getenv("MAIL_FROM"),
        MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
        MAIL_SERVER=os.getenv("MAIL_SERVER"),
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
    )

async def send_otp_email(email: str, otp: str):
    message = MessageSchema(
        subject="Your OTP for Secure Voting",
        recipients=[email],
        body=f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; background-color: white; padding: 30px; border-radius: 10px; margin: 0 auto;">
                    <h2 style="color: #333;">Verify Your Email</h2>
                    <p style="color: #666; font-size: 16px;">Your One-Time Password (OTP) is:</p>
                    <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #2563eb; letter-spacing: 5px; margin: 0;">{otp}</h1>
                    </div>
                    <p style="color: #999; font-size: 14px;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
                    <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                </div>
            </body>
        </html>
        """,
        subtype="html",
    )
    
    conf = get_mail_config()
    fm = FastMail(conf)
    await fm.send_message(message)

async def send_password_reset_email(email: str, otp: str):
    message = MessageSchema(
        subject="Reset Your Password - Secure Voting",
        recipients=[email],
        body=f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; background-color: white; padding: 30px; border-radius: 10px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p style="color: #666; font-size: 16px;">We received a request to reset your password. Use this OTP:</p>
                    <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #ef4444; letter-spacing: 5px; margin: 0;">{otp}</h1>
                    </div>
                    <p style="color: #999; font-size: 14px;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
                    <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email and your password will remain unchanged.</p>
                </div>
            </body>
        </html>
        """,
        subtype="html",
    )
    
    conf = get_mail_config()
    fm = FastMail(conf)
    await fm.send_message(message)

def generate_otp(email):
    otp = str(random.randint(100000, 999999))
    otp_store[email] = {
        "otp": otp,
        "timestamp": time.time(),
        "last_resend": time.time()
    }
    return otp

def can_resend_otp(email):
    """Check if user can resend OTP (respects cooldown)"""
    if email not in otp_store:
        return True, 0  # No OTP exists, can generate new one
    
    last_resend = otp_store[email].get("last_resend", 0)
    time_since_last = time.time() - last_resend
    
    if time_since_last < RESEND_COOLDOWN:
        remaining = RESEND_COOLDOWN - time_since_last
        return False, int(remaining)  # Cannot resend, return seconds remaining
    
    return True, 0  # Can resend

def resend_otp(email):
    """Resend OTP with cooldown check. Returns (success, message, data)"""
    can_send, remaining = can_resend_otp(email)
    
    if not can_send:
        return False, f"Please wait {remaining} seconds before requesting another OTP", {"remaining": remaining}
    
    if email not in otp_store:
        return False, "No pending OTP found. Please request a new one.", {}
    
    otp = str(random.randint(100000, 999999))
    otp_store[email] = {
        "otp": otp,
        "timestamp": time.time(),
        "last_resend": time.time()
    }
    return True, "OTP resent successfully", {"otp": otp}

def generate_password_reset_otp(email):
    otp = str(random.randint(100000, 999999))
    password_reset_otp[email] = {
        "otp": otp,
        "timestamp": time.time(),
        "last_resend": time.time()
    }
    return otp

def can_resend_password_reset_otp(email):
    """Check if user can resend password reset OTP (respects cooldown)"""
    if email not in password_reset_otp:
        return True, 0
    
    last_resend = password_reset_otp[email].get("last_resend", 0)
    time_since_last = time.time() - last_resend
    
    if time_since_last < RESEND_COOLDOWN:
        remaining = RESEND_COOLDOWN - time_since_last
        return False, int(remaining)
    
    return True, 0

def resend_password_reset_otp(email):
    """Resend password reset OTP with cooldown check"""
    can_send, remaining = can_resend_password_reset_otp(email)
    
    if not can_send:
        return False, f"Please wait {remaining} seconds before requesting another OTP", {"remaining": remaining}
    
    if email not in password_reset_otp:
        return False, "No pending password reset request found. Please request a new one.", {}
    
    otp = str(random.randint(100000, 999999))
    password_reset_otp[email] = {
        "otp": otp,
        "timestamp": time.time(),
        "last_resend": time.time()
    }
    return True, "Password reset OTP resent successfully", {"otp": otp}

def verify_otp(email, otp):
    if email not in otp_store:
        return False, "No OTP found for this email. Please request a new one."
    
    stored_data = otp_store[email]
    stored_otp = stored_data["otp"]
    timestamp = stored_data["timestamp"]
    
    # Check if OTP expired
    if time.time() - timestamp > OTP_EXPIRY_TIME:
        del otp_store[email]
        return False, "OTP has expired. Please request a new one."
    
    # Check if OTP matches
    if stored_otp == otp:
        del otp_store[email]
        return True, "OTP verified successfully"
    
    return False, "Invalid OTP. Please try again."

def verify_password_reset_otp(email, otp):
    if email not in password_reset_otp:
        return False, "No password reset request found"
    
    stored_data = password_reset_otp[email]
    stored_otp = stored_data["otp"]
    timestamp = stored_data["timestamp"]
    
    # Check if OTP expired
    if time.time() - timestamp > OTP_EXPIRY_TIME:
        del password_reset_otp[email]
        return False, "OTP has expired. Please request a new reset."
    
    # Check if OTP matches (do NOT delete yet)
    if stored_otp == otp:
        return True, "OTP verified successfully"
    
    return False, "Invalid OTP. Please try again."

def use_password_reset_otp(email, otp):
    """Verify and consume the OTP"""
    if email not in password_reset_otp:
        return False, "No password reset request found"
    
    stored_data = password_reset_otp[email]
    stored_otp = stored_data["otp"]
    timestamp = stored_data["timestamp"]
    
    # Check if OTP expired
    if time.time() - timestamp > OTP_EXPIRY_TIME:
        del password_reset_otp[email]
        return False, "OTP has expired. Please request a new reset."
    
    # Check if OTP matches
    if stored_otp == otp:
        del password_reset_otp[email]
        return True, "Password reset successful"
    
    return False, "Invalid OTP. Please try again."