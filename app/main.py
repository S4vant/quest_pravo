from fastapi import FastAPI, Request, Form

from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from .routers.templates import router as templates
from .routers.api import router as api
from starlette.middleware.sessions import SessionMiddleware
from .db import engine, Base




app = FastAPI(title="Правоведческий квест")

# Секретный ключ для подписи cookies
app.add_middleware(
    SessionMiddleware,
    secret_key="SUPER_SECRET_KEY_CHANGE_ME",
    same_site="lax",
    https_only=False  # True если https
)
app.include_router(templates)
app.include_router(api)
# --- Инициализация БД ---
Base.metadata.create_all(bind=engine)


# --- Static и templates ---
app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

