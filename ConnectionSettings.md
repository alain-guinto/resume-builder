# ResumeForge — Connection Settings Guide

Step-by-step guide to change app settings so the backend connects to your PostgreSQL database instead of SQLite.

---

## Where the App Reads Database Settings

The app reads the database connection from **one place**:

| Location | What it does |
|----------|--------------|
| `backend/.env` | Defines `DATABASE_URL` (the app loads this via python-dotenv) |
| `backend/app/config.py` | Reads `DATABASE_URL` from the environment; if missing, falls back to SQLite |

**You only need to change `backend/.env`.** The config file uses whatever `DATABASE_URL` is set to.

---

## Step-by-Step: Connect to PostgreSQL

### Step 1: Open the `.env` file

Navigate to:

```
backend/.env
```

If it doesn’t exist, copy from the example:

```bash
cd backend
cp .env.example .env
```

---

### Step 2: Update `DATABASE_URL`

Find the **Database** section and change `DATABASE_URL`:

**Before (SQLite):**
```
DATABASE_URL=sqlite:///data/resumeforge.db
```

**After (PostgreSQL):**
```
DATABASE_URL=postgresql://resumeforge_user:your_password@localhost:5432/resumeforge
```

**Format:**
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

| Part | Example | Description |
|------|---------|--------------|
| USERNAME | `resumeforge_user` | PostgreSQL user |
| PASSWORD | `your_password` | User password |
| HOST | `localhost` | Server host (use `localhost` for local) |
| PORT | `5432` | PostgreSQL port (default 5432) |
| DATABASE_NAME | `resumeforge` | Database name |

---

### Step 3: Comment out SQLite (optional)

To avoid confusion, comment out the SQLite line:

```
# SQLite (default — no setup needed):
# DATABASE_URL=sqlite:///data/resumeforge.db

# PostgreSQL (local):
DATABASE_URL=postgresql://resumeforge_user:your_password@localhost:5432/resumeforge
```

---

### Step 4: Install PostgreSQL driver (if not already)

The app needs `psycopg2` to talk to PostgreSQL:

```bash
cd backend
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install psycopg2-binary
```

Add to `backend/requirements.txt`:

```
psycopg2-binary>=2.9.0
```

---

### Step 5: (Optional) Update config for PostgreSQL

`backend/app/config.py` uses `check_same_thread`, which is SQLite-specific. For PostgreSQL it’s usually ignored, but you can make it conditional.

**File:** `backend/app/config.py`

**Find (around lines 28–31):**
```python
SQLALCHEMY_ENGINE_OPTIONS      = {
    "connect_args": {"check_same_thread": False},  # required for SQLite + Flask threading
    "pool_pre_ping": True,                          # recover from dropped connections
}
```

**Replace with:**
```python
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

---

### Step 6: Restart the backend

```bash
cd backend
source venv/bin/activate   # Windows: venv\Scripts\activate
python run.py
```

The app will connect to PostgreSQL. If the database and tables don’t exist yet, run the DDL and seed from `DBMigration.md` first.

---

## Switching Back to SQLite

1. Open `backend/.env`.
2. Change `DATABASE_URL` to:
   ```
   DATABASE_URL=sqlite:///data/resumeforge.db
   ```
3. (Optional) Revert the `SQLALCHEMY_ENGINE_OPTIONS` change in `config.py` if you made it.
4. Restart the backend.

---

## Summary: Where to Change Settings

| File | Change |
|------|--------|
| `backend/.env` | Set `DATABASE_URL=postgresql://user:password@localhost:5432/resumeforge` |
| `backend/app/config.py` | Optional: make `SQLALCHEMY_ENGINE_OPTIONS` conditional for PostgreSQL |
| `backend/requirements.txt` | Add `psycopg2-binary` to use PostgreSQL |
