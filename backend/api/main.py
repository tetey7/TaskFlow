import os, django
from fastapi import FastAPI
from .routers import tasks, health

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

app = FastAPI(title="Expense Splitter API")
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
app.include_router(health.router, prefix="/health", tags=["health"])
