"""Page controllers — serve HTML views."""
import os

from flask import Blueprint, flash, redirect, render_template, request, session, url_for
from flask_login import current_user, login_required

from app.models.resume import ResumeModel
from app.models.resume_db import Resume
from app.services.resume_parser import parse_resume_file

pages_bp = Blueprint("pages", __name__)


@pages_bp.route("/")
def landing():
    return render_template("landing.html")


@pages_bp.route("/upload", methods=["GET", "POST"])
def upload():
    if request.method == "POST":
        if "resume" not in request.files:
            return redirect(url_for("pages.upload_source"))
        file = request.files["resume"]
        if not file or not file.filename:
            return redirect(url_for("pages.upload_source"))
        try:
            parsed = parse_resume_file(file.read(), file.filename)
            session["pending_parsed_resume"] = parsed
            session.modified = True
            return redirect(url_for("pages.editor"))
        except Exception as e:
            flash(f"Could not parse the file. Try a text-based PDF or DOCX. ({e})", "error")
            return redirect(url_for("pages.upload_source"))
    return render_template("upload.html")


@pages_bp.route("/upload/select-source")
def upload_source():
    return render_template("upload_source.html")


@pages_bp.route("/dashboard")
@login_required
def dashboard():
    """User dashboard — resume preview, Edit, Download, Create New Resume."""
    resumes = list(
        Resume.query.filter_by(user_id=current_user.id)
        .order_by(Resume.updated_at.desc())
    )
    resume_id = request.args.get("resume_id", type=int)
    current_resume = None
    if resume_id:
        current_resume = next((r for r in resumes if r.id == resume_id), None)
    if not current_resume and resumes:
        current_resume = resumes[0]
    resume_data = current_resume.data if current_resume else ResumeModel.default_data()

    # Render resume HTML for preview
    template_name = (resume_data or {}).get("template", "classic")
    resume_html = render_template(f"resume/{template_name}.html", **(resume_data or ResumeModel.default_data()))

    def display_name(r):
        return (r.data.get("contacts", {}).get("name") or r.name or "My Resume").replace(" ", "_").upper()

    return render_template(
        "dashboard.html",
        user=current_user,
        resumes=resumes,
        current_resume=current_resume,
        resume_data=resume_data,
        resume_html=resume_html,
        display_name=display_name,
    )


@pages_bp.route("/login")
def login():
    error = request.args.get("error", "")
    google_enabled   = bool(os.environ.get("GOOGLE_CLIENT_ID"))
    facebook_enabled = bool(os.environ.get("FACEBOOK_APP_ID"))
    return render_template(
        "login.html",
        error=error,
        google_enabled=google_enabled,
        facebook_enabled=facebook_enabled,
    )


@pages_bp.route("/templates")
def choose_templates():
    return render_template("choose_templates.html")


@pages_bp.route("/editor", methods=["GET"])
def editor():
    data = session.pop("pending_parsed_resume", None)
    start_blank = session.pop("start_blank", False)
    return render_template("editor.html", initial_resume_data=data, start_blank=start_blank)


@pages_bp.route("/editor/blank")
def editor_blank():
    """Redirect to editor with blank state (no parsed resume)."""
    session.pop("pending_parsed_resume", None)
    session["start_blank"] = True
    return redirect(url_for("pages.editor"))


@pages_bp.route("/editor/with-data", methods=["POST"])
def editor_with_data():
    """Accept parsed resume JSON and return editor HTML directly (no redirect/cookies)."""
    import logging
    log = logging.getLogger(__name__)
    try:
        data = request.get_json(force=True, silent=True)
        log.info("[editor/with-data] Received request, data=%s", "present" if data else "None/empty")
        if not data:
            log.warning("[editor/with-data] No data, redirecting to editor")
            return redirect(url_for("pages.editor"))
        contacts = data.get("contacts") or {}
        log.info("[editor/with-data] Embedding data: name=%r, experience=%d, skills=%d",
                 contacts.get("name"), len(data.get("experience") or []), len(data.get("skills") or []))
        return render_template("editor.html", initial_resume_data=data)
    except Exception as e:
        log.exception("[editor/with-data] Error: %s", e)
        return redirect(url_for("pages.editor"))


@pages_bp.route("/template-editor")
def template_editor():
    return render_template("template_editor.html")
