from . import models
from .auth import hash_password, verify_password

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


def get_candidates(db):
    return db.query(models.Candidate).all()


def create_vote(db, vote):
    # 🚫 Check if user already voted
    existing_vote = db.query(models.Vote).filter(
        models.Vote.user_id == vote.user_id
    ).first()

    if existing_vote:
        return None  # already voted

    new_vote = models.Vote(
        user_id=vote.user_id,
        candidate_id=vote.candidate_id
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