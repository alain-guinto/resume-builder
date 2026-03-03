# ResumeForge — Database Migration Guide

This document provides the full DDL (Data Definition Language), seed data, and step-by-step instructions to migrate from SQLite to PostgreSQL and connect from pgAdmin.

---

## Tables Included vs Not Included

| Table | In DDL? | In App Models? | Notes |
|-------|---------|----------------|-------|
| `subscription_plans` | ✅ | ✅ | Seeded by app on first run |
| `users` | ✅ | ✅ | |
| `resumes` | ✅ | ✅ | |
| `export_logs` | ✅ | ✅ | |
| `promo_codes` | ✅ | ❌ | **Was missing** — frontend uses hardcoded list; add for DB-backed promos |
| `promo_code_redemptions` | ✅ | ❌ | Tracks promo usage per user |
| `subscriptions` | ✅ | ❌ | Tracks active subscriptions; status + current_period_end determine expiration |
| `payments` | ❌ | ❌ | Future — payment records |
| `usage_records` | ❌ | ❌ | Future — metered billing |

**Why promo_codes was missing:** The frontend (`resume-builder-frontend/lib/subscription.ts`) uses a hardcoded `PROMO_CODES` array. There is no backend model for it. If you had `promo_codes` in SQLite, it was created manually or from a different migration. The DDL below now includes it.

**Note:** The Flask app has no `PromoCode` model, so `db.create_all()` will not create `promo_codes` or `promo_code_redemptions`. You must run the DDL manually (or add models later). The frontend still validates promos client-side; to use the DB, you'd need a backend API (e.g. `GET /api/promo/validate?code=SAVE50&plan_id=3`).

---

## 1. Full DDL (PostgreSQL)

Run the following SQL in order. Execute in **pgAdmin Query Tool** or `psql`.

```sql
-- =============================================================================
-- ResumeForge — Full DDL for PostgreSQL
-- =============================================================================

-- Drop tables if re-running (reverse dependency order)
DROP TABLE IF EXISTS promo_code_redemptions;
DROP TABLE IF EXISTS promo_codes;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS export_logs;
DROP TABLE IF EXISTS resumes;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS subscription_plans;

-- -----------------------------------------------------------------------------
-- 1. subscription_plans (must exist before users due to FK)
-- -----------------------------------------------------------------------------
CREATE TABLE subscription_plans (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(80) NOT NULL,
    slug            VARCHAR(40) NOT NULL UNIQUE,
    description     TEXT,
    price_cents     INTEGER NOT NULL DEFAULT 0,
    interval        VARCHAR(20),
    features        JSONB,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at      TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE INDEX idx_subscription_plans_slug ON subscription_plans(slug);

-- -----------------------------------------------------------------------------
-- 2. users
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(120) NOT NULL UNIQUE,
    name            VARCHAR(120),
    password_hash   VARCHAR(256),
    google_id       VARCHAR(120) UNIQUE,
    facebook_id     VARCHAR(120) UNIQUE,
    avatar_url      VARCHAR(512),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    plan_id         INTEGER REFERENCES subscription_plans(id) DEFAULT 1,
    created_at      TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
    last_login_at   TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_facebook_id ON users(facebook_id);
CREATE INDEX idx_users_plan_id ON users(plan_id);

-- -----------------------------------------------------------------------------
-- 3. resumes
-- -----------------------------------------------------------------------------
CREATE TABLE resumes (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(120) NOT NULL DEFAULT 'My Resume',
    data            JSONB NOT NULL,
    is_primary      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at      TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE INDEX idx_resumes_user_id ON resumes(user_id);

-- -----------------------------------------------------------------------------
-- 4. export_logs
-- -----------------------------------------------------------------------------
CREATE TABLE export_logs (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE INDEX idx_export_logs_user_id ON export_logs(user_id);
CREATE INDEX idx_export_logs_created_at ON export_logs(created_at);

-- -----------------------------------------------------------------------------
-- 5. subscriptions (must exist before promo_code_redemptions.subscription_id FK)
-- -----------------------------------------------------------------------------
CREATE TABLE subscriptions (
    id                      SERIAL PRIMARY KEY,
    user_id                 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id                 INTEGER REFERENCES subscription_plans(id),
    status                  VARCHAR(30) NOT NULL DEFAULT 'active',
    payment_provider        VARCHAR(30) NOT NULL DEFAULT 'manual',
    provider_customer_id    VARCHAR(120),
    provider_subscription_id VARCHAR(120) UNIQUE,
    current_period_start    TIMESTAMP,
    current_period_end      TIMESTAMP,
    cancel_at_period_end    BOOLEAN NOT NULL DEFAULT FALSE,
    cancelled_at            TIMESTAMP,
    created_at              TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at              TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_provider_subscription_id ON subscriptions(provider_subscription_id);

-- -----------------------------------------------------------------------------
-- 6. promo_codes
-- -----------------------------------------------------------------------------
CREATE TABLE promo_codes (
    id                        SERIAL PRIMARY KEY,
    code                      VARCHAR(40) NOT NULL UNIQUE,
    discount_type             VARCHAR(20) NOT NULL,
    discount_value            INTEGER NOT NULL,
    currency                  VARCHAR(3),
    applicable_plan_ids       JSONB,
    max_redemptions           INTEGER,
    max_redemptions_per_user  INTEGER NOT NULL DEFAULT 1,
    valid_from                TIMESTAMP,
    valid_until               TIMESTAMP,
    is_active                 BOOLEAN NOT NULL DEFAULT TRUE,
    description               VARCHAR(255),
    created_at                TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at                TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_is_active ON promo_codes(is_active);

-- -----------------------------------------------------------------------------
-- 7. promo_code_redemptions
-- -----------------------------------------------------------------------------
CREATE TABLE promo_code_redemptions (
    id              SERIAL PRIMARY KEY,
    promo_code_id   INTEGER NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_id      INTEGER,
    subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,
    discount_cents  INTEGER NOT NULL,
    created_at      TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE INDEX idx_promo_code_redemptions_promo_code_id ON promo_code_redemptions(promo_code_id);
CREATE INDEX idx_promo_code_redemptions_user_id ON promo_code_redemptions(user_id);

-- -----------------------------------------------------------------------------
-- Trigger: updated_at auto-update for subscription_plans
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = (NOW() AT TIME ZONE 'UTC');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trigger_resumes_updated_at
    BEFORE UPDATE ON resumes
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trigger_promo_codes_updated_at
    BEFORE UPDATE ON promo_codes
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trigger_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

---

## 1b. Fix: Permission denied for sequence

If you see `permission denied for sequence promo_code_redemptions_id_seq` (or similar) when the app inserts rows, the app DB user lacks `USAGE`/`SELECT` on sequences. This often happens when tables were created by a superuser (e.g. `postgres`) and the app connects as a different user.

**Run as superuser** (e.g. `psql -U postgres -d resumebuilder`):

```sql
-- Replace resumeforge_user with your app's DB user (from DATABASE_URL)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO resumeforge_user;
```

For future tables/sequences created in this schema:

```sql
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO resumeforge_user;
```

---

## 2. Seed Data

Run after creating tables. This seeds the subscription plans (same as app's `_seed_plans`).

```sql
-- =============================================================================
-- ResumeForge — Seed Data
-- =============================================================================

INSERT INTO subscription_plans (
    id, name, slug, description, price_cents, interval, features, is_active, sort_order
) VALUES
    (1, 'Free', 'free', 'Get started with the basics', 0, NULL,
     '{"resumes_limit": 1, "exports_per_month": 3, "templates_unlocked": ["classic", "simple_ats"]}'::jsonb,
     TRUE, 0),
    (2, '7-Day Access', 'pro_7day', 'Perfect for a quick job search sprint', 299, 'week',
     '{"resumes_limit": 5, "exports_per_month": 10, "templates_unlocked": ["all"]}'::jsonb,
     TRUE, 1),
    (3, 'Monthly Pro', 'pro_monthly', 'For serious job seekers', 900, 'month',
     '{"resumes_limit": 10, "exports_per_month": 50, "templates_unlocked": ["all"]}'::jsonb,
     TRUE, 2),
    (4, 'Enterprise', 'enterprise', 'Unlimited access', 2900, 'month',
     '{"resumes_limit": null, "exports_per_month": null, "templates_unlocked": ["all"]}'::jsonb,
     TRUE, 3)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence so next INSERT gets correct id (if table was empty)
SELECT setval('subscription_plans_id_seq', (SELECT COALESCE(MAX(id), 1) FROM subscription_plans));

-- -----------------------------------------------------------------------------
-- Promo codes (matches promocode.md and frontend PROMO_CODES)
-- -----------------------------------------------------------------------------
INSERT INTO promo_codes (
    id, code, discount_type, discount_value, currency, applicable_plan_ids,
    max_redemptions, max_redemptions_per_user, valid_from, valid_until, is_active, description
) VALUES
    (1, 'SAVE50', 'percent', 50, NULL, NULL, NULL, 1,
     '2025-01-01 00:00:00+00', '2027-12-31 23:59:59+00', TRUE, '50% off any plan'),
    (2, 'SAVE40', 'percent', 40, NULL, NULL, NULL, 1,
     '2025-01-01 00:00:00+00', '2027-12-31 23:59:59+00', TRUE, '40% off any plan'),
    (3, 'FLAT5', 'fixed', 500, 'usd', NULL, NULL, 1,
     '2025-01-01 00:00:00+00', '2027-12-31 23:59:59+00', TRUE, '$5 off'),
    (4, 'PRO20', 'percent', 20, NULL, '[3]'::jsonb, NULL, 1,
     '2025-01-01 00:00:00+00', '2027-12-31 23:59:59+00', TRUE, '20% off Monthly Pro only'),
    (5, 'FLAT2', 'fixed', 200, 'usd', NULL, NULL, 1,
     '2025-01-01 00:00:00+00', '2027-12-31 23:59:59+00', TRUE, '$2 off')
ON CONFLICT (id) DO NOTHING;

SELECT setval('promo_codes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM promo_codes));

-- -----------------------------------------------------------------------------
-- Subscriptions for already subscribed users (plan_id != 1)
-- Backfills subscription records from users.plan_id for users on paid plans.
-- Safe to run at any time: only inserts for users with plan_id != 1 who have
-- no subscription record. If no such users exist, inserts 0 rows.
-- -----------------------------------------------------------------------------
INSERT INTO subscriptions (
    user_id,
    plan_id,
    status,
    payment_provider,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    cancelled_at
)
SELECT
    u.id,
    u.plan_id,
    'active',
    'manual',
    (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 day',
    CASE
        WHEN u.plan_id = 2 THEN (NOW() AT TIME ZONE 'UTC') + INTERVAL '7 days'
        ELSE (NOW() AT TIME ZONE 'UTC') + INTERVAL '1 month'
    END,
    FALSE,
    NULL
FROM users u
WHERE u.plan_id != 1
  AND u.plan_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = u.id);

SELECT setval('subscriptions_id_seq', (SELECT COALESCE(MAX(id), 1) FROM subscriptions));
```

---

## 3. Step-by-Step Guide: Connect to PostgreSQL Locally

### Step 1: Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Windows:** Download from [postgresql.org](https://www.postgresql.org/download/windows/) and run the installer.

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

---

### Step 2: Create Database and User

Open a terminal and connect as the default `postgres` user:

```bash
# macOS/Linux
psql -U postgres

# Or, if postgres user uses peer auth:
sudo -u postgres psql
```

Then run:

```sql
-- Create database
CREATE DATABASE resumeforge;

-- Create user (replace 'your_password' with a strong password)
CREATE USER resumeforge_user WITH PASSWORD 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE resumeforge TO resumeforge_user;
GRANT ALL ON SCHEMA public TO resumeforge_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO resumeforge_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO resumeforge_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO resumeforge_user;

-- Connect to the new database
\c resumeforge

-- Grant schema permissions (PostgreSQL 15+)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO resumeforge_user;
```

---

### Step 3: Run DDL and Seed Data

1. Connect to `resumeforge` database (e.g. `\c resumeforge` in psql).
2. Run the **Full DDL** from Section 1 above.
3. Run the **Seed Data** from Section 2 above.

Or from the command line:

```bash
psql -U resumeforge_user -d resumeforge -f ddl_and_seed.sql
```

(First save the DDL + seed into `ddl_and_seed.sql`.)

---

### Step 4: Configure pgAdmin Connection

1. Open **pgAdmin**.
2. Right-click **Servers** → **Register** → **Server**.
3. **General** tab:
   - **Name:** `ResumeForge Local`
4. **Connection** tab:
   - **Host:** `localhost`
   - **Port:** `5432`
   - **Maintenance database:** `postgres` (or `resumeforge`)
   - **Username:** `resumeforge_user`
   - **Password:** `your_password`
   - Check **Save password** (optional).
5. Click **Save**.

---

### Step 5: Update Backend `.env`

Edit `backend/.env`:

```diff
# ── Database ──────────────────────────────────────────────────────────────────
# SQLite (default — no setup needed):
-DATABASE_URL=sqlite:///data/resumeforge.db
+# DATABASE_URL=sqlite:///data/resumeforge.db

# PostgreSQL (local):
+DATABASE_URL=postgresql://resumeforge_user:your_password@localhost:5432/resumeforge
```

**Format:** `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`

---

### Step 6: Update Backend Config for PostgreSQL (Optional)

The default config uses `check_same_thread` (SQLite-only). For PostgreSQL, update `backend/app/config.py` so engine options are conditional:

```python
# In Config class, replace SQLALCHEMY_ENGINE_OPTIONS with:
import os
_db_url = os.environ.get("DATABASE_URL", "")
if _db_url.startswith("postgresql"):
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}
else:
    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {"check_same_thread": False},
        "pool_pre_ping": True,
    }
```

Or leave as-is; SQLAlchemy may ignore `check_same_thread` for PostgreSQL.

---

### Step 7: Restart Backend and Verify

```bash
cd backend
source venv/bin/activate   # Windows: venv\Scripts\activate
python run.py
```

The app will use PostgreSQL. Tables are created by Flask-SQLAlchemy on first run; if you already ran the DDL manually, `db.create_all()` will not alter existing tables.

---

### Step 8: Migrate Existing Data (Optional)

If you have data in SQLite and want to move it to PostgreSQL:

1. **Export from SQLite:**
   ```bash
   sqlite3 backend/data/resumeforge.db .dump > sqlite_dump.sql
   ```

2. **Convert and import:** SQLite dump syntax differs from PostgreSQL. Use a migration tool such as [pgloader](https://pgloader.io/) or a custom script.

   **pgloader example:**
   ```bash
   pgloader backend/data/resumeforge.db postgresql://resumeforge_user:your_password@localhost/resumeforge
   ```

3. Or manually export/import via CSV or application-level scripts.

---

## 4. Connection Summary

| Setting    | Value                          |
|-----------|---------------------------------|
| **Host**  | `localhost`                     |
| **Port**  | `5432`                          |
| **Database** | `resumeforge`                |
| **Username** | `resumeforge_user`           |
| **Password** | `your_password` (your choice) |
| **Connection string** | `postgresql://resumeforge_user:your_password@localhost:5432/resumeforge` |

---

## 5. Reverting to SQLite

To switch back to SQLite:

1. In `backend/.env`:
   ```
   DATABASE_URL=sqlite:///data/resumeforge.db
   ```
2. Comment out or remove the PostgreSQL line.
3. Restart the backend.

---

## 6. Troubleshooting

| Issue | Solution |
|-------|----------|
| `connection refused` | Ensure PostgreSQL is running: `brew services list` or `sudo systemctl status postgresql` |
| `password authentication failed` | Check username/password in `.env` and pgAdmin |
| `relation "subscription_plans" does not exist` | Run DDL in correct order; `subscription_plans` must exist before `users` |
| `psycopg2` not installed | Run `pip install psycopg2-binary` in the backend venv |
| Trigger syntax error | On PostgreSQL 11+, use `EXECUTE FUNCTION`; on older versions use `EXECUTE PROCEDURE` |

---

## 7. psycopg2 Dependency

PostgreSQL requires the `psycopg2` driver. Add to `backend/requirements.txt`:

```
psycopg2-binary>=2.9.0
```

Then install:

```bash
cd backend
source venv/bin/activate
pip install psycopg2-binary
```
