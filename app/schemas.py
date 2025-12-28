from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from pydantic import BaseModel, EmailStr

class StartAttempt(BaseModel):
    email: EmailStr


class AttemptInfo(BaseModel):
    id: int
    started_at: datetime
    finished_at: Optional[datetime]
    total_score: int
    status: str

class AttemptAnswer(BaseModel):
    stage: int
    is_correct: bool

class UserProfile(BaseModel):
    full_name: str
    email: str
    attempts: List[AttemptInfo]
    
class StartQuest(BaseModel):
    full_name: str
    email: str

class StageComplete(BaseModel):
    attempt_id: int
    stage_number: int

class QuestionResult(BaseModel):
    attempt_id: int
    correct: bool

class AnswerData(BaseModel):
    attempt_id: int
    stage_number: int
    question_number: int
    correct: bool
    wasted_time: int
