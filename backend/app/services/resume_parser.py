"""Resume parser service — extract structured data from uploaded PDF/DOCX files.

PDF extraction uses a fallback chain:
  1. pdfminer.six — good for standard text-based PDFs
  2. PyMuPDF (fitz) — often better for complex layouts, embedded fonts, edge cases

DOCX uses python-docx — native text extraction, very reliable.

Why PDFs can fail (but DOCX works):
  - Scanned PDFs: no text layer, need OCR (pytesseract + pdf2image)
  - Complex layouts: multi-column, tables can confuse extractors
  - Embedded fonts: some PDFs use fonts that extract poorly
  - Image-only PDFs: same as scanned

To add OCR for scanned PDFs (optional):
  pip install pytesseract pdf2image
  Install Tesseract: https://github.com/tesseract-ocr/tesseract
  Then call _extract_pdf_ocr() when both extractors return empty.
"""
import io
import logging
import re
from typing import Dict, List, Optional, Tuple

log = logging.getLogger(__name__)


def parse_resume_file(file_bytes: bytes, filename: str) -> dict:
    """Parse a resume file and return structured data matching the ResumeModel format."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext == "pdf":
        text = _extract_pdf_text(file_bytes)
    elif ext in ("docx", "doc"):
        text = _extract_docx_text(file_bytes)
    else:
        return {}

    if not text or not text.strip():
        log.warning("[resume_parser] No text extracted from %s (len=%d bytes)", filename, len(file_bytes))
        return _empty_data()

    log.info("[resume_parser] Extracted %d chars from %s", len(text), filename)
    return _parse_text(text)


def _empty_data() -> dict:
    return {
        "contacts": {},
        "summary": "",
        "experience": [],
        "education": [],
        "skills": [],
        "languages": [],
        "certifications": "",
        "awards": "",
        "additional": "",
        "template": "classic",
    }


# Minimum chars to consider extraction successful (resumes typically have 200+ chars)
_MIN_RESUME_CHARS = 80


def _extract_pdf_text(file_bytes: bytes) -> str:
    """Extract text from PDF using fallback chain: pdfminer → PyMuPDF → pdfplumber → pypdf."""
    extractors = [
        ("pdfminer", _extract_pdf_pdfminer),
        ("PyMuPDF", _extract_pdf_pymupdf),
        ("pdfplumber", _extract_pdf_pdfplumber),
        ("pypdf", _extract_pdf_pypdf),
    ]
    best = ""
    for name, fn in extractors:
        try:
            text = fn(file_bytes)
            if text and len(text.strip()) >= _MIN_RESUME_CHARS:
                log.info("[resume_parser] PDF extracted with %s (%d chars)", name, len(text))
                return text.strip()
            if text and len(text.strip()) > len(best.strip()):
                best = text
        except Exception as e:
            log.debug("[resume_parser] %s failed: %s", name, e)
    if best and best.strip():
        log.info("[resume_parser] Using best partial extraction (%d chars)", len(best.strip()))
        return best.strip()
    return ""


def _extract_pdf_pdfminer(file_bytes: bytes) -> str:
    """Extract using pdfminer.six — good for standard text-based PDFs."""
    try:
        from pdfminer.high_level import extract_text
        return extract_text(io.BytesIO(file_bytes)) or ""
    except Exception as e:
        log.debug("[resume_parser] pdfminer failed: %s", e)
        return ""


def _extract_pdf_pymupdf(file_bytes: bytes) -> str:
    """Extract using PyMuPDF — often better for complex layouts, embedded fonts."""
    try:
        import fitz
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        parts = []
        for page in doc:
            parts.append(page.get_text("text"))
        doc.close()
        return "\n".join(parts) if parts else ""
    except ImportError:
        log.debug("[resume_parser] PyMuPDF not installed (pip install PyMuPDF)")
        return ""
    except Exception as e:
        log.debug("[resume_parser] PyMuPDF failed: %s", e)
        return ""


def _extract_pdf_pdfplumber(file_bytes: bytes) -> str:
    """Extract using pdfplumber — good for structured/tabular data, built on pdfminer."""
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            parts = [page.extract_text() or "" for page in pdf.pages]
        return "\n".join(p for p in parts if p).strip()
    except ImportError:
        log.debug("[resume_parser] pdfplumber not installed (pip install pdfplumber)")
        return ""
    except Exception as e:
        log.debug("[resume_parser] pdfplumber failed: %s", e)
        return ""


def _extract_pdf_pypdf(file_bytes: bytes) -> str:
    """Extract using pypdf — pure Python, often works when others fail."""
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
        parts = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                parts.append(t)
        return "\n".join(parts) if parts else ""
    except ImportError:
        log.debug("[resume_parser] pypdf not installed (pip install pypdf)")
        return ""
    except Exception as e:
        log.debug("[resume_parser] pypdf failed: %s", e)
        return ""


def _extract_docx_text(file_bytes: bytes) -> str:
    try:
        from docx import Document
        doc = Document(io.BytesIO(file_bytes))
        return "\n".join(p.text for p in doc.paragraphs)
    except Exception:
        return ""


# ── Section keyword mapping ────────────────────────────────────────────────────
_SECTIONS = {
    "summary":       ["summary", "profile", "objective", "about me",
                      "professional summary", "career objective", "professional profile"],
    "experience":    ["experience", "work experience", "employment history",
                      "work history", "professional experience", "career history"],
    "education":     ["education", "academic background", "qualifications", "academic qualifications"],
    "skills":        ["skills", "technical skills", "core competencies",
                      "key skills", "expertise", "competencies"],
    "certifications": ["certifications", "certificates", "licenses",
                       "accreditations", "professional development"],
    "awards":        ["awards", "achievements", "honors", "recognitions"],
    "languages":     ["languages", "language skills", "spoken languages"],
}

_DATE_MONTHS = (
    "jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|"
    "january|february|march|april|june|july|august|september|october|november|december"
)
_DATE_RE = re.compile(
    rf"(?:(?:{_DATE_MONTHS})[\w\s,]*\d{{4}}|"
    r"\d{4}\s*[–\-—]\s*(?:\d{4}|present|current|now))",
    re.IGNORECASE,
)


# Common job title keywords to help identify the title line
_JOB_TITLE_KEYWORDS = re.compile(
    r"\b(engineer|developer|designer|manager|analyst|architect|director|lead|senior|junior|"
    r"consultant|specialist|coordinator|executive|officer|head|president|vp|vice president|"
    r"scientist|researcher|writer|editor|accountant|advisor|associate|intern|assistant|"
    r"product|software|frontend|backend|fullstack|full.stack|data|cloud|devops|qa|ux|ui|"
    r"marketing|sales|hr|human resources|finance|operations|project|program|technical)\b",
    re.IGNORECASE,
)

# Location patterns
_LOCATION_RE = re.compile(
    r"\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?),\s*([A-Z]{2}|[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b"
)


def _parse_text(text: str) -> dict:
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]

    data: Dict = {
        "contacts": {"phoneCode": "+1"},
        "summary": "",
        "experience": [],
        "education": [],
        "skills": [],
        "languages": [],
        "certifications": "",
        "awards": "",
        "additional": "",
        "template": "classic",
    }

    # ── Contact fields ─────────────────────────────────────────────────────────
    email_m = re.search(r"[\w.+\-]+@[\w\-]+\.[a-zA-Z]{2,}", text)
    if email_m:
        data["contacts"]["email"] = email_m.group(0)

    phone_m = re.search(r"(\+?\d[\d\s\-(). ]{7,}\d)", text)
    if phone_m:
        raw = phone_m.group(0).strip()
        code_m = re.match(r"^(\+\d{1,4})\s*(.+)$", raw)
        if code_m:
            data["contacts"]["phoneCode"] = code_m.group(1)
            data["contacts"]["phone"] = code_m.group(2).strip()
        else:
            data["contacts"]["phone"] = raw

    linkedin_m = re.search(r"linkedin\.com/in/[\w\-]+", text, re.IGNORECASE)
    if linkedin_m:
        url = linkedin_m.group(0)
        data["contacts"]["linkedin"] = url if url.startswith("http") else f"https://{url}"

    web_m = re.search(r"https?://(?!linkedin)[\w\-./]+", text, re.IGNORECASE)
    if web_m:
        data["contacts"]["website"] = web_m.group(0).rstrip("/.,")

    # ── Name + Job Title heuristic ─────────────────────────────────────────────
    # Look in the first 8 lines for:
    #   - A name line: 2–4 capitalized words, no symbols
    #   - A job title line: matches known job-title keywords, OR follows the name line
    name_idx = None
    for i, line in enumerate(lines[:8]):
        words = line.split()
        if (2 <= len(words) <= 5
                and not re.search(r"[@/+|•:\d]", line)
                and all(w[0].isupper() for w in words if w)):
            data["contacts"]["firstName"] = words[0].title()
            data["contacts"]["lastName"] = words[-1].title()
            data["contacts"]["name"] = " ".join(w.title() for w in words)
            name_idx = i
            break

    # Job title: the line right after the name, or a line matching title keywords
    if name_idx is not None:
        candidate_lines = lines[name_idx + 1 : name_idx + 4]
    else:
        candidate_lines = lines[:6]

    for line in candidate_lines:
        # Skip lines that look like contact info
        if re.search(r"[@|•·\d]", line) or len(line) > 60:
            continue
        if _JOB_TITLE_KEYWORDS.search(line):
            data["contacts"]["jobTitle"] = line.strip()
            break
        # If it's a short line right after the name with Title Case, treat it as job title
        if (name_idx is not None and not data["contacts"].get("jobTitle")
                and len(line.split()) <= 6 and not re.search(r"[@/+|•:]", line)):
            data["contacts"]["jobTitle"] = line.strip()

    # ── Location ───────────────────────────────────────────────────────────────
    # Check header lines (before first section) for "City, State" or "City, Country"
    loc_search_text = "\n".join(lines[:12])
    loc_m = _LOCATION_RE.search(loc_search_text)
    if loc_m:
        data["contacts"]["city"]    = loc_m.group(1).strip()
        data["contacts"]["country"] = loc_m.group(2).strip()

    # ── Locate section boundaries ──────────────────────────────────────────────
    section_starts: List[Tuple[int, str]] = []
    for i, line in enumerate(lines):
        lower = line.lower().rstrip(":").strip()
        for key, keywords in _SECTIONS.items():
            if lower in keywords or any(lower.startswith(k) for k in keywords):
                section_starts.append((i, key))
                break

    section_content: Dict[str, List[str]] = {}
    for idx, (start, key) in enumerate(section_starts):
        end = section_starts[idx + 1][0] if idx + 1 < len(section_starts) else len(lines)
        section_content[key] = lines[start + 1 : end]

    # ── Summary ────────────────────────────────────────────────────────────────
    if "summary" in section_content:
        data["summary"] = " ".join(section_content["summary"])

    # ── Skills ────────────────────────────────────────────────────────────────
    if "skills" in section_content:
        raw = " ".join(section_content["skills"])
        skills = [s.strip() for s in re.split(r"[,|•·\n/]", raw) if len(s.strip()) > 2]
        data["skills"] = skills[:20]

    # ── Certifications ────────────────────────────────────────────────────────
    if "certifications" in section_content:
        data["certifications"] = " · ".join(section_content["certifications"])

    # ── Awards ────────────────────────────────────────────────────────────────
    if "awards" in section_content:
        data["awards"] = " ".join(section_content["awards"])

    # ── Languages ─────────────────────────────────────────────────────────────
    if "languages" in section_content:
        for lang_line in section_content["languages"]:
            if lang_line and len(lang_line) > 1:
                data["languages"].append({"name": lang_line, "level": 3})

    # ── Experience ────────────────────────────────────────────────────────────
    if "experience" in section_content:
        data["experience"] = _parse_experience(section_content["experience"])

    # ── Education ─────────────────────────────────────────────────────────────
    if "education" in section_content:
        data["education"] = _parse_education(section_content["education"])

    return data


def _parse_experience(lines: List[str]) -> List[Dict]:
    entries: List[Dict] = []
    current: Optional[Dict] = None

    for line in lines:
        if _DATE_RE.search(line):
            if current:
                entries.append(current)
            current = {"dates": line, "role": "", "company": "", "description": ""}
        elif current:
            if not current["role"]:
                current["role"] = line
            elif not current["company"]:
                current["company"] = line
            else:
                sep = " " if current["description"] else ""
                current["description"] += sep + line

    if current:
        entries.append(current)
    return entries


def _parse_education(lines: List[str]) -> List[Dict]:
    entries: List[Dict] = []
    current: Optional[Dict] = None

    for line in lines:
        if re.search(r"\b\d{4}\b", line) and len(line) < 50:
            if current:
                entries.append(current)
            current = {"school": "", "degree": "", "dates": line}
        elif current:
            if not current["school"]:
                current["school"] = line
            elif not current["degree"]:
                current["degree"] = line

    if current:
        entries.append(current)
    return entries
