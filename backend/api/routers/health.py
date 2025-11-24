from typing import Dict

from asgiref.sync import sync_to_async
from django.db import connection
from django.db.utils import OperationalError
from fastapi import APIRouter, HTTPException, status

router = APIRouter()


def check_db_connection():
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            return True
    except OperationalError:
        return False


@router.get("/", response_model=Dict[str, str])
async def health_check():
    """
    Check the health of the application and its dependencies.
    """
    db_connected = await sync_to_async(check_db_connection)()

    if not db_connected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed",
        )

    return {"status": "healthy", "database": "connected"}
