from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Required backend settings
    debug: bool
    secret_key: str

    # Database settings
    db_name: str
    db_user: str
    db_password: str
    db_host: str
    db_port: int

    allowed_hosts: List[str]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
