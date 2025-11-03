from fastapi import FastAPI
from .routers import expenses

app = FastAPI(title="Expense Splitter API")

app.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
