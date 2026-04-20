from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class VoteCreate(BaseModel):
    candidate_id: int

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class OTPRequest(BaseModel):
    email: str

class OTPVerifyRequest(BaseModel):
    email: str
    otp: str

class PasswordResetRequest(BaseModel):
    email: str
    otp: str
    new_password: str

# Candidate Management
class CandidateCreate(BaseModel):
    name: str
    description: str = None

class CandidateUpdate(BaseModel):
    name: str = None
    description: str = None

class CandidateResponse(BaseModel):
    id: int
    name: str
    description: str = None

# Election Management
class ElectionCreate(BaseModel):
    title: str
    description: str = None

class ElectionStatusUpdate(BaseModel):
    status: str  # "upcoming", "active", "ended"

class ElectionResponse(BaseModel):
    id: int
    title: str
    description: str = None
    status: str
    created_at: str = None
    started_at: str = None
    ended_at: str = None

# User Profile Management
class UserProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_verified: bool = True

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

class ProfileUpdateRequest(BaseModel):
    name: str
    email: str

class ProfileUpdateOTPRequest(BaseModel):
    email: str
    otp: str