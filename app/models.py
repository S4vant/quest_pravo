from sqlalchemy import (
    Column, Integer, String, DateTime,
    ForeignKey, Boolean
)
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

import json



class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)

    rating = Column(Integer, default=0, nullable=False)
    attempts = relationship("Attempt", back_populates="user")


class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    started_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)

    status = Column(String, default="active")
    total_score = Column(Integer, default=0)

    user = relationship("User", back_populates="attempts")

    answers = relationship(
        "AnswerLog",
        back_populates="attempt",
        cascade="all, delete-orphan"
    )


class AnswerLog(Base):
    __tablename__ = "answer_logs"

    id = Column(Integer, primary_key=True)

    attempt_id = Column(Integer, ForeignKey("attempts.id"))

    stage_number = Column(Integer)
    question_number = Column(Integer)
    wasted_time = Column(Integer)
    is_correct = Column(Boolean)

    created_at = Column(DateTime, default=datetime.utcnow)

    attempt = relationship(
        "Attempt",
        back_populates="answers"
    )

