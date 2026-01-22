from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from .db import get_db
from .models import User
def calc_question_score(wasted_time: int) -> int:
    if wasted_time <= 0:
        return 0
    return int(60 / wasted_time)

def update_user_rating(
    db: Session,
    user_id: int,
    old_time: int | None,
    new_time: int
):
    

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        print("User not found")
        return

    new_score = calc_question_score(new_time)

    if old_time:
        print("Old time:", old_time)
        old_score = calc_question_score(old_time)
    else:
        old_score = 0

    delta = new_score - old_score

    if delta > 0:
        print("Delta:", delta)
        user.rating += delta
        db.commit()
