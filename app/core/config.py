"""
Application Configuration
Loads and validates environment variables using Pydantic Settings
"""

from typing import List
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    APP_NAME: str = "Coherence OAuth2 API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database (MongoDB)
    MONGODB_URL: str = Field(..., description="MongoDB connection URL")
    DATABASE_NAME: str = Field(..., description="MongoDB database name")

    # Security
    SECRET_KEY: str = Field(..., min_length=32, description="Secret key for JWT encoding")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Google OAuth2
    GOOGLE_CLIENT_ID: str = Field(..., description="Google OAuth2 Client ID")
    GOOGLE_CLIENT_SECRET: str = Field(..., description="Google OAuth2 Client Secret")
    GOOGLE_REDIRECT_URI: str = Field(..., description="Google OAuth2 Redirect URI")

    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # Session
    SESSION_SECRET_KEY: str = Field(..., min_length=32, description="Secret key for session management")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @field_validator("ALLOWED_ORIGINS")
    @classmethod
    def parse_cors_origins(cls, v: str) -> List[str]:
        """Parse comma-separated CORS origins into a list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    @property
    def cors_origins(self) -> List[str]:
        """Get parsed CORS origins"""
        origins = self.ALLOWED_ORIGINS
        if isinstance(origins, str):
            return [origin.strip() for origin in origins.split(",")]
        return origins


# Global settings instance
settings = Settings()
