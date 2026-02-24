"""API controllers — resume CRUD, export, and parse endpoints."""
from flask import Blueprint, jsonify, request, send_file

from flask_login import current_user

from app.models.resume import ResumeModel
from app.models.resume_db import Resume
from app.models.user import db
from app.services.export_service import build_pdf, build_docx, PDF_ENGINE
from app.services.resume_parser import parse_resume_file

api_bp = Blueprint("api", __name__, url_prefix="/api")


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
            r = Resume(user_id=current_user.id, name="My Resume", data=data or {}, is_primary=True)
            db.session.add(r)
        db.session.commit()
    else:
        ResumeModel.save(data)
    return jsonify({"success": True})


@api_bp.route("/export/pdf", methods=["POST"])
def export_pdf():
    """Generate and stream a PDF of the resume."""
    if PDF_ENGINE is None:
        return jsonify({
            "error": "No PDF engine installed. Run: pip install xhtml2pdf  OR  pip install weasyprint"
        }), 503

    data = request.get_json()
    buffer = build_pdf(data)
    filename = _resume_filename(data, "pdf")
    return send_file(buffer, mimetype="application/pdf", as_attachment=True, download_name=filename)


@api_bp.route("/export/docx", methods=["POST"])
def export_docx():
    """Generate and stream a DOCX of the resume."""
    data = request.get_json()
    buffer = build_docx(data)
    filename = _resume_filename(data, "docx")
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
