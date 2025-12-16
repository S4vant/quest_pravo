
from fastapi import Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi import APIRouter
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