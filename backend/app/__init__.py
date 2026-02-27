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

    # CORS: allow frontend (Next.js) to call API with credentials (cookies)
    origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
    if os.environ.get("FRONTEND_URL"):
        origins.append(os.environ["FRONTEND_URL"])
    CORS(app, supports_credentials=True, origins=origins)

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

def _seed_plans(app: Flask) -> None:
    """Seed subscription plans if not present. Migrate users.plan_id if needed."""
    from sqlalchemy import text
    from app.models.subscription_plan import SubscriptionPlan
    from app.models.user import User, db

    # Add plan_id to users if missing (migration for existing DBs)
    try:
        from sqlalchemy import inspect as sa_inspect
        insp = sa_inspect(db.engine)
        if "users" in insp.get_table_names():
            cols = [c["name"] for c in insp.get_columns("users")]
            if "plan_id" not in cols:
                db.session.execute(text("ALTER TABLE users ADD COLUMN plan_id INTEGER DEFAULT 1"))
                db.session.commit()
    except Exception:
        pass

    if SubscriptionPlan.query.first():
        return

    plans = [
        SubscriptionPlan(
            id=1,
            name="Free",
            slug="free",
            description="Get started with the basics",
            price_cents=0,
            interval=None,
            features={"resumes_limit": 1, "exports_per_month": 3, "templates_unlocked": ["classic", "simple_ats"]},
            is_active=True,
            sort_order=0,
        ),
        SubscriptionPlan(
            id=2,
            name="7-Day Access",
            slug="pro_7day",
            description="Perfect for a quick job search sprint",
            price_cents=299,
            interval="week",
            features={"resumes_limit": 5, "exports_per_month": 10, "templates_unlocked": ["all"]},
            is_active=True,
            sort_order=1,
        ),
        SubscriptionPlan(
            id=3,
            name="Monthly Pro",
            slug="pro_monthly",
            description="For serious job seekers",
            price_cents=900,
            interval="month",
            features={"resumes_limit": 10, "exports_per_month": 50, "templates_unlocked": ["all"]},
            is_active=True,
            sort_order=2,
        ),
        SubscriptionPlan(
            id=4,
            name="Enterprise",
            slug="enterprise",
            description="Unlimited access",
            price_cents=2900,
            interval="month",
            features={"resumes_limit": None, "exports_per_month": None, "templates_unlocked": ["all"]},
            is_active=True,
            sort_order=3,
        ),
    ]
    for p in plans:
        db.session.merge(p)
    db.session.commit()

    # Ensure existing users have plan_id
    User.query.filter(User.plan_id == None).update({User.plan_id: 1})
    db.session.commit()


def _seed_promo_codes(app: Flask) -> None:
    """Seed promo codes if not present."""
    from datetime import datetime
    from app.models.promo_code import PromoCode
    from app.models.user import db

    if PromoCode.query.first():
        return

    valid_from = datetime(2025, 1, 1)
    valid_until = datetime(2027, 12, 31, 23, 59, 59)
    codes = [
        PromoCode(id=1, code="SAVE50", discount_type="percent", discount_value=50, currency=None,
                  applicable_plan_ids=None, max_redemptions=None, max_redemptions_per_user=1,
                  valid_from=valid_from, valid_until=valid_until, is_active=True,
                  description="50% off any plan"),
        PromoCode(id=2, code="SAVE40", discount_type="percent", discount_value=40, currency=None,
                  applicable_plan_ids=None, max_redemptions=None, max_redemptions_per_user=1,
                  valid_from=valid_from, valid_until=valid_until, is_active=True,
                  description="40% off any plan"),
        PromoCode(id=3, code="FLAT5", discount_type="fixed", discount_value=500, currency="usd",
                  applicable_plan_ids=None, max_redemptions=None, max_redemptions_per_user=1,
                  valid_from=valid_from, valid_until=valid_until, is_active=True,
                  description="$5 off"),
        PromoCode(id=4, code="PRO20", discount_type="percent", discount_value=20, currency=None,
                  applicable_plan_ids=[3], max_redemptions=None, max_redemptions_per_user=1,
                  valid_from=valid_from, valid_until=valid_until, is_active=True,
                  description="20% off Monthly Pro only"),
        PromoCode(id=5, code="FLAT2", discount_type="fixed", discount_value=200, currency="usd",
                  applicable_plan_ids=None, max_redemptions=None, max_redemptions_per_user=1,
                  valid_from=valid_from, valid_until=valid_until, is_active=True,
                  description="$2 off"),
    ]
    for c in codes:
        db.session.merge(c)
    db.session.commit()


def _init_db(app: Flask) -> None:
    from app.models.user import db
    from app.models.subscription_plan import SubscriptionPlan  # noqa: F401
    from app.models.resume_db import Resume  # noqa: F401 — ensure table is created
    from app.models.export_log import ExportLog  # noqa: F401 — ensure table is created
    from app.models.promo_code import PromoCode, PromoCodeRedemption  # noqa: F401

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
        _seed_plans(app)
        _seed_promo_codes(app)


def _init_login_manager(app: Flask) -> None:
    login_manager.init_app(app)
    login_manager.login_view = "pages.landing"     # redirect to hero (not login) when @login_required
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
