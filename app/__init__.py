"""Application factory."""
import os
from pathlib import Path

from flask import Flask
from flask_cors import CORS
from flask_login import LoginManager
from authlib.integrations.flask_client import OAuth

from app.config import config_by_name

# ── Extensions (initialised in create_app) ───────────────────────────────────
login_manager = LoginManager()
oauth         = OAuth()


def create_app(config_name: str = None) -> Flask:
    """Create and configure the Flask application."""
    config_name = config_name or os.environ.get("FLASK_ENV", "default")

    app = Flask(
        __name__,
        static_folder="static",
        template_folder="templates",
    )
    app.config.from_object(config_by_name[config_name])

    CORS(app)

    # CSP: allow unsafe-eval for html2pdf.js (template-editor) and third-party scripts.
    # Some browsers/extensions add stricter CSP; we explicitly allow eval for compatibility.
    @app.after_request
    def add_csp(response):
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: blob: https:; "
            "connect-src 'self'"
        )
        response.headers["Content-Security-Policy"] = csp
        return response

    _init_db(app)
    _init_login_manager(app)
    _init_oauth(app)
    _register_blueprints(app)

    return app


# ── Extension initialisers ────────────────────────────────────────────────────

def _init_db(app: Flask) -> None:
    from app.models.user import db
    from app.models.resume_db import Resume  # noqa: F401 — ensure table is created

    # Ensure data/ exists
    data_dir = Path(__file__).parent.parent / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    # Resolve any relative sqlite:/// path to absolute BEFORE db.init_app()
    # so Flask-SQLAlchemy locks in the correct URI.
    db_url = app.config.get("SQLALCHEMY_DATABASE_URI", "")
    if db_url.startswith("sqlite:///") and not db_url.startswith("sqlite:////"):
        rel      = db_url[len("sqlite:///"):]
        abs_path = (Path(__file__).parent.parent / rel).resolve()
        abs_path.parent.mkdir(parents=True, exist_ok=True)
        app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{abs_path}"

    db.init_app(app)

    with app.app_context():
        db.create_all()


def _init_login_manager(app: Flask) -> None:
    login_manager.init_app(app)
    login_manager.login_view = "pages.login"       # redirect here when @login_required
    login_manager.login_message = "Please sign in to continue."

    @login_manager.user_loader
    def load_user(user_id: str):
        from app.models.user import User
        return User.query.get(int(user_id))


def _init_oauth(app: Flask) -> None:
    oauth.init_app(app)

    # ── Google ─────────────────────────────────────────────────────────────
    if app.config.get("GOOGLE_CLIENT_ID"):
        oauth.register(
            name               = "google",
            client_id          = app.config["GOOGLE_CLIENT_ID"],
            client_secret      = app.config["GOOGLE_CLIENT_SECRET"],
            server_metadata_url= "https://accounts.google.com/.well-known/openid-configuration",
            client_kwargs      = {"scope": "openid email profile"},
        )

    # ── Facebook ────────────────────────────────────────────────────────────
    if app.config.get("FACEBOOK_APP_ID"):
        oauth.register(
            name              = "facebook",
            client_id         = app.config["FACEBOOK_APP_ID"],
            client_secret     = app.config["FACEBOOK_APP_SECRET"],
            authorize_url     = "https://www.facebook.com/dialog/oauth",
            access_token_url  = "https://graph.facebook.com/oauth/access_token",
            api_base_url      = "https://graph.facebook.com/v18.0/",
            client_kwargs     = {"scope": "email public_profile"},
        )


def _register_blueprints(app: Flask) -> None:
    from app.controllers.pages import pages_bp
    from app.controllers.api   import api_bp
    from app.controllers.auth  import auth_bp

    app.register_blueprint(pages_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(auth_bp)
