# ResumeForge Database Schema

Database: SQLite (default) or PostgreSQL via `DATABASE_URL`  
ORM: Flask-SQLAlchemy

---

## Current Schema

### Table: `users`

| Column         | Type         | Constraints                    | Description                          |
|----------------|--------------|--------------------------------|--------------------------------------|
| id             | INTEGER      | PRIMARY KEY                    | Auto-increment ID                    |
| email          | VARCHAR(120) | UNIQUE, NOT NULL, INDEX        | User email                           |
| name           | VARCHAR(120) | NULL                           | Display name                         |
| password_hash  | VARCHAR(256) | NULL                           | Bcrypt hash; null for OAuth-only     |
| google_id      | VARCHAR(120) | UNIQUE, NULL, INDEX            | Google OAuth provider ID             |
| facebook_id    | VARCHAR(120) | UNIQUE, NULL, INDEX            | Facebook OAuth provider ID           |
| avatar_url     | VARCHAR(512) | NULL                           | Profile picture URL                  |
| is_active      | BOOLEAN      | NOT NULL, DEFAULT TRUE         | Account active flag                  |
| created_at     | DATETIME     | DEFAULT utcnow                 | Account creation timestamp           |
| last_login_at  | DATETIME     | NULL                           | Last login timestamp                 |

**Source:** `app/models/user.py`

---

### Table: `resumes`

| Column      | Type         | Constraints                    | Description                          |
|-------------|--------------|--------------------------------|--------------------------------------|
| id          | INTEGER      | PRIMARY KEY                    | Auto-increment ID                    |
| user_id     | INTEGER      | FK(users.id), NOT NULL, INDEX  | Owner of the resume                  |
| name        | VARCHAR(120) | NOT NULL, DEFAULT "My Resume"  | Resume display name                  |
| data        | JSON         | NOT NULL                       | Resume content (contacts, experience, etc.) |
| is_primary  | BOOLEAN      | NOT NULL, DEFAULT TRUE         | Primary resume for user              |
| created_at  | DATETIME     | DEFAULT utcnow                 | Creation timestamp                   |
| updated_at  | DATETIME     | DEFAULT utcnow, ON UPDATE      | Last modification timestamp          |

**Relationships:**
- `resumes.user_id` → `users.id` (many resumes per user)

**Source:** `app/models/resume_db.py`

---

## Current ER Diagram (Text)

```
┌─────────────────┐         ┌─────────────────┐
│     users       │         │    resumes      │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄────────│ user_id (FK)    │
│ email           │    1:N  │ id (PK)         │
│ name            │         │ name            │
│ password_hash   │         │ data (JSON)     │
│ google_id       │         │ is_primary      │
│ facebook_id     │         │ created_at      │
│ avatar_url      │         │ updated_at      │
│ is_active       │         └─────────────────┘
│ created_at      │
│ last_login_at   │
└─────────────────┘
```

---

## Future Schema (Subscription-Based with Payment)

### New Tables

#### Table: `subscription_plans`

| Column       | Type         | Constraints                    | Description                          |
|--------------|--------------|--------------------------------|--------------------------------------|
| id           | INTEGER      | PRIMARY KEY                    | Auto-increment ID                    |
| name         | VARCHAR(80)  | NOT NULL                       | Plan name (e.g. "Pro", "Enterprise") |
| slug         | VARCHAR(40)  | UNIQUE, NOT NULL, INDEX        | URL-safe identifier (e.g. "pro")     |
| description  | TEXT         | NULL                           | Plan description                    |
| price_cents  | INTEGER      | NOT NULL, DEFAULT 0            | Price in smallest currency unit      |
| interval     | VARCHAR(20)  | NOT NULL                       | "week", "month", or "year"           |
| features     | JSON         | NULL                           | Plan features (resumes_limit, exports_limit, etc.) |
| is_active    | BOOLEAN      | NOT NULL, DEFAULT TRUE         | Plan available for purchase          |
| sort_order   | INTEGER      | NOT NULL, DEFAULT 0            | Display order                        |
| created_at   | DATETIME     | DEFAULT utcnow                 | Creation timestamp                   |
| updated_at   | DATETIME     | DEFAULT utcnow, ON UPDATE      | Last modification timestamp          |

**interval values:** `week` = 7-day plan, `month` = monthly, `year` = annual.

**Example features JSON:**
```json
{
  "resumes_limit": 10,
  "exports_per_month": 50,
  "templates_unlocked": ["all"],
  "spell_check": true,
  "priority_support": false,
  "allows_export": true
}
```

---

#### Table: `subscriptions`

| Column                  | Type         | Constraints                    | Description                          |
|-------------------------|--------------|--------------------------------|--------------------------------------|
| id                      | INTEGER      | PRIMARY KEY                    | Auto-increment ID                    |
| user_id                 | INTEGER      | FK(users.id), NOT NULL, INDEX  | Subscribing user                     |
| plan_id                 | INTEGER      | FK(subscription_plans.id)      | Current plan                         |
| status                  | VARCHAR(30)  | NOT NULL, INDEX                | active, cancelled, past_due, trialing, expired |
| payment_provider        | VARCHAR(30)  | NOT NULL                       | "stripe", "paypal", etc.             |
| provider_customer_id    | VARCHAR(120) | NULL, INDEX                   | External customer ID                 |
| provider_subscription_id| VARCHAR(120) | NULL, UNIQUE, INDEX           | External subscription ID              |
| current_period_start    | DATETIME     | NULL                           | Billing period start                 |
| current_period_end      | DATETIME     | NULL                           | Billing period end; download blocked when past this |
| cancel_at_period_end    | BOOLEAN      | NOT NULL, DEFAULT FALSE        | Cancel when period ends              |
| cancelled_at            | DATETIME     | NULL                           | When user cancelled                  |
| created_at              | DATETIME     | DEFAULT utcnow                 | Creation timestamp                   |
| updated_at              | DATETIME     | DEFAULT utcnow, ON UPDATE      | Last modification timestamp          |

**Download eligibility:** User can export (PDF/DOCX) only when `status = 'active'` AND `current_period_end > NOW()`. Expired or cancelled subscriptions block downloads.

---

#### Table: `payments`

| Column              | Type         | Constraints                    | Description                          |
|---------------------|--------------|--------------------------------|--------------------------------------|
| id                  | INTEGER      | PRIMARY KEY                    | Auto-increment ID                    |
| user_id             | INTEGER      | FK(users.id), NOT NULL, INDEX  | Paying user                          |
| subscription_id     | INTEGER      | FK(subscriptions.id), NULL     | Related subscription (if applicable) |
| plan_id             | INTEGER      | FK(subscription_plans.id)       | Plan purchased                       |
| amount_cents        | INTEGER      | NOT NULL                       | Final amount charged (after discount)|
| original_amount_cents| INTEGER     | NULL                           | Amount before promo discount         |
| discount_cents      | INTEGER      | NULL, DEFAULT 0                | Discount applied from promo code     |
| promo_code_id       | INTEGER      | FK(promo_codes.id), NULL       | Promo code used (if any)             |
| currency            | VARCHAR(3)   | NOT NULL, DEFAULT "usd"        | ISO 4217 currency code               |
| status              | VARCHAR(30)  | NOT NULL, INDEX                | succeeded, pending, failed, refunded |
| payment_provider    | VARCHAR(30)  | NOT NULL                       | "stripe", "paypal", etc.             |
| provider_payment_id | VARCHAR(120) | NULL, UNIQUE, INDEX           | External payment/charge ID           |
| metadata            | JSON         | NULL                           | Extra data (invoice URL, etc.)       |
| created_at          | DATETIME     | DEFAULT utcnow                 | Payment timestamp                    |

**Note:** `amount_cents` = `original_amount_cents` - `discount_cents` when a promo is applied.

---

#### Table: `promo_codes`

| Column                    | Type         | Constraints                    | Description                          |
|---------------------------|--------------|--------------------------------|--------------------------------------|
| id                        | INTEGER      | PRIMARY KEY                    | Auto-increment ID                    |
| code                      | VARCHAR(40)  | UNIQUE, NOT NULL, INDEX        | Promo code string (e.g. "SAVE50")    |
| discount_type             | VARCHAR(20)  | NOT NULL                       | "percent" or "fixed"                 |
| discount_value            | INTEGER      | NOT NULL                       | 50 = 50% off, or 500 = $5.00 off     |
| currency                  | VARCHAR(3)   | NULL                           | For fixed discount (e.g. "usd")      |
| applicable_plan_ids       | JSON         | NULL                           | Plan IDs it applies to; NULL = all   |
| max_redemptions           | INTEGER      | NULL                           | Total max uses; NULL = unlimited      |
| max_redemptions_per_user  | INTEGER      | NOT NULL, DEFAULT 1            | Uses per user (1 = one-time)         |
| valid_from                | DATETIME     | NULL                           | Start of validity window             |
| valid_until               | DATETIME     | NULL                           | End of validity window               |
| is_active                 | BOOLEAN      | NOT NULL, DEFAULT TRUE         | Promo can be used                    |
| description               | VARCHAR(255) | NULL                           | Internal note (e.g. "Q1 campaign")   |
| created_at                | DATETIME     | DEFAULT utcnow                 | Creation timestamp                   |
| updated_at                | DATETIME     | DEFAULT utcnow, ON UPDATE      | Last modification timestamp          |

**discount_type:** `percent` = discount_value is 1–100; `fixed` = discount_value is amount in cents.

**Example:** `SAVE50` = 50% off, `discount_type = "percent"`, `discount_value = 50`.  
**Example:** `FLAT5` = $5 off, `discount_type = "fixed"`, `discount_value = 500`, `currency = "usd"`.

---

#### Table: `promo_code_redemptions`

| Column          | Type         | Constraints                    | Description                          |
|-----------------|--------------|--------------------------------|--------------------------------------|
| id              | INTEGER      | PRIMARY KEY                    | Auto-increment ID                    |
| promo_code_id   | INTEGER      | FK(promo_codes.id), NOT NULL  | Promo code used                      |
| user_id         | INTEGER      | FK(users.id), NOT NULL, INDEX  | User who redeemed                    |
| payment_id      | INTEGER      | FK(payments.id), NULL          | Payment that used this promo         |
| subscription_id | INTEGER      | FK(subscriptions.id), NULL     | Subscription that used this promo    |
| discount_cents  | INTEGER      | NOT NULL                       | Actual discount applied              |
| created_at      | DATETIME     | DEFAULT utcnow                 | Redemption timestamp                 |

**Unique constraint:** `(promo_code_id, user_id, payment_id)` for idempotency; or per-user limit enforced in app logic.

---

#### Table: `usage_records` (optional, for metered billing or limits)

| Column       | Type         | Constraints                    | Description                          |
|--------------|--------------|--------------------------------|--------------------------------------|
| id           | INTEGER      | PRIMARY KEY                    | Auto-increment ID                    |
| user_id      | INTEGER      | FK(users.id), NOT NULL, INDEX  | User                                |
| period_start | DATE         | NOT NULL                       | Start of usage period (e.g. month)   |
| period_end   | DATE         | NOT NULL                       | End of usage period                  |
| metric_name  | VARCHAR(60)  | NOT NULL, INDEX                | e.g. "exports", "resumes_created"; use for export limits |
| count        | INTEGER      | NOT NULL, DEFAULT 0             | Usage count                          |
| created_at   | DATETIME     | DEFAULT utcnow                 | Creation timestamp                   |
| updated_at   | DATETIME     | DEFAULT utcnow, ON UPDATE      | Last modification timestamp          |

**Unique constraint:** `(user_id, period_start, metric_name)` to avoid duplicates.

---

### User Table Additions (Future)

Add to `users` table:

| Column              | Type         | Constraints                    | Description                          |
|---------------------|--------------|--------------------------------|--------------------------------------|
| stripe_customer_id  | VARCHAR(120) | NULL, UNIQUE, INDEX            | Stripe customer ID (if using Stripe) |

---

## Future ER Diagram (Text)

```
┌─────────────────────┐
│ subscription_plans  │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ slug                │
│ price_cents         │
│ interval            │
│ features (JSON)     │
└──────────┬──────────┘
           │
           │ 1:N
           ▼
┌─────────────────────┐         ┌─────────────────┐
│   subscriptions     │         │     users       │
├─────────────────────┤         ├─────────────────┤
│ id (PK)             │         │ id (PK)         │
│ user_id (FK) ───────┼────────►│ ...             │
│ plan_id (FK)        │         │ stripe_customer  │
│ status              │         └────────┬────────┘
│ provider_*          │                  │
│ current_period_*    │                  │ 1:N
└──────────┬──────────┘                  │
           │                             ▼
           │ 1:N                  ┌─────────────────┐
           ▼                      │    payments     │
┌─────────────────────┐           ├─────────────────┤
│  usage_records      │           │ id (PK)         │
├─────────────────────┤           │ user_id (FK)    │
│ id (PK)             │           │ subscription_id │
│ user_id (FK)        │           │ plan_id (FK)    │
│ metric_name         │           │ amount_cents    │
│ count               │           │ discount_cents   │
└─────────────────────┘           │ promo_code_id ───┼───┐
                                  └─────────────────┘   │
                                                         │
┌─────────────────────┐         ┌───────────────────────▼──┐
│ promo_code_redemptions│        │      promo_codes          │
├─────────────────────┤         ├───────────────────────────┤
│ id (PK)             │         │ id (PK)                   │
│ promo_code_id (FK) ─┼────────►│ code                      │
│ user_id (FK)        │         │ discount_type (percent/fix)│
│ payment_id (FK)     │         │ discount_value            │
│ discount_cents      │         │ max_redemptions           │
└─────────────────────┘         │ valid_from / valid_until  │
                                └───────────────────────────┘
```

---

## Download / Export Gating

Downloads (PDF, DOCX) are **blocked** when the user's subscription is expired or inactive.

**Eligibility check (pseudo-SQL):**
```sql
SELECT s.* FROM subscriptions s
JOIN users u ON u.id = s.user_id
WHERE s.user_id = :user_id
  AND s.status = 'active'
  AND s.current_period_end > datetime('now')
ORDER BY s.current_period_end DESC
LIMIT 1;
```

**App logic:**
1. If no row returned → user has no active subscription → **block download**, show upgrade prompt.
2. If row returned → user has valid access → allow export; optionally decrement `usage_records.exports` if plan has limits.

**Free plan:** Users on the free plan (`plan_id` = free) may have limited exports (e.g. 3/month). Use `usage_records` to enforce.

---

## Migration Notes

1. **Order of creation:** `subscription_plans` → `promo_codes` → `subscriptions` → `payments` → `promo_code_redemptions` → `usage_records`
2. **Seed data:** Insert default plans (Free, Pro, Enterprise) into `subscription_plans`
3. **Backfill:** Existing users get a default "free" subscription or `subscriptions` row with `plan_id` = free plan
4. **Stripe:** Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_*` to config
5. **Webhooks:** Handle `customer.subscription.*` and `invoice.payment_succeeded` for sync

---

## Promo Code Flow

1. **Checkout:** User enters promo code at checkout.
2. **Validation:** Look up `promo_codes` by `code` (case-insensitive); check `is_active`, `valid_from`, `valid_until`, `max_redemptions`, and per-user count via `promo_code_redemptions`.
3. **Plan eligibility:** If `applicable_plan_ids` is set, ensure selected plan is in the list.
4. **Compute discount:** `percent` → `discount = original_amount * discount_value / 100`; `fixed` → `discount = discount_value` (capped at original_amount).
5. **Charge:** Create payment with `original_amount_cents`, `discount_cents`, `amount_cents` (final), `promo_code_id`.
6. **Record:** Insert `promo_code_redemptions` row linking promo, user, payment, and discount applied.

---

## Suggested Plan Tiers (Example)

| Plan       | Slug        | Interval | Price   | Resumes | Exports | Download when expired? |
|------------|-------------|----------|---------|---------|---------|-------------------------|
| Free       | free        | —        | $0      | 1       | 3/mo    | No (free tier limits)   |
| 7-Day Trial| pro_7day    | week     | $2.99   | 5       | 10      | No — block after 7 days |
| Monthly Pro| pro_monthly | month    | $9/mo   | 10      | 50      | No — block when period ends |
| Enterprise | enterprise  | month    | $29/mo  | Unlimited | Unlimited | No — block when period ends |

**Key:** `current_period_end` is set at purchase: 7-day plan → +7 days; monthly → +1 month. When `NOW() > current_period_end` or `status != 'active'`, downloads are blocked.

---

## Example Promo Codes

| Code    | Type    | Value | Description              |
|---------|---------|-------|--------------------------|
| SAVE50  | percent | 50    | 50% off any plan         |
| SAVE40  | percent | 40    | 40% off any plan         |
| FLAT5   | fixed   | 500   | $5 off (500 cents)       |
| PRO20   | percent | 20    | 20% off Pro plan only    |
