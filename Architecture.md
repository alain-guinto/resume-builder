# ResumeForge — Architecture Design Artifacts

This document describes the architecture of the ResumeForge resume builder application, including system overview, components, data flow, deployment, and design decisions.

---

## 1. System Overview

ResumeForge is a full-stack web application that enables users to build, edit, and export professional, ATS-optimized resumes. The system supports multiple templates (including photo-enabled designs), profile photo upload, PDF/DOCX export, resume parsing from uploaded files, promo codes at checkout, and subscription-based access control.

### 1.1 High-Level Architecture

See [Diagrams.md](Diagrams.md#1-high-level-architecture).

### 1.2 Technology Stack

| Layer        | Technology                          | Purpose                                      |
|-------------|--------------------------------------|----------------------------------------------|
| Frontend    | Next.js 16, React 19, TypeScript     | SPA with SSR, routing, API proxy             |
| Styling     | Tailwind CSS 4                       | Utility-first styling                        |
| Backend     | Flask 3.x, Python                   | REST API, auth, server-rendered pages       |
| ORM         | Flask-SQLAlchemy                     | Database access                              |
| Auth        | Flask-Login, Authlib (OAuth)         | Session-based auth, Google/Facebook SSO     |
| PDF         | xhtml2pdf, reportlab, PyMuPDF       | PDF generation and parsing                   |
| DOCX        | python-docx, pdfminer, pdfplumber   | DOCX generation and resume parsing           |

---

## 2. Component Architecture

### 2.1 Backend Structure

See [Diagrams.md](Diagrams.md#2-backend-structure).

### 2.2 Frontend Structure (resume-builder-frontend — Primary)

See [Diagrams.md](Diagrams.md#3-frontend-structure-resume-builder-frontend--primary).

### 2.3 Frontend Structure (frontend — Legacy)

See [Diagrams.md](Diagrams.md#4-frontend-structure-frontend--legacy).

---

## 3. Data Flow

### 3.1 Authentication Flow

See [Diagrams.md](Diagrams.md#5-authentication-flow).

### 3.2 Resume Creation & Edit Flow

See [Diagrams.md](Diagrams.md#6-resume-creation--edit-flow).

### 3.3 Export Flow

See [Diagrams.md](Diagrams.md#7-export-flow).

### 3.4 Resume Parse Flow (Upload)

See [Diagrams.md](Diagrams.md#8-resume-parse-flow-upload).

### 3.5 Checkout & Promo Flow

See [Diagrams.md](Diagrams.md#9-checkout--promo-flow).

---

## 4. API Design

### 4.1 REST Endpoints

| Method | Endpoint                    | Auth    | Description                          |
|--------|-----------------------------|---------|--------------------------------------|
| GET    | /api/resume                 | Optional| Get resume data (by resume_id)       |
| POST   | /api/resume                 | Optional| Save resume data                     |
| GET    | /api/resumes                | Required| List user's resumes                  |
| POST   | /api/resumes                | Required| Create new resume                    |
| DELETE | /api/resumes/:id            | Required| Delete resume                        |
| POST   | /api/resumes/:id/duplicate  | Required| Duplicate resume                     |
| POST   | /api/export/pdf             | Optional| Export resume as PDF                 |
| POST   | /api/export/docx            | Optional| Export resume as DOCX                |
| POST   | /api/parse-resume            | No      | Parse uploaded PDF/DOCX              |
| GET    | /api/me                     | Required| Current user info                    |
| GET    | /api/stats                  | Required| User stats (resumes, exports, plan)  |
| GET    | /api/plans                  | No      | List subscription plans              |
| GET    | /api/plan                   | Required| Current user's plan                  |
| POST   | /api/checkout/free          | Required| Claim free plan when total $0 (records promo redemption) |
| GET    | /api/promo/validate         | Optional| Validate promo code for plan (returns discount_cents)     |

### 4.2 Auth Endpoints

| Method | Endpoint              | Description                    |
|--------|------------------------|--------------------------------|
| POST   | /auth/login            | Email/password login           |
| POST   | /auth/register         | Create account                 |
| GET/POST | /auth/logout         | Logout                         |
| GET    | /auth/google           | Initiate Google OAuth          |
| GET    | /auth/google/callback  | Google OAuth callback          |
| GET    | /auth/facebook         | Initiate Facebook OAuth        |
| GET    | /auth/facebook/callback| Facebook OAuth callback        |

---

## 5. Data Model

### 5.1 Entity Relationship (Current)

See [Diagrams.md](Diagrams.md#10-entity-relationship-data-model). Includes `users`, `resumes`, `export_logs`, `subscription_plans`, `subscriptions`, `promo_codes`, `promo_code_redemptions`.

### 5.2 Resume Data Schema (JSON)

```json
{
  "contacts": { "name", "email", "phone", "linkedin", "location", "photoUrl", ... },
  "summary": "string",
  "experience": [{ "role", "company", "dates", "description" }],
  "education": [{ "school", "degree", "dates" }],
  "skills": ["string"],
  "languages": [{ "name", "level" }],
  "certifications": "string",
  "awards": "string",
  "additional": "string",
  "template": "classic|modern_simple|..."
}
```

---

## 6. Security & Access Control

### 6.1 Authentication

- **Session-based**: Flask-Login with HTTP-only, SameSite=Lax cookies
- **OAuth**: Authlib for Google and Facebook; callbacks redirect to `FRONTEND_URL`
- **Protected routes**: `@login_required` redirects unauthenticated users to hero (`/`), not login

### 6.2 CORS & CSP

- **CORS**: `supports_credentials=True`; origins include `localhost:3000` and `FRONTEND_URL`
- **CSP**: Allows `unsafe-inline`, `unsafe-eval` for html2pdf.js; fonts from Google; images from `self`, `data:`, `blob:`, `https:`

### 6.3 Plan-Based Limits

| Plan       | Resumes | Exports/Month | Templates        |
|------------|---------|---------------|------------------|
| Free       | 1       | 3             | classic, simple_ats |
| 7-Day      | 5       | 10            | all              |
| Monthly Pro| 10      | 50            | all              |
| Enterprise | ∞       | ∞             | all              |

---

## 7. Deployment Architecture

### 7.1 Development

See [Diagrams.md](Diagrams.md#11-development-setup).

### 7.2 Production (Typical)

See [Diagrams.md](Diagrams.md#12-production-architecture).

### 7.3 Environment Variables

| Variable           | Description                          |
|--------------------|--------------------------------------|
| `NEXT_PUBLIC_API_URL` | Backend URL (e.g. http://localhost:5001) |
| `FRONTEND_URL`     | Frontend URL for OAuth callbacks      |
| `DATABASE_URL`     | SQLAlchemy connection string          |
| `SECRET_KEY`       | Flask secret key                      |
| `GOOGLE_CLIENT_ID` | Google OAuth                          |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret               |
| `FACEBOOK_APP_ID`  | Facebook OAuth                        |
| `FACEBOOK_APP_SECRET` | Facebook OAuth secret              |

---

## 8. Design Decisions

### 8.1 Dual Frontend Strategy

- **resume-builder-frontend**: Primary SPA with full Next.js pages for all routes; only API/auth/upload proxied to backend.
- **frontend**: Legacy app that proxies more routes (login, dashboard, templates, editor) to Flask-rendered pages.

### 8.2 Landing at Hero

- Root `/` serves the hero landing page; unauthenticated users hitting protected routes are redirected to `/` (hero), not `/login`.

### 8.3 Anonymous vs Authenticated Resume Storage

- **Authenticated**: Resumes stored in DB (`resumes` table) per user.
- **Anonymous**: Fallback to file-based `resume_data.json` via `ResumeModel`.

### 8.4 Resume Parsing

- Backend uses `pdfminer`, `PyMuPDF`, `pdfplumber`, `python-docx` for robust parsing.
- Frontend has client-side fallback (JSZip for DOCX, text extraction for PDF) when backend is unavailable.

### 8.5 Export Gating

- Export limits enforced per plan via `ExportLog` and `_check_export_limit()`.
- PDF engine: xhtml2pdf (or WeasyPrint if configured).

### 8.6 Template Rendering

- **Client-side**: `resume-templates.js` provides `renderResume(data, templateId, opts)` and `getTemplateSample(id)`; used by `TemplatePreview`, choose-template, and template-editor.
- **Shared metadata**: `lib/templates.ts` defines `TEMPLATES` (id, name, accentHex, etc.) for landing, choose-template, and editor.

### 8.7 Profile Photo Storage

- Photos stored as base64 data URLs in `contacts.photoUrl`; no separate upload API.
- Max 2 MB per image; accepted formats: JPEG, PNG, WebP.

---

## 9. Implemented Features & Future Considerations

### 9.1 Implemented

- **Promo codes**: `promo_codes`, `promo_code_redemptions` tables; backend `PromoCode`, `PromoCodeRedemption` models; `/api/promo/validate`, `/api/checkout/free` endpoints.
- **Profile photo**: `contacts.photoUrl` in resume data; template editor supports photo upload (JPEG/PNG/WebP, max 2 MB); templates with `hasPhoto` (e.g. Startup Vibe, Tech Modern) show the photo.
- **Template system**: `lib/templates.ts` shared metadata; `TemplatePreview` component; `resume-templates.js` for rendering; choose-template preview matches template-editor (zoom, scale).
- **Choose-template page**: Left pane (37%) template grid; right pane (63%) preview with zoom controls (25%–200%); template thumbnails scaled proportionally.

### 9.2 Future

- **Subscriptions**: `subscriptions`, `payments` tables for Stripe/PayMongo.
- **Usage records**: `usage_records` for metered billing/limits.
- **Webhooks**: Handle `customer.subscription.*`, `invoice.payment_succeeded` for payment sync.

---

## 10. Glossary

| Term        | Definition                                                |
|-------------|------------------------------------------------------------|
| ATS         | Applicant Tracking System — resume screening software      |
| OAuth       | Open standard for delegated authentication (Google, Facebook) |
| Promo code  | Discount code (percent or fixed) applied at checkout; validated via `/api/promo/validate` |
| SPA         | Single Page Application                                   |
| SSR         | Server-Side Rendering                                     |
