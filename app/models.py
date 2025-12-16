from sqlalchemy import (
    Column, Integer, String, DateTime,
    ForeignKey, Boolean
)
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    attempts = relationship("Attempt", back_populates="user")


class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    started_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)

    total_score = Column(Integer, default=0)
    status = Column(String, default="in_progress")

    user = relationship("User", back_populates="attempts")
    stages = relationship("StageResult", back_populates="attempt")
    answers = relationship("AnswerLog", back_populates="attempt")


class StageResult(Base):
    __tablename__ = "stage_results"

    id = Column(Integer, primary_key=True)
    attempt_id = Column(Integer, ForeignKey("attempts.id"))

    stage_number = Column(Integer)  # 1..4
    stage_title = Column(String)
    score = Column(Integer)

    attempt = relationship("Attempt", back_populates="stages")

class AnswerLog(Base):
    __tablename__ = "answer_logs"

    id = Column(Integer, primary_key=True)
    attempt_id = Column(Integer, ForeignKey("attempts.id"))

    question_id = Column(String)
    selected_option = Column(String)
    is_correct = Column(Boolean)

    attempt = relationship("Attempt", back_populates="answers")
