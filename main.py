from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from .routers.templates import router as templates

from .app.db import engine, Base


app = FastAPI(title="Правоведческий квест")

app.include_router(templates)

# --- Инициализация БД ---
Base.metadata.create_all(bind=engine)


# --- Static и templates ---
app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")