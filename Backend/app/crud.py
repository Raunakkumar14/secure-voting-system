from . import models
from .auth import hash_password, verify_password
from datetime import datetime
from email_validator import validate_email, EmailNotValidError

# Common typos for major email providers
COMMON_TYPOS = ["gmai.com", "gmal.com", "yaho.com", "outloo.com", "hotmai.com", "gmaill.com", "gmial.com"]

def create_user(db, user):
    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def login_user(db, email, password):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user

def get_all_voter_emails(db):
    """Fetch all voter emails for notifications"""
    return [u.email for u in db.query(models.User).filter(models.User.role == "voter").all()]


def get_candidates(db):
    return db.query(models.Candidate).all()


def create_candidate(db, candidate):
    new_candidate = models.Candidate(
        name=candidate.name,
        description=candidate.description
    )
    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)
    return new_candidate


def update_candidate(db, candidate_id, candidate):
    db_candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not db_candidate:
        return None
    
    if candidate.name:
        db_candidate.name = candidate.name
    if candidate.description:
        db_candidate.description = candidate.description
    
    db.commit()
    db.refresh(db_candidate)
    return db_candidate


def delete_candidate(db, candidate_id):
    db_candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not db_candidate:
        return False
    
    db.delete(db_candidate)
    db.commit()
    return True


def create_vote(db, user_id, candidate_id):
    # 🚫 Check if user already voted
    existing_vote = db.query(models.Vote).filter(
        models.Vote.user_id == user_id
    ).first()

    if existing_vote:
        return None  # already voted

    # Get candidate to find election_id
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    election_id = candidate.election_id if candidate else None

    new_vote = models.Vote(
        user_id=user_id,
        candidate_id=candidate_id,
        election_id=election_id
    )

    db.add(new_vote)
    db.commit()
    db.refresh(new_vote)
    return new_vote

def get_vote_counts(db):
    candidates = db.query(models.Candidate).all()
    result = {}

    for c in candidates:
        count = db.query(models.Vote).filter(
            models.Vote.candidate_id == c.id
        ).count()
        result[c.name] = count

    return result

def get_stats(db):
    return {
        "total_users": db.query(models.User).count(),
        "total_votes": db.query(models.Vote).count(),
        "total_candidates": db.query(models.Candidate).count(),
    }

def reset_password(db, email, new_password):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        return None
    user.password = hash_password(new_password)
    db.commit()
    db.refresh(user)
    return user

def email_exists(db, email):
    user = db.query(models.User).filter(models.User.email == email).first()
    return user is not None

def is_valid_email(email: str):
    """Helper to validate email format, deliverability, and common typos."""
    try:
        # 1. Check for common typos first
        domain = email.split('@')[-1].lower() if '@' in email else ""
        if domain in COMMON_TYPOS:
            return False, f"Possible typo in domain: '{domain}'. Did you mean '{domain.replace('gmai.com', 'gmail.com').replace('yaho.com', 'yahoo.com')}'?"

        # 2. Check deliverability (MX records)
        email_info = validate_email(email, check_deliverability=True)
        return True, email_info.normalized
    except EmailNotValidError as e:
        return False, str(e)

def get_user_profile(db, user_id):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "is_verified": True  # All registered users are verified (OTP verified)
    }

def change_user_password(db, user_id, new_password):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None
    user.password = hash_password(new_password)
    db.commit()
    db.refresh(user)
    return user

def update_user_profile(db, user_id, name=None, email=None):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None
    if name:
        user.name = name
    if email:
        user.email = email
    db.commit()
    db.refresh(user)
    return user


# Election Management
def create_election(db, election):
    new_election = models.Election(
        title=election.title,
        description=election.description,
        status="upcoming"
    )
    db.add(new_election)
    db.commit()
    db.refresh(new_election)
    return new_election


def get_current_election(db):
    return db.query(models.Election).filter(
        models.Election.status == "active"
    ).first()


def get_election(db, election_id):
    return db.query(models.Election).filter(models.Election.id == election_id).first()


def get_all_elections(db):
    return db.query(models.Election).all()


def start_election(db, election_id):
    election = db.query(models.Election).filter(models.Election.id == election_id).first()
    if not election:
        return None
    
    if election.status != "upcoming":
        return None  # Can only start upcoming elections
    
    election.status = "active"
    election.started_at = datetime.utcnow()
    db.commit()
    db.refresh(election)
    return election


def end_election(db, election_id):
    election = db.query(models.Election).filter(models.Election.id == election_id).first()
    if not election:
        return None
    
    if election.status != "active":
        return None  # Can only end active elections
    
    election.status = "ended"
    election.ended_at = datetime.utcnow()
    db.commit()
    db.refresh(election)
    return election

# Session Management
def create_session(db, user_id, jti, device_info, ip_address):
    """Create a new user session record"""
    session = models.UserSession(
        user_id=user_id,
        token_jti=jti,
        device_info=device_info,
        ip_address=ip_address
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def is_session_active(db, jti):
    """Check if a specific session JTI is still active"""
    session = db.query(models.UserSession).filter(models.UserSession.token_jti == jti).first()
    return session is not None and session.is_active

def get_user_sessions(db, user_id):
    """Get all active sessions for a user"""
    return db.query(models.UserSession).filter(
        models.UserSession.user_id == user_id,
        models.UserSession.is_active == True
    ).order_by(models.UserSession.created_at.desc()).all()

def revoke_session(db, jti):
    """Deactivate a specific session"""
    session = db.query(models.UserSession).filter(models.UserSession.token_jti == jti).first()
    if session:
        session.is_active = False
        db.commit()
        return True
    return False

def revoke_all_user_sessions(db, user_id, except_jti=None):
    """Deactivate all sessions for a user, optionally keeping one active"""
    query = db.query(models.UserSession).filter(models.UserSession.user_id == user_id)
    if except_jti:
        query = query.filter(models.UserSession.token_jti != except_jti)
    
    query.update({"is_active": False}, synchronize_session=False)
    db.commit()