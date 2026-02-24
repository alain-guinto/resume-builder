"""User model — supports email/password + Google/Facebook OAuth."""
from datetime import datetime

from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

db = SQLAlchemy()


class User(UserMixin, db.Model):
    __tablename__ = "users"

    id            = db.Column(db.Integer, primary_key=True)
    email         = db.Column(db.String(120), unique=True, nullable=False, index=True)
    name          = db.Column(db.String(120), nullable=True)
    password_hash = db.Column(db.String(256), nullable=True)   # null for OAuth-only users
    google_id     = db.Column(db.String(120), unique=True, nullable=True, index=True)
    facebook_id   = db.Column(db.String(120), unique=True, nullable=True, index=True)
    avatar_url    = db.Column(db.String(512),  nullable=True)
    is_active     = db.Column(db.Boolean, default=True, nullable=False)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    last_login_at = db.Column(db.DateTime, nullable=True)

    # ── Password helpers ──────────────────────────────────────────────────────
    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    def has_password(self) -> bool:
        return self.password_hash is not None

    # ── Display helpers ───────────────────────────────────────────────────────
    @property
    def display_name(self) -> str:
        return self.name or self.email.split("@")[0]

    def __repr__(self) -> str:  # pragma: no cover
        return f"<User id={self.id} email={self.email!r}>"
