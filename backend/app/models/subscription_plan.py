"""Subscription plan model — plan limits persisted in DB."""
from datetime import datetime

from app.models.user import db


class SubscriptionPlan(db.Model):
    """Plan with limits for resumes and exports."""

    __tablename__ = "subscription_plans"

    id           = db.Column(db.Integer, primary_key=True)
    name         = db.Column(db.String(80), nullable=False)
    slug         = db.Column(db.String(40), unique=True, nullable=False, index=True)
    description  = db.Column(db.Text, nullable=True)
    price_cents  = db.Column(db.Integer, nullable=False, default=0)
    interval     = db.Column(db.String(20), nullable=True)  # week, month, year, null=free
    features     = db.Column(db.JSON, nullable=True)  # {resumes_limit, exports_per_month, ...}
    is_active    = db.Column(db.Boolean, default=True, nullable=False)
    sort_order   = db.Column(db.Integer, default=0, nullable=False)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at   = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def get_resumes_limit(self):
        """Return resumes_limit from features. None = unlimited."""
        f = self.features or {}
        return f.get("resumes_limit", 1)

    def get_exports_per_month(self):
        """Return exports_per_month from features. None = unlimited."""
        f = self.features or {}
        return f.get("exports_per_month", 3)
