"""API controllers — resume CRUD, export, and parse endpoints."""
from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request, send_file
from sqlalchemy import func

from flask_login import current_user, login_required

from app.models.resume import ResumeModel
from app.models.resume_db import Resume
from app.models.export_log import ExportLog
from app.models.subscription_plan import SubscriptionPlan
from app.models.subscription import Subscription
from app.models.promo_code import PromoCode, PromoCodeRedemption
from app.models.user import db
from app.services.export_service import build_pdf, build_docx, PDF_ENGINE
from app.services.resume_parser import parse_resume_file

api_bp = Blueprint("api", __name__, url_prefix="/api")

# Template ID → display name mapping (matches frontend TEMPLATES)
TEMPLATE_NAMES = {
    "classic": "Classic Pro",
    "modern_simple": "Modern Edge",
    "chronological": "Executive",
    "two_col_ats": "Minimal Clean",
    "hybrid": "Tech Modern",
    "creative": "Creative Bold",
    "polished": "Corporate",
    "elegant": "Elegant Serif",
    "modern_with_photo": "Startup Vibe",
    "minimalist": "Minimalist",
    "functional": "Designer Pro",
    "simple_ats": "Academic",
    "teenager": "Compact",
    "internship": "Bold Impact",
    "entry_level": "Professional",
    "career_change": "Fresh Start",
}


def _get_user_plan():
    """Return current user's plan (Free by default)."""
    if not current_user.is_authenticated:
        return None
    plan = getattr(current_user, "plan", None) or SubscriptionPlan.query.get(
        getattr(current_user, "plan_id", None) or 1
    )
    return plan or SubscriptionPlan.query.get(1)


def _get_resume_data(resume_id=None):
    """Return resume data for current user, or file-based fallback for anonymous."""
    if current_user.is_authenticated:
        if resume_id:
            r = Resume.query.filter_by(id=resume_id, user_id=current_user.id).first()
        else:
            r = Resume.query.filter_by(user_id=current_user.id, is_primary=True).first()
        if r:
            return r.data
        return ResumeModel.default_data()
    return ResumeModel.load()


@api_bp.route("/resume", methods=["GET"])
def get_resume():
    """Return saved resume data (user-specific if logged in)."""
    resume_id = request.args.get("resume_id", type=int)
    return jsonify(_get_resume_data(resume_id=resume_id))


@api_bp.route("/resume", methods=["POST"])
def save_resume():
    """Persist resume data sent as JSON (user-specific if logged in)."""
    data = request.get_json()
    resume_id = request.args.get("resume_id", type=int)
    if current_user.is_authenticated:
        if resume_id:
            r = Resume.query.filter_by(id=resume_id, user_id=current_user.id).first()
        else:
            r = Resume.query.filter_by(user_id=current_user.id, is_primary=True).first()
        if r:
            r.data = data
        else:
            # Creating new resume — check plan limit
            plan = _get_user_plan()
            limit = plan.get_resumes_limit() if plan else 1
            if limit is not None:
                count = Resume.query.filter_by(user_id=current_user.id).count()
                if count >= limit:
                    return jsonify({
                        "error": "resume_limit_reached",
                        "message": f"Your {plan.name if plan else 'Free'} plan allows only {limit} resume(s). Upgrade to create more.",
                    }), 403
            r = Resume(user_id=current_user.id, name="My Resume", data=data or {}, is_primary=True)
            db.session.add(r)
        db.session.commit()
    else:
        ResumeModel.save(data)
    return jsonify({"success": True})


def _record_export():
    """Record an export for the current user (for usage tracking)."""
    if current_user.is_authenticated:
        log = ExportLog(user_id=current_user.id)
        db.session.add(log)
        db.session.commit()


def _check_export_limit():
    """Check if user has exceeded export limit. Returns (ok, error_response)."""
    if not current_user.is_authenticated:
        return True, None
    plan = _get_user_plan()
    limit = plan.get_exports_per_month() if plan else 3
    if limit is None:
        return True, None
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    used = ExportLog.query.filter(
        ExportLog.user_id == current_user.id,
        ExportLog.created_at >= month_start,
    ).count()
    if used >= limit:
        return False, (jsonify({
            "error": "export_limit_reached",
            "message": f"Your {plan.name if plan else 'Free'} plan allows only {limit} download(s) per month. Upgrade for more.",
        }), 403)
    return True, None


@api_bp.route("/export/pdf", methods=["POST"])
def export_pdf():
    """Generate and stream a PDF of the resume."""
    if PDF_ENGINE is None:
        return jsonify({
            "error": "No PDF engine installed. Run: pip install xhtml2pdf  OR  pip install weasyprint"
        }), 503

    ok, err = _check_export_limit()
    if not ok:
        return err

    data = request.get_json()
    buffer = build_pdf(data)
    filename = _resume_filename(data, "pdf")
    _record_export()
    return send_file(buffer, mimetype="application/pdf", as_attachment=True, download_name=filename)


@api_bp.route("/export/docx", methods=["POST"])
def export_docx():
    """Generate and stream a DOCX of the resume."""
    ok, err = _check_export_limit()
    if not ok:
        return err

    data = request.get_json()
    buffer = build_docx(data)
    filename = _resume_filename(data, "docx")
    _record_export()
    return send_file(
        buffer,
        mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        as_attachment=True,
        download_name=filename,
    )


@api_bp.route("/parse-resume", methods=["POST"])
def parse_resume():
    """Parse an uploaded resume file and return structured JSON data."""
    if "resume" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["resume"]
    if not file.filename:
        return jsonify({"error": "Empty filename"}), 400

    allowed_ext = {"pdf", "docx", "doc"}
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed_ext:
        return jsonify({"error": "Unsupported file type. Use PDF or DOCX."}), 415

    file_bytes = file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        return jsonify({"error": "File too large. Max 10 MB."}), 413

    import logging
    log = logging.getLogger(__name__)
    try:
        parsed = parse_resume_file(file_bytes, file.filename)
        c = parsed.get("contacts") or {}
        log.info("[parse-resume] Parsed: name=%r, experience=%d, skills=%d",
                 c.get("name"), len(parsed.get("experience") or []), len(parsed.get("skills") or []))
        return jsonify(parsed)
    except Exception as exc:
        log.exception("[parse-resume] Failed: %s", exc)
        return jsonify({"error": f"Parsing failed: {exc}"}), 500


def _resume_filename(data: dict, extension: str) -> str:
    name = data.get("contacts", {}).get("name", "Resume")
    return f"{name.replace(' ', '-')}.{extension}"


# ── User & Resume list (for SPA / Next.js frontend) ───────────────────────────

def _plan_to_dict(plan, include_price=False):
    """Serialize plan for API response."""
    if not plan:
        return None
    out = {
        "id": plan.id,
        "name": plan.name,
        "slug": plan.slug,
        "resumes_limit": plan.get_resumes_limit(),
        "exports_per_month": plan.get_exports_per_month(),
    }
    if include_price:
        out["price_cents"] = plan.price_cents
        out["interval"] = plan.interval
        out["description"] = plan.description or ""
        f = plan.features or {}
        out["templates_unlocked"] = f.get("templates_unlocked", ["classic", "simple_ats"])
    return out


@api_bp.route("/stats", methods=["GET"])
@login_required
def get_user_stats():
    """Return user stats: resumes count, total downloads, downloads this month, plan."""
    resumes_count = Resume.query.filter_by(user_id=current_user.id).count()

    total_exports = ExportLog.query.filter_by(user_id=current_user.id).count()

    # Exports this month (for plan limit enforcement)
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    exports_this_month = ExportLog.query.filter(
        ExportLog.user_id == current_user.id,
        ExportLog.created_at >= month_start,
    ).count()

    plan = _get_user_plan()

    return jsonify({
        "resumes_count": resumes_count,
        "exports_count": total_exports,
        "exports_this_month": exports_this_month,
        "plan": _plan_to_dict(plan),
    })


@api_bp.route("/me", methods=["GET"])
def get_current_user():
    """Return current user if authenticated, else 401."""
    if not current_user.is_authenticated:
        return jsonify({"error": "Not authenticated"}), 401
    return jsonify({
        "id": current_user.id,
        "name": current_user.name or current_user.email.split("@")[0],
        "email": current_user.email,
        "avatar_url": current_user.avatar_url,
    })


@api_bp.route("/resumes", methods=["POST"])
@login_required
def create_resume():
    """Create a new resume for the current user. Returns the created resume."""
    data = request.get_json() or {}
    plan = _get_user_plan()
    limit = plan.get_resumes_limit() if plan else 1
    if limit is not None:
        count = Resume.query.filter_by(user_id=current_user.id).count()
        if count >= limit:
            return jsonify({
                "error": "resume_limit_reached",
                "message": f"Your {plan.name if plan else 'Free'} plan allows only {limit} resume(s). Upgrade to create more.",
            }), 403
    # First resume is primary; subsequent ones are not
    existing_count = Resume.query.filter_by(user_id=current_user.id).count()
    r = Resume(
        user_id=current_user.id,
        name=data.get("contacts", {}).get("name") or "My Resume",
        data=data,
        is_primary=(existing_count == 0),
    )
    db.session.add(r)
    db.session.commit()
    template_id = (r.data or {}).get("template", "classic")
    return jsonify({
        "id": r.id,
        "user_id": r.user_id,
        "name": r.name,
        "template_id": template_id,
        "template_name": TEMPLATE_NAMES.get(template_id, "Classic Pro"),
        "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "is_primary": r.is_primary,
    })


@api_bp.route("/resumes", methods=["GET"])
@login_required
def list_resumes():
    """List all resumes for the current user."""
    resumes = Resume.query.filter_by(user_id=current_user.id).order_by(
        Resume.updated_at.desc()
    ).all()
    out = []
    for r in resumes:
        template_id = (r.data or {}).get("template", "classic")
        out.append({
            "id": r.id,
            "user_id": r.user_id,
            "name": r.name,
            "template_id": template_id,
            "template_name": TEMPLATE_NAMES.get(template_id, "Classic Pro"),
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "is_primary": r.is_primary,
        })
    return jsonify(out)


@api_bp.route("/checkout/free", methods=["POST"])
@login_required
def checkout_free():
    """Grant plan to user when total is $0 (e.g. promo code). Records promo redemption if promo was used."""
    try:
        data = request.get_json(silent=True) or {}
        plan_slug = data.get("plan_slug") or request.args.get("plan_slug")
        promo_code = (data.get("promo_code") or "").strip().replace(" ", "").upper()
        try:
            discount_cents = int(data.get("discount_cents") or 0)
        except (TypeError, ValueError):
            discount_cents = 0

        if not plan_slug:
            return jsonify({"error": "plan_slug is required"}), 400
        plan = SubscriptionPlan.query.filter_by(slug=plan_slug).first()
        if not plan:
            return jsonify({"error": "Plan not found"}), 404

        redemption = None
        # If a promo was used, validate and record redemption
        if promo_code:
            promo = PromoCode.query.filter(func.upper(PromoCode.code) == promo_code).first()
            if not promo:
                return jsonify({"error": "Promo code not found."}), 400
            if not promo.is_active:
                return jsonify({"error": "This promo code is no longer active."}), 400
            now = datetime.utcnow()
            if promo.valid_from and promo.valid_from > now:
                return jsonify({"error": "This promo code is not yet valid."}), 400
            if promo.valid_until and promo.valid_until < now:
                return jsonify({"error": "This promo code has expired."}), 400
            if promo.applicable_plan_ids and plan.id not in promo.applicable_plan_ids:
                return jsonify({"error": "This promo code does not apply to the selected plan."}), 400
            if promo.max_redemptions is not None:
                used = PromoCodeRedemption.query.filter_by(promo_code_id=promo.id).count()
                if used >= promo.max_redemptions:
                    return jsonify({"error": "This promo code has reached its usage limit."}), 400
            if promo.max_redemptions_per_user:
                user_used = PromoCodeRedemption.query.filter_by(
                    promo_code_id=promo.id, user_id=current_user.id
                ).count()
                if user_used >= promo.max_redemptions_per_user:
                    return jsonify({"error": "You have already used this promo code."}), 400

            redemption = PromoCodeRedemption(
                promo_code_id=promo.id,
                user_id=current_user.id,
                payment_id=None,
                subscription_id=None,
                discount_cents=discount_cents,
            )
            db.session.add(redemption)

        current_user.plan_id = plan.id

        # Create or update subscription record for expiration tracking (used by GET /api/subscription)
        now = datetime.utcnow()
        if plan.interval == "week":
            period_end = now + timedelta(days=7)
        elif plan.interval == "month":
            period_end = now + timedelta(days=30)
        elif plan.interval == "year":
            period_end = now + timedelta(days=365)
        else:
            period_end = now
        sub = Subscription.query.filter_by(user_id=current_user.id).order_by(Subscription.created_at.desc()).first()
        if sub:
            sub.plan_id = plan.id
            sub.status = "active"
            sub.current_period_start = now
            sub.current_period_end = period_end
        else:
            sub = Subscription(
                user_id=current_user.id,
                plan_id=plan.id,
                status="active",
                payment_provider="manual",
                current_period_start=now,
                current_period_end=period_end,
            )
            db.session.add(sub)
        db.session.flush()  # get sub.id for redemption link
        if promo_code and redemption:
            redemption.subscription_id = sub.id

        db.session.commit()
        return jsonify({"success": True, "plan_id": plan.id})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api_bp.route("/promo/validate", methods=["GET", "POST"])
def validate_promo():
    """Validate a promo code for a plan. Returns discount_cents if valid."""
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        code = (data.get("code") or "").strip().replace(" ", "").upper()
        plan_id = data.get("plan_id")
    else:
        code = (request.args.get("code") or "").strip().replace(" ", "").upper()
        plan_id = request.args.get("plan_id", type=int)

    if not code:
        return jsonify({"valid": False, "error": "Promo code is required."}), 400
    if not plan_id:
        return jsonify({"valid": False, "error": "Plan ID is required."}), 400

    promo = PromoCode.query.filter(
        func.upper(PromoCode.code) == code
    ).first()
    if not promo:
        return jsonify({"valid": False, "error": "Promo code not found."}), 200

    if not promo.is_active:
        return jsonify({"valid": False, "error": "This promo code is no longer active."}), 200

    now = datetime.utcnow()
    if promo.valid_from and promo.valid_from > now:
        return jsonify({"valid": False, "error": "This promo code is not yet valid."}), 200
    if promo.valid_until and promo.valid_until < now:
        return jsonify({"valid": False, "error": "This promo code has expired."}), 200

    if promo.applicable_plan_ids and plan_id not in promo.applicable_plan_ids:
        return jsonify({
            "valid": False,
            "error": "This promo code does not apply to the selected plan.",
        }), 200

    if promo.max_redemptions is not None:
        used = PromoCodeRedemption.query.filter_by(promo_code_id=promo.id).count()
        if used >= promo.max_redemptions:
            return jsonify({"valid": False, "error": "This promo code has reached its usage limit."}), 200

    if current_user.is_authenticated and promo.max_redemptions_per_user:
        user_used = PromoCodeRedemption.query.filter_by(
            promo_code_id=promo.id, user_id=current_user.id
        ).count()
        if user_used >= promo.max_redemptions_per_user:
            return jsonify({
                "valid": False,
                "error": "You have already used this promo code.",
            }), 200

    plan = SubscriptionPlan.query.get(plan_id)
    if not plan:
        return jsonify({"valid": False, "error": "Invalid plan."}), 200

    price_cents = plan.price_cents or 0
    if promo.discount_type == "percent":
        discount_cents = int(round(price_cents * promo.discount_value / 100))
    else:
        discount_cents = min(promo.discount_value, price_cents)

    promo_dict = {
        "id": promo.id,
        "code": promo.code,
        "discount_type": promo.discount_type,
        "discount_value": promo.discount_value,
        "currency": promo.currency,
        "applicable_plan_ids": promo.applicable_plan_ids,
        "is_active": promo.is_active,
        "valid_from": promo.valid_from.isoformat() if promo.valid_from else None,
        "valid_until": promo.valid_until.isoformat() if promo.valid_until else None,
        "description": promo.description,
    }
    return jsonify({
        "valid": True,
        "promo": promo_dict,
        "discount_cents": discount_cents,
    })


@api_bp.route("/plans", methods=["GET"])
def list_plans():
    """Return all active subscription plans (public)."""
    plans = SubscriptionPlan.query.filter_by(is_active=True).order_by(SubscriptionPlan.sort_order).all()
    return jsonify([_plan_to_dict(p, include_price=True) for p in plans])


@api_bp.route("/plan", methods=["GET"])
@login_required
def get_user_plan():
    """Return current user's plan with limits."""
    plan = _get_user_plan()
    return jsonify({"plan": _plan_to_dict(plan, include_price=True)})


@api_bp.route("/subscription", methods=["GET"])
@login_required
def get_user_subscription():
    """Return current user's subscription from subscriptions table (status, period, etc.)."""
    sub = (
        Subscription.query.filter_by(user_id=current_user.id)
        .order_by(Subscription.created_at.desc())
        .first()
    )
    if not sub:
        return jsonify({"subscription": None})

    plan = SubscriptionPlan.query.get(sub.plan_id) if sub.plan_id else SubscriptionPlan.query.get(1)
    plan_dict = None
    if plan:
        f = plan.features or {}
        plan_dict = {
            "id": plan.id,
            "name": plan.name,
            "slug": plan.slug,
            "description": plan.description or "",
            "price_cents": plan.price_cents or 0,
            "interval": plan.interval,
            "features": {
                "resumes_limit": plan.get_resumes_limit(),
                "exports_per_month": plan.get_exports_per_month(),
                "templates_unlocked": f.get("templates_unlocked", ["classic", "simple_ats"]),
                "spell_check": f.get("spell_check", False),
                "priority_support": f.get("priority_support", False),
                "allows_export": (plan.get_exports_per_month() or 0) > 0,
            },
            "is_active": plan.is_active,
            "sort_order": plan.sort_order or 0,
        }

    return jsonify({
        "subscription": {
            "id": sub.id,
            "user_id": sub.user_id,
            "plan_id": sub.plan_id,
            "plan": plan_dict,
            "status": sub.status,
            "payment_provider": sub.payment_provider or "manual",
            "current_period_start": sub.current_period_start.isoformat() if sub.current_period_start else None,
            "current_period_end": sub.current_period_end.isoformat() if sub.current_period_end else None,
            "cancel_at_period_end": sub.cancel_at_period_end,
            "cancelled_at": sub.cancelled_at.isoformat() if sub.cancelled_at else None,
            "created_at": sub.created_at.isoformat() if sub.created_at else None,
        }
    })


@api_bp.route("/resumes/<int:resume_id>", methods=["DELETE"])
@login_required
def delete_resume(resume_id):
    """Delete a resume belonging to the current user."""
    r = Resume.query.filter_by(id=resume_id, user_id=current_user.id).first()
    if not r:
        return jsonify({"error": "Resume not found"}), 404
    db.session.delete(r)
    db.session.commit()
    return jsonify({"success": True})


@api_bp.route("/resumes/<int:resume_id>/duplicate", methods=["POST"])
@login_required
def duplicate_resume(resume_id):
    """Duplicate a resume for the current user."""
    r = Resume.query.filter_by(id=resume_id, user_id=current_user.id).first()
    if not r:
        return jsonify({"error": "Resume not found"}), 404
    # Check plan resume limit (duplicating creates a new resume)
    plan = _get_user_plan()
    limit = plan.get_resumes_limit() if plan else 1
    if limit is not None:
        count = Resume.query.filter_by(user_id=current_user.id).count()
        if count >= limit:
            return jsonify({
                "error": "resume_limit_reached",
                "message": f"Your {plan.name if plan else 'Free'} plan allows only {limit} resume(s). Upgrade to create more.",
            }), 403
    copy = Resume(
        user_id=current_user.id,
        name=f"{r.name} (Copy)",
        data=r.data.copy() if r.data else {},
        is_primary=False,
    )
    db.session.add(copy)
    db.session.commit()
    template_id = (copy.data or {}).get("template", "classic")
    return jsonify({
        "id": copy.id,
        "user_id": copy.user_id,
        "name": copy.name,
        "template_id": template_id,
        "template_name": TEMPLATE_NAMES.get(template_id, "Classic Pro"),
        "updated_at": copy.updated_at.isoformat() if copy.updated_at else None,
        "created_at": copy.created_at.isoformat() if copy.created_at else None,
        "is_primary": copy.is_primary,
    })
