# ResumeForge — Architecture Diagrams (Eraser DSL)

All diagrams use [Eraser.io](https://eraser.io) diagram-as-code syntax. Copy each code block into [Eraser](https://app.eraser.io) to render, or use the [Eraser API](https://docs.eraser.io/reference/generate-diagram-from-eraser-dsl) with the `diagramType` shown for each section.

**Diagram types:** `cloud-architecture-diagram`, `sequence-diagram`, `entity-relationship-diagram`, `flowchart-diagram`

---

## 1. High-Level Architecture

**Type:** `cloud-architecture-diagram`

```
direction down

Client [icon: monitor, color: gray]
Frontend [icon: monitor, color: blue, label: "Next.js SPA"]
Backend [icon: server, color: green, label: "Flask API"]
DataLayer [icon: database, color: orange, label: "SQLite/PostgreSQL"]

Client > Frontend
Frontend > Backend: /api/*, /auth/*, /upload/*
Backend > DataLayer
```

---

## 2. Backend Structure

**Type:** `flowchart-diagram`

```
direction down

Backend [shape: trapezoid]
RunPy [label: "run.py (port 5001)"]
App [shape: document]
Controllers [label: "controllers/ - api, auth, pages"]
Models [label: "models/ - user, resume_db, export_log, subscription_plan, promo_code"]
Services [label: "services/ - export_service, resume_parser"]
Static [label: "static/"]
Templates [label: "templates/"]

Backend > RunPy
Backend > App
App > Controllers
App > Models
App > Services
App > Static
App > Templates
```

---

## 3. Frontend Structure (resume-builder-frontend — Primary)

**Type:** `flowchart-diagram`

```
direction down

Frontend [shape: trapezoid]
App [label: "app/ - page, login, dashboard, choose-template, get-started, template-editor, pricing, checkout"]
Components [label: "components/ - NavAuthButtons, TemplatePreview, etc."]
Lib [label: "lib/ - api, auth, subscription, templates"]
Config [label: "next.config.ts - rewrites to backend"]

Frontend > App
Frontend > Components
Frontend > Lib
Frontend > Config
```

---

## 4. Frontend Structure (frontend — Legacy)

**Type:** `flowchart-diagram`

```
direction down

LegacyFrontend [shape: trapezoid]
App [label: "app/ - page, templates, editor, template-editor"]
Components [label: "components/ - LandingClient, UploadModal"]
Lib [label: "lib/api.ts"]
Config [label: "next.config.ts - proxies to backend"]

LegacyFrontend > App
LegacyFrontend > Components
LegacyFrontend > Lib
LegacyFrontend > Config
```

---

## 5. Authentication Flow

**Type:** `sequence-diagram`

```
Client [icon: monitor, color: gray] > AuthEndpoint [icon: server, color: blue]: POST /auth/login (JSON)
AuthEndpoint > FlaskLogin [icon: lock, color: green]: login_user
FlaskLogin > Session [icon: database, color: orange]: Session Cookie

Client > OAuthProvider [icon: cloud, color: purple]: /auth/google or /auth/facebook
OAuthProvider > AuthEndpoint: /auth/google/callback
AuthEndpoint > FlaskLogin: login_user
FlaskLogin > Client: redirect to /dashboard
```

---

## 6. Resume Creation & Edit Flow

**Type:** `sequence-diagram`

```
TemplateSelection [icon: document, color: blue] > API [icon: server, color: green]: POST /api/resumes (create)
API > ResumeDB [icon: database, color: orange]: Save user_id, data

TemplateSelection > TemplateEditor [icon: monitor, color: gray]: Open editor
TemplateEditor > API: POST /api/resume (save)
API > ResumeDB: Update resume data
```

---

## 7. Export Flow

**Type:** `sequence-diagram`

```
TemplateEditor [icon: monitor, color: blue] > ExportAPI [icon: server, color: green]: POST /api/export/pdf or docx
ExportAPI > ExportLog [icon: database, color: orange]: Log usage count
ExportAPI > ExportService [icon: tool, color: purple]: build_pdf / build_docx
ExportService > TemplateEditor: Blob download
```

---

## 8. Resume Parse Flow (Upload)

**Type:** `sequence-diagram`

```
Upload [icon: upload, color: blue] > ParseAPI [icon: server, color: green]: POST /api/parse-resume (FormData)
ParseAPI > ResumeParser [icon: tool, color: purple]: parse_resume_file
ResumeParser > ParseAPI: Structured JSON (contacts, exp, education)
ParseAPI > Upload: Return JSON

opt [label: "Backend unavailable"] {
  Upload > ClientFallback [icon: monitor, color: gray]: JSZip (DOCX) / text extraction (PDF)
}
```

---

## 9. Checkout & Promo Flow

**Type:** `sequence-diagram`

```
Checkout [icon: shopping-cart, color: blue] > PromoAPI [icon: server, color: green]: GET /api/promo/validate?code=...
PromoAPI > PromoCode [icon: database, color: orange]: DB validation
PromoAPI > Checkout: discount_cents (percent or fixed)

Checkout > CheckoutAPI [icon: server, color: green]: POST /api/checkout/free (total $0)
CheckoutAPI > PromoCodeRedemption [icon: database, color: orange]: Record if promo used
CheckoutAPI > User [icon: user, color: purple]: Update plan_id
```

---

## 10. Entity Relationship (Data Model)

**Type:** `entity-relationship-diagram`

```
users [icon: user, color: blue] {
  id string pk
  email string
  name string
  password_hash string
  google_id string
  facebook_id string
  plan_id string
  avatar_url string
  is_active boolean
  created_at datetime
  last_login_at datetime
}

resumes [icon: file-text, color: green] {
  id string pk
  user_id string
  name string
  data string
  is_primary boolean
  created_at datetime
  updated_at datetime
}

export_logs [icon: bar-chart, color: orange] {
  id string pk
  user_id string
  created_at datetime
}

subscription_plans [icon: credit-card, color: purple] {
  id string pk
  name string
  slug string
  price_cents int
  interval string
  features string
}

subscriptions [icon: repeat, color: purple] {
  id string pk
  user_id string
  plan_id string
  status string
  current_period_start datetime
  current_period_end datetime
}

promo_codes [icon: tag, color: red] {
  id string pk
  code string
  discount_type string
  discount_value int
  applicable_plan_ids string
  max_redemptions int
  valid_from datetime
  valid_until datetime
}

promo_code_redemptions [icon: check, color: red] {
  id string pk
  promo_code_id string
  user_id string
  subscription_id string
  discount_cents int
  created_at datetime
}

users > resumes
users > export_logs
users > subscription_plans
users > subscriptions
subscription_plans > subscriptions
promo_codes > promo_code_redemptions
users > promo_code_redemptions
subscriptions > promo_code_redemptions
```

---

## 11. Development Setup

**Type:** `flowchart-diagram`

```
direction down

Terminal1 [shape: oval, label: "Terminal 1"]
Backend [label: "backend/ → python run.py (port 5001)"]
Terminal2 [shape: oval, label: "Terminal 2"]
Frontend [label: "resume-builder-frontend/ → npm run dev (port 3000)"]
Proxy [label: "Frontend proxies /api/*, /auth/*, /upload/* to backend"]

Terminal1 > Backend
Terminal2 > Frontend
Frontend > Proxy
Proxy > Backend
```

---

## 12. Production Architecture

**Type:** `cloud-architecture-diagram`

```
direction down

ReverseProxy [icon: server, color: gray, label: "Nginx/Caddy"]
NextJS [icon: monitor, color: blue, label: "Next.js (Node)"]
FlaskAPI [icon: server, color: green, label: "Flask API (Gunicorn)"]
StaticAssets [icon: folder, color: orange]
Database [icon: database, color: purple, label: "PostgreSQL/SQLite"]

ReverseProxy > NextJS
ReverseProxy > FlaskAPI
ReverseProxy > StaticAssets
FlaskAPI > Database
```

---

## 13. User Journey: Sign Up → Create Resume → Export (Sequence Diagram)

**Type:** `sequence-diagram`

```
User [icon: user, color: blue] > Landing [icon: monitor, color: gray]: Visit /
Landing > User: Hero, templates preview

User > Login [icon: lock, color: green]: Click Sign Up
Login > AuthAPI [icon: server, color: purple]: POST /auth/register
AuthAPI > User: Session cookie, redirect /dashboard

User > Dashboard [icon: monitor, color: gray]: View resume list
User > GetStarted [icon: document, color: orange]: Choose template
GetStarted > Editor [icon: monitor, color: blue]: Open template-editor

User > Editor: Edit content, upload photo
Editor > API [icon: server, color: purple]: POST /api/resume (save)
API > Editor: Success

User > Editor: Click Export PDF or Export DOCX
Editor > ExportAPI [icon: server, color: purple]: POST /api/export/pdf or /api/export/docx
ExportAPI > PlanDB [icon: database, color: orange]: Get user plan, exports this month
PlanDB > ExportAPI: plan limits, export count
alt [label: "Export limit exceeded"] {
  ExportAPI > Editor: 403 export_limit_reached
  Editor > User: Show upgrade prompt
}
else [label: "Within limit"] {
  ExportAPI > ExportService [icon: tool, color: green]: build_pdf or build_docx
  ExportService > ExportAPI: Blob
  ExportAPI > ExportLog [icon: database, color: orange]: Record usage
  ExportAPI > Editor: PDF or DOCX blob
  Editor > User: Download PDF or DOCX
}
```
