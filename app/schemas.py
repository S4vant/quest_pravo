from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel


class AttemptInfo(BaseModel):
    id: int
    started_at: datetime
    finished_at: Optional[datetime]
    total_score: int
    status: str


class UserProfile(BaseModel):
    full_name: str
    email: str
    attempts: List[AttemptInfo]
    
class StartQuest(BaseModel):
    full_name: str
    email: str
