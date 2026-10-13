from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./leadflow.db"
    jwt_secret: str = "dev-only-change-me-use-32-characters"
    access_token_expire_minutes: int = 480
    cors_origins: list[str] | str = ["http://localhost:3000"]
    seed_user_email: str = "demo@leadflow.dev"
    seed_user_password: str = "demo1234"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_origins(cls, value: object) -> object:
        if isinstance(value, str) and not value.startswith("["):
            return [origin.strip() for origin in value.split(",")]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
