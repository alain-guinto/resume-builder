# Mock Data & Logic — Full List

This document lists all functionality in the codebase that still uses mock data, mock logic, or fallbacks to hardcoded values. Use this to decide which items to replace with real backend/database integration.

---

## 1. Subscription & Plans (`resume-builder-frontend/lib/subscription.ts`)

| Item | Type | Description | File Path |
|------|------|-------------|-----------|
| **PLANS array** | Mock data (fallback) | Hardcoded subscription plans (Free, 7-Day, Monthly Pro, Enterprise). Used when `GET /api/plans` fails or throws. | `resume-builder-frontend/lib/subscription.ts` (lines 93–166) |
| **getSubscriptionPlans()** | Mock fallback | On backend failure, returns `PLANS` after `wait(300)`. Simulated latency + hardcoded data. | `resume-builder-frontend/lib/subscription.ts` (lines 177–206) |
| **getPlanBySlug()** | Mock fallback | On backend failure, returns plan from `PLANS` by slug after `wait(200)`. Currently **unused** (success page uses `plans` from context). | `resume-builder-frontend/lib/subscription.ts` (lines 211–243) |
| **createCheckoutSession()** | Full mock | Creates a fake checkout session: `id: cs_mock_${Date.now()}`, `url: /checkout/success?...`. Does not call Stripe/PayMongo. **Never invoked** — checkout page shows maintenance modal for paid amounts. | `resume-builder-frontend/lib/subscription.ts` (lines 329–359) |
| **cancelSubscription()** | Full mock | Returns `{ success: true }` after `wait(600)`. No backend call. | `resume-builder-frontend/lib/subscription.ts` (lines 364–369) |
| **wait()** | Simulated latency | `setTimeout`-based delay used in mock fallbacks and mock functions. | `resume-builder-frontend/lib/subscription.ts` (line 170) |

---

## 2. Checkout — Paid Flow (`resume-builder-frontend/app/checkout/page.tsx`)

| Item | Type | Description | File Path |
|------|------|-------------|-----------|
| **Maintenance modal** | Mock behavior | When `finalCents > 0` (paid checkout), shows "Under Maintenance" modal instead of creating a real Stripe/PayMongo checkout session. Paid checkout is effectively disabled. | `resume-builder-frontend/app/checkout/page.tsx` (lines 132, 483–514) |

---

## 3. Dashboard — Share (`resume-builder-frontend/app/dashboard/page.tsx`)

| Item | Type | Description | File Path |
|------|------|-------------|-----------|
| **handleShare** | Mock share | Copies `{origin}/resume/{id}` to clipboard. The route `/resume/[id]` **does not exist** in the Next.js app, so the link leads to 404. No real shareable link generation. | `resume-builder-frontend/app/dashboard/page.tsx` (lines 263–269) |

---

## 4. Pricing — Feature Descriptions (`resume-builder-frontend/app/pricing/page.tsx`)

| Item | Type | Description | File Path |
|------|------|-------------|-----------|
| **PLAN_FEATURES** | Hardcoded data | Static mapping of plan slugs to feature bullet strings (e.g. `pro_7day` → "5 resumes", "10 exports", etc.). Could be derived from `plan.features` from the API instead. | `resume-builder-frontend/app/pricing/page.tsx` (lines 17–47) |

---

## 5. User / Auth (Redundant + Misleading Name)

| Item | Type | Description | File Path |
|------|------|-------------|-----------|
| **getMockUser()** | Redundant + misleading | Duplicate of `getCurrentUser()` in `lib/auth.ts`. Both call `GET /api/me`. Dashboard uses `getMockUser`; could switch to `getCurrentUser`. | `resume-builder-frontend/lib/subscription.ts` (lines 425–433) |
| **MockUser interface** | Misleading name | Same shape as `User` in `lib/auth.ts`. Type name suggests mock; data comes from real backend. | `resume-builder-frontend/lib/subscription.ts` (lines 415–420) |

---

## 6. Resume Parsing Fallback (`resume-builder-frontend/lib/api.ts`)

| Item | Type | Description | File Path |
|------|------|-------------|-----------|
| **parseResume() client-side fallback** | Fallback logic | When `POST /api/parse-resume` fails or is unavailable, falls back to client-side text extraction (PDF/DOCX). This is a **real fallback**, not mock data — it parses the file. | `resume-builder-frontend/lib/api.ts` (lines 21–39, 42–100+) |

---

## 7. UX Delays (Intentional, Not Mock Data)

| Item | Type | Description | File Path |
|------|------|-------------|-----------|
| **setTimeout in get-started** | UX delay | Brief delays (500ms, 800ms, 2500ms) after parse/save for loading feedback. Not mock data. | `resume-builder-frontend/app/get-started/page.tsx` (lines 151, 164, 174, 182) |
| **setTimeout in UploadModal** | UX delay | Similar delays for upload flow. Not mock data. | `resume-builder-frontend/components/UploadModal.tsx` (lines 96, 103) |

---

## Summary Table

| # | Area | Mock / Fallback | Priority to Replace |
|---|------|-----------------|---------------------|
| 1 | Plans fallback | PLANS + getSubscriptionPlans/getPlanBySlug fallback | Low (backend usually works) |
| 2 | createCheckoutSession | Full mock, never called | N/A (dead code until paid checkout) |
| 3 | cancelSubscription | Full mock | Medium (if cancel flow is needed) |
| 4 | Paid checkout | Maintenance modal blocks real flow | High (enables Stripe/PayMongo) |
| 5 | Dashboard share | Link to non-existent route | Medium (needs /resume/[id] or real share API) |
| 6 | PLAN_FEATURES | Hardcoded feature text | Low (cosmetic) |
| 7 | getMockUser name | Misleading only | Low (rename) |

---

## Recommended Order for Replacement

1. **Paid checkout** — Integrate Stripe/PayMongo; replace maintenance modal with real `createCheckoutSession` flow.
2. **Dashboard share** — Add `/resume/[id]` page or backend share API; make copied link valid.
3. **cancelSubscription** — Add backend `POST /api/subscription/cancel` when cancel flow is needed.
4. **PLAN_FEATURES** — Derive from `plan.features` if backend provides structured feature data.
5. **Plans fallback** — Remove or reduce reliance on PLANS when backend is stable.
6. **Rename** — `getMockUser` → `getCurrentUser`, `MockUser` → `CurrentUser`.
