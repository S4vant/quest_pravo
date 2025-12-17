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

    # Прогресс этапов
    stage_progress = relationship(
        "StageProgress",
        back_populates="attempt",
        cascade="all, delete-orphan"
    )

    # Итог этапов
    stage_results = relationship(
        "StageResult",
        back_populates="attempt",
        cascade="all, delete-orphan"
    )

    answers = relationship(
        "AnswerLog",
        back_populates="attempt",
        cascade="all, delete-orphan"
    )

class StageResult(Base):
    __tablename__ = "stage_results"

    id = Column(Integer, primary_key=True)
    attempt_id = Column(Integer, ForeignKey("attempts.id"))

    stage_number = Column(Integer)
    stage_title = Column(String)
    score = Column(Integer)

    attempt = relationship(
        "Attempt",
        back_populates="stage_results"
    )

class AnswerLog(Base):
    __tablename__ = "answer_logs"

    id = Column(Integer, primary_key=True)

    attempt_id = Column(Integer, ForeignKey("attempts.id"))

    stage_number = Column(Integer)
    question_number = Column(Integer)

    is_correct = Column(Boolean)

    created_at = Column(DateTime, default=datetime.utcnow)

    attempt = relationship(
        "Attempt",
        back_populates="answers"
    )


class StageProgress(Base):
    __tablename__ = "stage_progress"

    id = Column(Integer, primary_key=True)
    attempt_id = Column(Integer, ForeignKey("attempts.id"))
    stage_number = Column(Integer)

    status = Column(String, default="open")
    score = Column(Integer, default=0)

    started_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)

    attempt = relationship(
        "Attempt",
        back_populates="stage_progress"
    )

# class AttemptAnswer(Base):
#     __tablename__ = "attempt_answers"

#     id = Column(Integer, primary_key=True)
#     attempt_id = Column(Integer, ForeignKey("attempts.id"), nullable=False)

#     stage = Column(Integer, nullable=False)  # 1,2,3...
#     is_correct = Column(Boolean, nullable=False)
#     payload = Column(JSON, nullable=False)

#     created_at = Column(DateTime, default=datetime.utcnow)