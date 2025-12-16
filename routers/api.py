from fastapi import Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi import APIRouter, Depends
from ..app.schemas import StartQuest
from ..app.db import get_db
from sqlalchemy.orm import Session
from ..app.models import User, Attempt
templates = Jinja2Templates(directory="templates")

router = APIRouter(tags=["api"], prefix="/api")


@router.post("/profile")
def get_profile(data: StartQuest, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=data.email).first()

    # пользователь НЕ найден → создаём
    if not user:
        user = User(
            full_name=data.full_name,
            email=data.email
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "new_user": True,
            "profile": {
                "full_name": user.full_name,
                "email": user.email,
                "attempts": []
            }
        }

    # пользователь найден → возвращаем профиль
    attempts = []
    for a in user.attempts:
        attempts.append({
            "id": a.id,
            "started_at": a.started_at,
            "finished_at": a.finished_at,
            "total_score": a.total_score,
            "status": a.status
        })

    return {
        "new_user": False,
        "profile": {
            "full_name": user.full_name,
            "email": user.email,
            "attempts": attempts
        }
    }

@router.post("/api/start_attempt")
def start_attempt(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=email).first()

    # запрет повторного прохождения
    finished = db.query(Attempt).filter_by(
        user_id=user.id,
        status="finished"
    ).first()

    if finished:
        return {"error": "Вы уже завершили этот квест"}

    attempt = Attempt(user_id=user.id)
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return {"attempt_id": attempt.id}