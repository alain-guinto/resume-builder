"""Subscription model — tracks user subscriptions with status and period."""
from datetime import datetime

from app.models.user import db


class Subscription(db.Model):
    """User subscription with status and billing period."""

    __tablename__ = "subscriptions"

    id                      = db.Column(db.Integer, primary_key=True)
    user_id                 = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_id                 = db.Column(db.Integer, db.ForeignKey("subscription_plans.id"), nullable=True)
    status                  = db.Column(db.String(30), nullable=False, default="active", index=True)
    payment_provider        = db.Column(db.String(30), nullable=False, default="manual")
    provider_customer_id    = db.Column(db.String(120), nullable=True)
    provider_subscription_id = db.Column(db.String(120), unique=True, nullable=True, index=True)
    current_period_start    = db.Column(db.DateTime, nullable=True)
    current_period_end      = db.Column(db.DateTime, nullable=True)
    cancel_at_period_end    = db.Column(db.Boolean, nullable=False, default=False)
    cancelled_at            = db.Column(db.DateTime, nullable=True)
    created_at              = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at              = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
