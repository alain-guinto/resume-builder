"""Resume DB model — user-specific resume storage."""
from datetime import datetime

from app.models.user import db


class Resume(db.Model):
    """User resume record with JSON data."""

    __tablename__ = "resumes"

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    name       = db.Column(db.String(120), nullable=False, default="My Resume")
    data       = db.Column(db.JSON, nullable=False)
    is_primary = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("User", backref=db.backref("resumes", lazy="dynamic"))
