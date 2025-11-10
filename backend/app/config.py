"""
Application Configuration
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # CORS Settings
    FRONTEND_URL: str = "http://localhost:9002"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:9002",
        "http://localhost:3000"
    ]

    # Firebase Admin SDK
    FIREBASE_SERVICE_ACCOUNT_PATH: str = "./firebase-service-account.json"

    # Google Gemini API
    GOOGLE_GEMINI_API_KEY: str

    # Razorpay
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str

    # Security
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True

    def get_allowed_origins(self) -> List[str]:
        """Parse and return allowed origins"""
        if isinstance(self.ALLOWED_ORIGINS, str):
            return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(',')]
        return self.ALLOWED_ORIGINS


# Global settings instance
settings = Settings()
