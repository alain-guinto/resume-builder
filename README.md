# Resume Builder

A full-stack resume builder web app. Edit your content, switch templates, customise design, and export to PDF or DOCX.

## Features

- **Step-by-step editor**: Contacts, Experience, Education, Skills, Summary, Additional sections
- **3 templates**: Classic, Minimal, Modern — switchable from the Template Editor
- **Live preview**: See changes reflected instantly as you type
- **Template Editor**: Choose template, reorder sections via drag-and-drop, adjust fonts/colors/spacing, run spell check
- **Export**: Download as PDF or DOCX
- **Auto-save**: Resume data persisted to `data/resume_data.json`

## Setup

### 1. Create virtual environment

```bash
cd /path/to/resume
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. (Optional) Enable server-side PDF export

By default PDF export uses `xhtml2pdf`. For higher-quality output with WeasyPrint:

```bash
# macOS
brew install cairo pango gdk-pixbuf libffi
pip install weasyprint
```

### 4. Run the app

```bash
python run.py
```

Open [http://localhost:5001](http://localhost:5001) in your browser.

---

## Project structure

```
resume/
├── run.py                          # Entry point
├── requirements.txt
├── data/
│   └── resume_data.json            # Persisted resume data
└── app/
    ├── __init__.py                 # App factory (create_app)
    ├── config.py                   # DevelopmentConfig / ProductionConfig
    ├── models/
    │   └── resume.py               # ResumeModel — load, save, default data
    ├── controllers/
    │   ├── pages.py                # Page routes: / and /template-editor
    │   └── api.py                  # API routes: /api/resume, /api/export/*
    ├── services/
    │   └── export_service.py       # PDF and DOCX generation logic
    ├── static/
    │   ├── css/
    │   │   ├── editor.css
    │   │   └── template_editor.css
    │   └── js/
    │       ├── editor.js
    │       └── template_editor.js
    └── templates/
        ├── editor.html
        ├── template_editor.html
        └── resume/
            ├── classic.html
            ├── minimal.html
            └── modern.html
```

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Resume editor |
| `/template-editor` | GET | Template editor page |
| `/api/resume` | GET | Load resume data |
| `/api/resume` | POST | Save resume data |
| `/api/export/pdf` | POST | Generate and download PDF |
| `/api/export/docx` | POST | Generate and download DOCX |
