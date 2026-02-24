"""Application configuration."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent

# Load .env file if present (development convenience)
try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / ".env")
except ImportError:
    pass


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "change-me-in-production-please")
    DATA_FILE  = BASE_DIR / "data" / "resume_data.json"
    DEBUG      = False
    TESTING    = False

    # ── Database ──────────────────────────────────────────────────────────────
    SQLALCHEMY_DATABASE_URI     = os.environ.get(
        "DATABASE_URL",
        f"sqlite:///{BASE_DIR / 'data' / 'resumeforge.db'}",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS      = {
        "connect_args": {"check_same_thread": False},  # required for SQLite + Flask threading
        "pool_pre_ping": True,                          # recover from dropped connections
    }

    # ── Google OAuth ──────────────────────────────────────────────────────────
    GOOGLE_CLIENT_ID     = os.environ.get("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")

    # ── Facebook OAuth ────────────────────────────────────────────────────────
    FACEBOOK_APP_ID     = os.environ.get("FACEBOOK_APP_ID", "")
    FACEBOOK_APP_SECRET = os.environ.get("FACEBOOK_APP_SECRET", "")

    # ── Session ───────────────────────────────────────────────────────────────
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    REMEMBER_COOKIE_HTTPONLY = True


class DevelopmentConfig(Config):
    DEBUG = True
    SESSION_COOKIE_SECURE = False


class ProductionConfig(Config):
    DEBUG = False
    SESSION_COOKIE_SECURE = True    # enforce HTTPS in production


config_by_name = {
    "development": DevelopmentConfig,
    "production":  ProductionConfig,
    "default":     DevelopmentConfig,
}
