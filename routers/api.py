from datetime import datetime
from fastapi import Request
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..app.schemas import StartQuest, AnswerData
from ..app.db import get_db
from ..app.models import User, Attempt, AnswerLog

templates = Jinja2Templates(directory="templates")
router = APIRouter(tags=["api"], prefix="/api")


@router.post("/profile")
def api_profile(
    data: StartQuest,
    request: Request,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter_by(email=data.email).first()

    if not user:
        user = User(
            full_name=data.full_name,
            email=data.email
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 🔥 СОХРАНЯЕМ В СЕССИЮ
    request.session["user_id"] = user.id
    request.session["full_name"] = user.full_name
    request.session["email"] = user.email

    return {"ok": True}

@router.get("/profile", response_class=HTMLResponse)
def profile_page(request: Request):
    return templates.TemplateResponse(
        "profile.html",
        {
            "request": request,
            "full_name": request.session.get("full_name"),
            "email": request.session.get("email")
        }
    )
@router.get("/debug-session")
def debug_session(request: Request):
    return dict(request.session)
@router.post("/start_attempt")
def start_attempt(request: Request, db: Session = Depends(get_db)):
    user_id = request.session.get("user_id")

    if not user_id:
        return JSONResponse({"error": "Нет активной сессии"}, status_code=401)

    attempt = db.query(Attempt).filter_by(
        user_id=user_id,
        status="active"
    ).first()

    if not attempt:
        attempt = Attempt(user_id=user_id)
        db.add(attempt)
        db.commit()
        db.refresh(attempt)

    # 🔥 сохраняем attempt_id в сессию
    request.session["attempt_id"] = attempt.id

    return {"ok": True}



def save_answer(
    stage_number: int,
    question_number: int,
    request: Request,
    data: dict,
    
    db: Session = Depends(get_db)
):
    """
    Универсальное сохранение ответа на вопрос любого этапа.
    Тело запроса: { "correct": true/false }
    """
    # проверяем сессию
    attempt_id = request.session.get("attempt_id")
    if not attempt_id:
        return JSONResponse({"error": "Попытка не найдена в сессии"}, status_code=400)

    # получаем объект attempt
    attempt = db.query(Attempt).filter_by(id=attempt_id).first()
    if not attempt:
        return JSONResponse({"error": "Попытка не найдена"}, status_code=404)

    is_correct = bool(data.get("correct"))
    
    # создаём запись в AnswerLog
    log = AnswerLog(
        attempt_id=attempt.id,
        stage_number=stage_number,
        question_number=question_number,
        is_correct=is_correct,
        created_at=datetime.utcnow()
    )
    istrue = not(db.query(AnswerLog).filter_by(attempt_id=attempt.id, stage_number=stage_number, question_number=question_number).first())
    db.add(log)
    if istrue:
       

        db.commit()

    return {"saved": True, "total_score": attempt.total_score}

@router.post("/stage/{stage_number}/q/{question_number}")
async def log_answer(
    stage_number: int,
    question_number: int,
    request: Request,
    data: dict,
    wasted_time: int,
    db: Session = Depends(get_db)
):
    print(request.get("wasted_time"))
    answer = AnswerData(
        attempt_id=request.session.get("attempt_id"),
        stage_number=stage_number,
        question_number=question_number,
        wasted_time=wasted_time,
        correct=data.get("correct")
    )
    # Проверяем, есть ли уже запись

    existing = db.query(AnswerLog).filter(
        AnswerLog.attempt_id == answer.attempt_id,
        AnswerLog.stage_number == answer.stage_number,
        AnswerLog.question_number == answer.question_number
    ).first()

    if existing:
        # Если ответ уже есть и он был неверным, обновляем на верный
        if answer.correct and not existing.is_correct:
            existing.is_correct = True
            db.commit()
        # Иначе ничего не делаем (не создаем новый)
    else:
        # Создаем новую запись
        new_log = AnswerLog(
            attempt_id=answer.attempt_id,
            stage_number=answer.stage_number,
            question_number=answer.question_number,
            is_correct=answer.correct,
            wasted_time=answer.wasted_time,
        )
        db.add(new_log)
        db.commit()

    return {"saved": True}
@router.get("/user/progress")
async def user_progress(
    request: Request, 
    db: Session = Depends(get_db)
):
    
    Attempt_id = request.session.get("attempt_id")
    user_id = request.session.get("user_id")
    attempd = db.query(Attempt).filter_by(id=Attempt_id).first()
    
    # Получаем все ответы пользователя
    logs = db.query(AnswerLog).filter(AnswerLog.attempt_id == attempd.id).all()

    stages_dict = {}
    for log in logs:
        stages_dict.setdefault(log.stage_number, []).append({
            "q": log.question_number,
            "completed": log.is_correct
        })

    stages = [{"stage": stage, "questions": qs} for stage, qs in stages_dict.items()]
    print(stages)
    data = request.session.get("user_id")
    print(data)
    return {"stages": stages}