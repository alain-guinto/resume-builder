"""Promo code model — discount codes with validation rules."""
from datetime import datetime

from app.models.user import db


class PromoCode(db.Model):
    """Promo code with discount rules and validity window."""

    __tablename__ = "promo_codes"

    id                        = db.Column(db.Integer, primary_key=True)
    code                      = db.Column(db.String(40), unique=True, nullable=False, index=True)
    discount_type             = db.Column(db.String(20), nullable=False)  # percent, fixed
    discount_value            = db.Column(db.Integer, nullable=False)
    currency                  = db.Column(db.String(3), nullable=True)
    applicable_plan_ids       = db.Column(db.JSON, nullable=True)  # null = all plans
    max_redemptions           = db.Column(db.Integer, nullable=True)  # null = unlimited
    max_redemptions_per_user  = db.Column(db.Integer, nullable=False, default=1)
    valid_from                = db.Column(db.DateTime, nullable=True)
    valid_until                = db.Column(db.DateTime, nullable=True)
    is_active                 = db.Column(db.Boolean, default=True, nullable=False)
    description               = db.Column(db.String(255), nullable=True)
    created_at                = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at                = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PromoCodeRedemption(db.Model):
    """Tracks promo code usage per user for limit enforcement."""

    __tablename__ = "promo_code_redemptions"

    id              = db.Column(db.Integer, primary_key=True)
    promo_code_id   = db.Column(db.Integer, db.ForeignKey("promo_codes.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id         = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    payment_id      = db.Column(db.Integer, nullable=True)
    subscription_id = db.Column(db.Integer, nullable=True)
    discount_cents  = db.Column(db.Integer, nullable=False)
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)
