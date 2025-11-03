import os, django
from fastapi import FastAPI
from .routers import expenses, health

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

app = FastAPI(title="Expense Splitter API")
app.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
app.include_router(health.router, prefix="/health", tags=["health"])
