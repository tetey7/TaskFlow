import os

import django
from fastapi import FastAPI

from .routers import health, tasks

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

app = FastAPI(title="TaskFlow API")
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
app.include_router(health.router, prefix="/health", tags=["health"])
