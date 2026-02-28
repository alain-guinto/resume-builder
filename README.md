# Resume Builder

A full-stack resume builder web app. Edit your content, switch templates, customise design, and export to PDF or DOCX.

## Project structure

```
resume/
├── backend/                    # Flask API (auth, resumes, export, parse)
│   ├── app/
│   ├── run.py
│   ├── requirements.txt
│   └── data/
├── resume-builder-frontend/    # Next.js frontend (integrated)
├── frontend/                   # Next.js app (legacy)
└── README.md
```

---

## Setup

### Backend (Flask API)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # then edit .env with your config
python run.py
```

Backend runs at [http://localhost:5001](http://localhost:5001).

### Frontend (Next.js — resume-builder-frontend)

```bash
cd resume-builder-frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Create `resume-builder-frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5001
```

Open [http://localhost:3000](http://localhost:3000). API and auth are proxied to the backend.

---

## Run both

**Terminal 1 — Backend:**
```bash
cd backend && source venv/bin/activate && python run.py
```

**Terminal 2 — Frontend:**
```bash
cd resume-builder-frontend && npm run dev
```

For OAuth (Google/Facebook), set `FRONTEND_URL=http://localhost:3000` in `backend/.env` so callbacks redirect to the frontend.

---

## Features

- **Step-by-step editor**: Contacts, Experience, Education, Skills, Summary, Additional sections
- **Templates**: Classic, Minimal, Modern — switchable from the Template Editor
- **Live preview**: See changes reflected instantly as you type
- **Template Editor**: Choose template, reorder sections via drag-and-drop, adjust fonts/colors/spacing, run spell check
- **Export**: Download as PDF or DOCX
- **Auto-save**: Resume data persisted to `backend/data/`

---

## Backend structure

```
backend/
├── run.py
├── requirements.txt
├── data/
└── app/
    ├── __init__.py
    ├── config.py
    ├── models/
    ├── controllers/
    ├── services/
    ├── static/
    └── templates/
```

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/resume` | GET | Load resume data (user-specific) |
| `/api/resume` | POST | Save resume data |
| `/api/resumes` | GET | List all resumes (auth required) |
| `/api/resumes/<id>` | DELETE | Delete resume (auth required) |
| `/api/resumes/<id>/duplicate` | POST | Duplicate resume (auth required) |
| `/api/me` | GET | Current user (auth required) |
| `/api/stats` | GET | User stats: resumes_count, exports_count, exports_this_month (auth required) |
| `/api/export/pdf` | POST | Generate and download PDF |
| `/api/export/docx` | POST | Generate and download DOCX |
| `/api/parse-resume` | POST | Parse uploaded PDF/DOCX |
| `/auth/login` | POST | Email/password login |
| `/auth/register` | POST | Register |
| `/auth/logout` | GET/POST | Logout |
| `/auth/google` | GET | Google OAuth |
| `/auth/facebook` | GET | Facebook OAuth |
