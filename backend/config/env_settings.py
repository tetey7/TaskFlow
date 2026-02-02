from typing import List, Optional

from pydantic import ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Required backend settings
    debug: bool = False
    secret_key: str

    # Database settings (optional if DATABASE_URL is provided)
    db_name: Optional[str] = None
    db_user: Optional[str] = None
    db_password: Optional[str] = None
    db_host: Optional[str] = None
    db_port: Optional[int] = None

    allowed_hosts: List[str] = []
    cors_allowed_origins: List[str] = []


settings = Settings()
