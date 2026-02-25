# Facebook SSO Integration Guide

This guide provides detailed steps to integrate Facebook Single Sign-On (SSO) with the ResumeForge web application. The application already includes Facebook OAuth support via Authlib—you only need to configure credentials and environment variables.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Meta Developer Console Setup](#meta-developer-console-setup)
3. [Facebook Login Product Configuration](#facebook-login-product-configuration)
4. [Environment Configuration](#environment-configuration)
5. [Commands to Execute](#commands-to-execute)
6. [Verification](#verification)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- A Facebook account
- Python 3.8+ installed
- The ResumeForge project cloned locally

---

## Meta Developer Console Setup

### Step 1: Create a Meta Developer Account

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **Get Started** (or **Log In** if you have an account)
3. Complete the developer registration if prompted
4. Accept the Meta Developer terms and conditions

### Step 2: Create a New App

1. From the [Meta for Developers](https://developers.facebook.com/) dashboard, click **Create App**
2. Select **Consumer** as the use case (for general public login)
3. Click **Next**
4. Fill in the app details:
   - **App name:** ResumeForge (or your preferred name)
   - **App contact email:** Your email address
5. Click **Create App**
6. Complete any additional verification if prompted

### Step 3: Add Facebook Login Product

1. On your app dashboard, find **Add Products to Your App**
2. Locate **Facebook Login** and click **Set Up**
3. Select **Web** as the platform
4. You will be taken to the Facebook Login settings

---

## Facebook Login Product Configuration

### Step 4: Configure Facebook Login Settings

1. In the left sidebar, go to **Products** → **Facebook Login** → **Settings**
2. Under **Valid OAuth Redirect URIs**, add:
   - Development: `http://localhost:5001/auth/facebook/callback`
   - Production: `https://yourdomain.com/auth/facebook/callback`
3. Under **Valid OAuth Redirect URIs** (if separate), ensure both URIs are listed
4. **Client OAuth Login:** Ensure it is **Yes**
5. **Web OAuth Login:** Ensure it is **Yes**
6. Click **Save Changes**

### Step 5: Configure App Domains (Optional for Localhost)

1. Go to **Settings** → **Basic**
2. Under **App Domains**, add:
   - Development: `localhost`
   - Production: `yourdomain.com`
3. Under **Privacy Policy URL**, add your privacy policy URL (required for production)
4. Under **Terms of Service URL**, add your terms URL (optional)
5. Click **Save Changes**

### Step 6: Get App ID and App Secret

1. Go to **Settings** → **Basic**
2. Copy your **App ID** (this is your `FACEBOOK_APP_ID`)
3. Click **Show** next to **App Secret** and copy it (this is your `FACEBOOK_APP_SECRET`)
4. **Important:** Never expose the App Secret in client-side code or commit it to version control

### Step 7: App Mode (Development vs Live)

- **Development Mode:** Your app can only be used by you and added test users
- **Live Mode:** Required for production—submit your app for review if you need extended permissions
- For testing with your own account, Development Mode is sufficient

---

## Environment Configuration

### Step 8: Create or Update `.env` File

1. If you don't have a `.env` file, copy the example:

```bash
cp .env.example .env
```

2. Edit `.env` and set the Facebook OAuth variables:

```bash
nano .env
# or
code .env
```

3. Update these lines with your actual credentials:

```
FACEBOOK_APP_ID=your-actual-app-id
FACEBOOK_APP_SECRET=your-actual-app-secret
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

### Step 9: Install Dependencies

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

### Step 10: Initialize Database

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

### Step 11: Run the Application

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

### Step 12: Test Facebook Sign-In

1. Open http://localhost:5001 in your browser
2. Click **Sign In** (or navigate to http://localhost:5001/login)
3. You should see a **Facebook** button
4. Click **Sign in with Facebook**
5. You will be redirected to Facebook's authorization page
6. Approve the requested permissions (email, public_profile)
7. After authorizing, you should be redirected back to the dashboard

If the Facebook button is disabled or shows "not configured", verify:
- `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` are set in `.env`
- The redirect URI in Meta Developer Console exactly matches `http://localhost:5001/auth/facebook/callback`

---

## Production Deployment

### Redirect URI

Add your production URL in Meta Developer Console:

- **Valid OAuth Redirect URIs:** `https://yourdomain.com/auth/facebook/callback`
- **App Domains:** `yourdomain.com`

### Environment Variables

Set these in your production environment (e.g., Heroku, Railway, Docker):

```bash
export FACEBOOK_APP_ID="your-app-id"
export FACEBOOK_APP_SECRET="your-app-secret"
export SECRET_KEY="your-production-secret-key"
export FLASK_ENV="production"
```

### App Review (Production)

- For **Development Mode**, only you and added test users can sign in
- To allow any Facebook user to sign in, switch your app to **Live** mode
- Some permissions may require [App Review](https://developers.facebook.com/docs/app-review/) for production use
- Basic `email` and `public_profile` permissions are typically approved for standard login

### HTTPS Requirement

Facebook OAuth requires HTTPS in production. Ensure your app is served over HTTPS.

---

## Troubleshooting

### "Facebook OAuth is not configured on this server"

- Ensure `FACEBOOK_APP_ID` is set in `.env`
- Restart the application after changing `.env`
- Verify `.env` is in the project root

### "redirect_uri_mismatch" or "URL Blocked"

- The redirect URI in Meta Developer Console must **exactly** match your app's callback URL
- For local dev: `http://localhost:5001/auth/facebook/callback` (no trailing slash)
- Check for typos, wrong port, or http vs https
- Ensure **Web OAuth Login** is enabled in Facebook Login settings

### "Facebook sign-in failed" After Redirect

- Verify `FACEBOOK_APP_SECRET` is correct (Settings → Basic → App Secret)
- Check that your app is not in a restricted state
- Ensure **Client OAuth Login** and **Web OAuth Login** are both **Yes**

### Facebook Button Not Visible

- The button only appears when `FACEBOOK_APP_ID` is set
- Check that `python-dotenv` is installed and loading `.env`
- Restart the Flask server after env changes

### "Can't Load URL" or "App Not Setup"

- Your app may be in Development Mode—add yourself as a test user, or use an account that has app access
- Go to **Roles** → **Test Users** to add test accounts
- Or use your own Facebook account (you have access as the app admin)

### Email Not Returned

- Some users may have restricted email visibility in their Facebook settings
- The app creates a placeholder email (`fb_{id}@resumeforge.local`) if email is not provided
- Ensure `email` is in the requested scopes (already configured in the app)

---

## Summary of Key Files

| File | Purpose |
|------|---------|
| `app/__init__.py` | Registers Facebook OAuth with Authlib |
| `app/controllers/auth.py` | `/auth/facebook` and `/auth/facebook/callback` routes |
| `app/config.py` | Loads `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` |
| `app/models/user.py` | User model with `facebook_id` field |
| `app/templates/login.html` | Login page with Facebook button |
| `.env` | Your credentials (never commit) |

---

## Quick Reference Commands

```bash
# Full setup from scratch
cd /Users/alainguinto/Documents/resume
cp .env.example .env
# Edit .env with your Facebook App ID and App Secret
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

Then open http://localhost:5001/login and click **Sign in with Facebook**.

---

## Facebook vs Google SSO

You can enable both Google and Facebook SSO simultaneously. Set all four variables in `.env`:

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
```

Both buttons will appear on the login page, and users can choose their preferred provider.
