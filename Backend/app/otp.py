import random
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from dotenv import load_dotenv
import os
import time

load_dotenv()

otp_store = {}  # Format: {email: {"otp": "123456", "timestamp": time.time(), "last_resend": time.time()}}
password_reset_otp = {}  # Separate store for password reset OTP
profile_update_otp = {}  # Separate store for profile update OTP
rate_limit_store = {}  # Format: {email: [timestamp1, timestamp2, ...]}

OTP_EXPIRY_TIME = 10 * 60  # 10 minutes in seconds
RESEND_COOLDOWN = 60  # 60 seconds between resends
RATE_LIMIT_WINDOW = 3600  # 1 hour
MAX_OTP_PER_HOUR = 5  # Maximum OTPs allowed per hour

def check_rate_limit(email: str):
    """Check if the user has exceeded the maximum allowed OTPs per hour"""
    now = time.time()
    if email not in rate_limit_store:
        rate_limit_store[email] = []
        return True, 0
    
    # Filter out timestamps older than the window
    rate_limit_store[email] = [t for t in rate_limit_store[email] if now - t < RATE_LIMIT_WINDOW]
    
    count = len(rate_limit_store[email])
    if count >= MAX_OTP_PER_HOUR:
        # Calculate time remaining until the oldest request expires
        oldest_request = rate_limit_store[email][0]
        remaining = int(RATE_LIMIT_WINDOW - (now - oldest_request))
        return False, remaining
    
    return True, 0

def track_otp_request(email: str):
    """Log an OTP request for rate limiting"""
    if email not in rate_limit_store:
        rate_limit_store[email] = []
    rate_limit_store[email].append(time.time())

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

# Profile Update OTP Functions
async def send_profile_update_email(email: str, otp: str):
    message = MessageSchema(
        subject="Verify Your Profile Changes - Secure Voting",
        recipients=[email],
        body=f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; background-color: white; padding: 30px; border-radius: 10px; margin: 0 auto;">
                    <h2 style="color: #333;">Verify Your Profile Update</h2>
                    <p style="color: #666; font-size: 16px;">We detected a change to your profile information. Use this OTP to confirm:</p>
                    <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #2563eb; letter-spacing: 5px; margin: 0;">{otp}</h1>
                    </div>
                    <p style="color: #999; font-size: 14px;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
                    <p style="color: #999; font-size: 12px;">If you didn't request this change, please ignore this email.</p>
                </div>
            </body>
        </html>
        """,
        subtype="html",
    )
    
    conf = get_mail_config()
    fm = FastMail(conf)
    await fm.send_message(message)

def generate_profile_update_otp(email):
    otp = str(random.randint(100000, 999999))
    profile_update_otp[email] = {
        "otp": otp,
        "timestamp": time.time(),
        "last_resend": time.time()
    }
    return otp

def can_resend_profile_update_otp(email):
    """Check if user can resend profile update OTP (respects cooldown)"""
    if email not in profile_update_otp:
        return True, 0
    
    last_resend = profile_update_otp[email].get("last_resend", 0)
    time_since_last = time.time() - last_resend
    
    if time_since_last < RESEND_COOLDOWN:
        remaining = RESEND_COOLDOWN - time_since_last
        return False, int(remaining)
    
    return True, 0

def resend_profile_update_otp(email):
    """Resend profile update OTP with cooldown check"""
    can_send, remaining = can_resend_profile_update_otp(email)
    
    if not can_send:
        return False, f"Please wait {remaining} seconds before requesting another OTP", {"remaining": remaining}
    
    if email not in profile_update_otp:
        return False, "No pending profile update request found. Please try again.", {}
    
    otp = str(random.randint(100000, 999999))
    profile_update_otp[email] = {
        "otp": otp,
        "timestamp": time.time(),
        "last_resend": time.time()
    }
    return True, "Profile update OTP resent successfully", {"otp": otp}

def verify_profile_update_otp(email, otp):
    """Verify OTP for profile update (do NOT delete yet)"""
    if email not in profile_update_otp:
        return False, "No profile update request found"
    
    stored_data = profile_update_otp[email]
    stored_otp = stored_data["otp"]
    timestamp = stored_data["timestamp"]
    
    # Check if OTP expired
    if time.time() - timestamp > OTP_EXPIRY_TIME:
        del profile_update_otp[email]
        return False, "OTP has expired. Please request a new one."
    
    # Check if OTP matches (do NOT delete yet)
    if stored_otp == otp:
        return True, "OTP verified successfully"
    
    return False, "Invalid OTP. Please try again."

def use_profile_update_otp(email):
    """Consume the OTP after verification"""
    if email in profile_update_otp:
        del profile_update_otp[email]
    return True

# Automated Notifications
async def send_election_alert(emails: list, election_title: str):
    """Send election start notification to all voters"""
    if not emails:
        return
        
    message = MessageSchema(
        subject=f"URGENT: Election Started - {election_title}",
        recipients=emails,
        body=f"""
        <html>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 20px;">
                <div style="max-width: 600px; background-color: white; padding: 40px; border-radius: 16px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-top: 6px solid #2563eb;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <span style="font-size: 48px;">🗳️</span>
                    </div>
                    <h2 style="color: #1e293b; text-align: center; font-size: 24px; margin-bottom: 20px;">Election is Now LIVE!</h2>
                    <p style="color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">The following election has officially started and is ready for your vote:</p>
                    
                    <div style="background-color: #eff6ff; padding: 24px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #2563eb; text-align: center;">
                        <h3 style="color: #1e40af; margin: 0; font-size: 20px;">{election_title}</h3>
                        <p style="color: #3b82f6; font-size: 14px; margin: 10px 0 0; font-weight: 600;">STATUS: ACTIVE</p>
                    </div>
                    
                    <p style="color: #475569; line-height: 1.6; text-align: center;">Exercise your democratic right today. Your vote is secure, anonymous, and vital to the process.</p>
                    
                    <div style="text-align: center; margin-top: 40px; margin-bottom: 40px;">
                        <a href="http://localhost:3000" style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Cast Your Vote Now</a>
                    </div>
                    
                    <div style="border-top: 1px solid #e2e8f0; padding-top: 30px; text-align: center;">
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                            This is an automated notification from the Secure Voting System.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """,
        subtype="html",
    )
    
    conf = get_mail_config()
    fm = FastMail(conf)
    await fm.send_message(message)

async def send_vote_confirmation(email: str, election_title: str, candidate_name: str):
    """Send confirmation email after successful vote"""
    import time as time_module
    timestamp = time_module.strftime("%Y-%m-%d %H:%M:%S", time_module.localtime())
    
    message = MessageSchema(
        subject="Vote Confirmation - Secure Voting Ledger",
        recipients=[email],
        body=f"""
        <html>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0fdf4; padding: 20px;">
                <div style="max-width: 600px; background-color: white; padding: 40px; border-radius: 16px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-top: 6px solid #10b981;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <span style="font-size: 48px;">✅</span>
                    </div>
                    <h2 style="color: #064e3b; text-align: center; font-size: 24px; margin-bottom: 10px;">Vote Successfully Cast!</h2>
                    <p style="color: #065f46; text-align: center; font-size: 16px; margin-bottom: 30px;">Your selection has been securely recorded in the digital ledger.</p>
                    
                    <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; margin: 30px 0; border: 1px solid #e2e8f0;">
                        <table style="width: 100%; font-size: 14px; color: #334155;">
                            <tr>
                                <td style="padding: 8px 0; color: #64748b;"><strong>Election:</strong></td>
                                <td style="padding: 8px 0; color: #1e293b;">{election_title}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b;"><strong>Candidate:</strong></td>
                                <td style="padding: 8px 0; color: #1e293b;">{candidate_name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b;"><strong>Timestamp:</strong></td>
                                <td style="padding: 8px 0; color: #1e293b;">{timestamp}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0 0 0;" colspan="2">
                                    <span style="background-color: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Verified & Recorded</span>
                                </td>
                            </tr>
                        </table>
                    </div>
                    
                    <p style="color: #475569; font-size: 14px; line-height: 1.6; text-align: center;">Thank you for participating in this election. Your contribution to digital democracy ensures a fair and transparent outcome.</p>
                    
                    <div style="border-top: 1px solid #e2e8f0; padding-top: 30px; margin-top: 30px; text-align: center;">
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                            This receipt is for your records. Your identity remains anonymous in the public results.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """,
        subtype="html",
    )
    
    conf = get_mail_config()
    fm = FastMail(conf)
    await fm.send_message(message)