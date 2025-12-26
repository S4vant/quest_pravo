
from fastapi import Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi import APIRouter
from typing import Optional
templates = Jinja2Templates(directory="templates")

router = APIRouter(tags=["Templates"], prefix="")

@router.get("/")
def index(request: Request):
    print("index")
    return templates.TemplateResponse(
    "index.html",
            {
                "request": request,
                "title": "Правовой квест",
            }
                )
@router.get("/quest", response_class=HTMLResponse)
def quest(request: Request):
    return templates.TemplateResponse(
        "quest.html",
        {"request": request}
                            )

@router.get("/stage/{stage_number}", response_class=HTMLResponse)
def stage_1(request: Request, stage_number: int):
    attempt_id = request.session.get("attempt_id")

    if not attempt_id:
        return RedirectResponse("/quest")
    page = f"stage_{stage_number}.html"
    return templates.TemplateResponse(
        page,
        {"request": request}
    )

