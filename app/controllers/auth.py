"""Authentication controller — email/password + Google/Facebook OAuth."""
import os
from datetime import datetime

from flask import (
    Blueprint, flash, jsonify, redirect, render_template,
    request, session, url_for,
)
from flask_login import current_user, login_required, login_user, logout_user

from app.models.user import User, db

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

# ── Lazy OAuth instance (imported from app factory) ──────────────────────────
def _oauth():
    from app import oauth
    return oauth


# ══════════════════════════════════════════════════════════════════════════════
# Email / Password
# ══════════════════════════════════════════════════════════════════════════════

@auth_bp.route("/login", methods=["POST"])
def email_login():
    data  = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    pwd   = data.get("password", "")

    if not email or not pwd:
        return jsonify({"error": "Email and password are required."}), 400

    user = User.query.filter_by(email=email).first()

    if user is None or not user.check_password(pwd):
        return jsonify({"error": "Invalid email or password."}), 401

    if not user.is_active:
        return jsonify({"error": "This account has been deactivated."}), 403

    user.last_login_at = datetime.utcnow()
    db.session.commit()
    login_user(user, remember=True)
    return jsonify({"ok": True, "redirect": session.pop("next_url", "/dashboard")}), 200


@auth_bp.route("/register", methods=["POST"])
def register():
    data  = request.get_json(silent=True) or {}
    name  = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    pwd   = data.get("password", "")

    if not email or not pwd:
        return jsonify({"error": "Email and password are required."}), 400
    if len(pwd) < 6 or len(pwd) > 64:
        return jsonify({"error": "Password must be 6–64 characters."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with that email already exists."}), 409

    user = User(name=name, email=email)
    user.set_password(pwd)
    db.session.add(user)
    db.session.commit()
    login_user(user, remember=True)
    return jsonify({"ok": True, "redirect": "/dashboard"}), 201


@auth_bp.route("/logout")
def logout():
    logout_user()
    return redirect("/")


# ══════════════════════════════════════════════════════════════════════════════
# Google OAuth 2.0
# ══════════════════════════════════════════════════════════════════════════════

@auth_bp.route("/google")
def google_login():
    if not os.environ.get("GOOGLE_CLIENT_ID"):
        return jsonify({"error": "Google OAuth is not configured on this server."}), 501
    redirect_uri = url_for("auth.google_callback", _external=True)
    # Store where to go after login
    session["next_url"] = request.args.get("next", "/dashboard")
    return _oauth().google.authorize_redirect(redirect_uri)


@auth_bp.route("/google/callback")
def google_callback():
    try:
        token     = _oauth().google.authorize_access_token()
        user_info = token.get("userinfo") or _oauth().google.userinfo()
    except Exception as exc:
        return redirect(url_for("pages.login") + "?error=google_auth_failed")

    g_id  = str(user_info["sub"])
    email = user_info.get("email", "").lower()

    user = User.query.filter_by(google_id=g_id).first()
    if not user and email:
        user = User.query.filter_by(email=email).first()

    if user:
        user.google_id     = g_id
        user.avatar_url    = user_info.get("picture") or user.avatar_url
        user.name          = user.name or user_info.get("name")
        user.last_login_at = datetime.utcnow()
    else:
        user = User(
            email      = email,
            name       = user_info.get("name", ""),
            google_id  = g_id,
            avatar_url = user_info.get("picture", ""),
        )
        db.session.add(user)

    db.session.commit()
    login_user(user, remember=True)
    return redirect(session.pop("next_url", "/dashboard"))


# ══════════════════════════════════════════════════════════════════════════════
# Facebook OAuth 2.0
# ══════════════════════════════════════════════════════════════════════════════

@auth_bp.route("/facebook")
def facebook_login():
    if not os.environ.get("FACEBOOK_APP_ID"):
        return jsonify({"error": "Facebook OAuth is not configured on this server."}), 501
    redirect_uri = url_for("auth.facebook_callback", _external=True)
    session["next_url"] = request.args.get("next", "/dashboard")
    return _oauth().facebook.authorize_redirect(redirect_uri)


@auth_bp.route("/facebook/callback")
def facebook_callback():
    try:
        token = _oauth().facebook.authorize_access_token()
        resp  = _oauth().facebook.get(
            "me",
            token=token,
            params={"fields": "id,name,email,picture.width(200)"},
        )
        fb_data = resp.json()
    except Exception:
        return redirect(url_for("pages.login") + "?error=facebook_auth_failed")

    fb_id = str(fb_data["id"])
    email = fb_data.get("email", "").lower()
    pic   = fb_data.get("picture", {}).get("data", {}).get("url", "")

    user = User.query.filter_by(facebook_id=fb_id).first()
    if not user and email:
        user = User.query.filter_by(email=email).first()

    if user:
        user.facebook_id   = fb_id
        user.avatar_url    = pic or user.avatar_url
        user.name          = user.name or fb_data.get("name")
        user.last_login_at = datetime.utcnow()
    else:
        user = User(
            email       = email or f"fb_{fb_id}@resumeforge.local",
            name        = fb_data.get("name", ""),
            facebook_id = fb_id,
            avatar_url  = pic,
        )
        db.session.add(user)

    db.session.commit()
    login_user(user, remember=True)
    return redirect(session.pop("next_url", "/dashboard"))
