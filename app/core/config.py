"""
Application Configuration
Loads and validates environment variables using Pydantic Settings
"""

from typing import List, Optional
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

    # Email Configuration (SMTP) - Optional for invitation emails
    SMTP_HOST: Optional[str] = Field(default="smtp.gmail.com", description="SMTP server hostname")
    SMTP_PORT: Optional[int] = Field(default=587, description="SMTP server port")
    SMTP_USER: Optional[str] = Field(default=None, description="SMTP username (email)")
    SMTP_PASSWORD: Optional[str] = Field(default=None, description="SMTP password or app password")
    FROM_EMAIL: Optional[str] = Field(default=None, description="Sender email address")
    FROM_NAME: Optional[str] = Field(default="Budget Intelligence Platform", description="Sender display name")

    # PRAHARI — Gemini AI Intelligence Engine
    GEMINI_API_KEY: Optional[str] = Field(default=None, description="Google Gemini API key for AI narratives")

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
