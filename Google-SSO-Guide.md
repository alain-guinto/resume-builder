# Google SSO Integration Guide

This guide provides detailed steps to integrate Google Single Sign-On (SSO) with the ResumeForge web application. The application already includes Google OAuth support via Authlib—you only need to configure credentials and environment variables.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Cloud Console Setup](#google-cloud-console-setup)
3. [Environment Configuration](#environment-configuration)
4. [Commands to Execute](#commands-to-execute)
5. [Verification](#verification)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- A Google account
- Python 3.8+ installed
- The ResumeForge project cloned locally

---

## Google Cloud Console Setup

### Step 1: Create or Select a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click the project dropdown at the top (next to "Google Cloud")
4. Click **New Project**
   - Project name: `ResumeForge` (or your preferred name)
   - Click **Create**
5. Wait for the project to be created, then select it

### Step 2: Configure the OAuth Consent Screen

1. In the left sidebar, go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (for any Google account) or **Internal** (for organization-only)
3. Click **Create**
4. Fill in the required fields:
   - **App name:** ResumeForge
   - **User support email:** Your email
   - **Developer contact information:** Your email
5. Click **Save and Continue**
6. On **Scopes**, click **Add or Remove Scopes**
   - Add: `openid`, `email`, `profile`
   - Click **Update** → **Save and Continue**
7. On **Test users** (if External): Add your email for testing, or skip for production
8. Click **Save and Continue** → **Back to Dashboard**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Select **Web application** as the application type
4. Name: `ResumeForge Web Client`
5. Under **Authorized JavaScript origins**, add:
   - Development: `http://localhost:5001`
   - Production: `https://yourdomain.com` (replace with your domain)
6. Under **Authorized redirect URIs**, add:
   - Development: `http://localhost:5001/auth/google/callback`
   - Production: `https://yourdomain.com/auth/google/callback`
7. Click **Create**
8. A dialog will show your **Client ID** and **Client Secret**—copy both (you can also download the JSON)

---

## Environment Configuration

### Step 4: Create `.env` File

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit `.env` and set the Google OAuth variables:

```bash
# Using your preferred editor
nano .env
# or
code .env
```

3. Update these lines with your actual credentials:

```
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
```

4. Ensure `SECRET_KEY` is set (required for sessions):

```bash
# Generate a secure secret key
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Paste the output into `.env`:

```
SECRET_KEY=<paste-generated-key-here>
```

---

## Commands to Execute

### Step 5: Install Dependencies

```bash
# Navigate to project root
cd /Users/alainguinto/Documents/resume

# Create virtual environment (recommended)
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 6: Initialize Database

```bash
# Ensure you're in the project root with venv activated
python -c "
from app import create_app
app = create_app()
with app.app_context():
    from app.models.user import db
    db.create_all()
    print('Database initialized successfully.')
"
```

### Step 7: Run the Application

```bash
# Development server (default port 5001)
python run.py
```

Or using Flask directly:

```bash
FLASK_ENV=development python -m flask run --port 5001
```

The app will be available at: **http://localhost:5001**

---

## Verification

### Step 8: Test Google Sign-In

1. Open http://localhost:5001 in your browser
2. Click **Sign In** (or navigate to http://localhost:5001/login)
3. You should see a **Google** button (and optionally Facebook)
4. Click **Sign in with Google**
5. You will be redirected to Google's sign-in page
6. After signing in, you should be redirected back to the dashboard

If the Google button is disabled or shows "not configured", verify:
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`
- The redirect URI in Google Console exactly matches `http://localhost:5001/auth/google/callback`

---

## Production Deployment

### Redirect URI

Add your production URL to Google Cloud Console:

- **Authorized JavaScript origins:** `https://yourdomain.com`
- **Authorized redirect URIs:** `https://yourdomain.com/auth/google/callback`

### Environment Variables

Set these in your production environment (e.g., Heroku, Railway, Docker):

```bash
export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="your-client-secret"
export SECRET_KEY="your-production-secret-key"
export FLASK_ENV="production"
```

### HTTPS Requirement

Google OAuth requires HTTPS in production. Ensure your app is served over HTTPS (e.g., behind a reverse proxy like Nginx with SSL).

---

## Troubleshooting

### "Google OAuth is not configured on this server"

- Ensure `GOOGLE_CLIENT_ID` is set in `.env`
- Restart the application after changing `.env`
- Verify `.env` is in the project root and not ignored by your editor

### "redirect_uri_mismatch" Error

- The redirect URI in Google Console must **exactly** match your app's callback URL
- For local dev: `http://localhost:5001/auth/google/callback` (no trailing slash)
- Check for typos, wrong port, or http vs https

### "Access blocked: This app's request is invalid"

- Complete the OAuth consent screen setup
- For External apps in testing, add your email under Test users
- Ensure scopes `openid`, `email`, `profile` are configured

### Google Button Not Visible

- The button only appears when `GOOGLE_CLIENT_ID` is set
- Check that `python-dotenv` is installed and loading `.env`
- Restart the Flask server after env changes

### Database Errors

- Ensure the `data/` directory exists: `mkdir -p data`
- Run the database initialization command from Step 6

---

## Summary of Key Files

| File | Purpose |
|------|---------|
| `app/__init__.py` | Registers Google OAuth with Authlib |
| `app/controllers/auth.py` | `/auth/google` and `/auth/google/callback` routes |
| `app/config.py` | Loads `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| `app/models/user.py` | User model with `google_id` field |
| `app/templates/login.html` | Login page with Google button |
| `.env` | Your credentials (never commit) |

---

## Quick Reference Commands

```bash
# Full setup from scratch
cd /Users/alainguinto/Documents/resume
cp .env.example .env
# Edit .env with your Google credentials
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

Then open http://localhost:5001/login and click **Sign in with Google**.
