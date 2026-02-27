"""Export log — tracks PDF/DOCX downloads per user for usage limits."""
from datetime import datetime

from app.models.user import db


class ExportLog(db.Model):
    """Records each resume export (PDF or DOCX) for the user."""

    __tablename__ = "export_logs"

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
