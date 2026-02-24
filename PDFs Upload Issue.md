# PDF Upload Issue — Analysis & Solution

## Analysis: Why PDFs Fail but DOCX Works

### Root Cause

| Factor | DOCX | PDF |
|--------|------|-----|
| **Format** | Structured XML (OOXML) | Mixed layout + optional text layer |
| **Text source** | Direct from document structure | Often embedded in layout/streams |
| **Extraction** | `python-docx` reads paragraphs directly | `pdfminer`/`PyMuPDF` must infer layout |

### Why PDFs Fail

1. **Scanned PDFs** — No text layer; content is images. pdfminer returns empty.
2. **Complex layouts** — Multi-column, tables, headers/footers can confuse extractors.
3. **Embedded fonts** — Unembedded or unusual fonts can break extraction.
4. **Image-only PDFs** — Same as scanned PDFs.
5. **Protected/encrypted PDFs** — May block extraction.

### Why DOCX Works

- DOCX is native text; content is always in the document structure.
- No OCR or layout analysis needed.
- `python-docx` reads paragraphs directly.

---

## Solution Implemented

### Fallback Chain for PDF Extraction

```
1. pdfminer.six (primary) — good for standard text-based PDFs
2. PyMuPDF (fitz) — fallback when pdfminer returns empty; often better for complex layouts, embedded fonts, edge cases
```

### Changes Made

- Added **PyMuPDF** (`pip install PyMuPDF`) as fallback when pdfminer returns empty.
- Added logging to help debug extraction failures.
- DOCX continues to use `python-docx` — native text extraction, very reliable.

---

## Optional: OCR for Scanned PDFs

For scanned/image-only PDFs, OCR is required:

1. Install **Tesseract OCR**: https://github.com/tesseract-ocr/tesseract
2. Install Python packages:
   ```bash
   pip install pytesseract pdf2image
   ```
3. Add an OCR step in the parser when both pdfminer and PyMuPDF return empty.

This is a larger change; the PyMuPDF fallback should help most text-based PDFs.

---

## How to Test

1. Restart the Flask app.
2. Run `pip install PyMuPDF` (or `pip install -r requirements.txt`).
3. Upload a PDF that previously failed.
4. If it still fails, try a DOCX version or check the terminal for parser logs.
