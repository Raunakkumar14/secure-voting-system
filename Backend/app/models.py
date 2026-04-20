from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from .database import Base
from datetime import datetime
import enum

class ElectionStatus(str, enum.Enum):
    upcoming = "upcoming"
    active = "active"
    ended = "ended"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    role = Column(String, default="voter")


class Election(Base):
    __tablename__ = "elections"

    id = Column(Integer, primary_key=True)
    title = Column(String)
    description = Column(String)
    status = Column(String, default="upcoming")  # upcoming, active, ended
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(String, nullable=True)
    election_id = Column(Integer, ForeignKey("elections.id"), nullable=True)


class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    election_id = Column(Integer, ForeignKey("elections.id"), nullable=True)