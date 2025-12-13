# Google OAuth Setup Checklist

## Backend Configuration

Your backend `.env` should have:
```
GOOGLE_OAUTH_CLIENT_ID="your-client-id"
GOOGLE_OAUTH_CLIENT_SECRET="your-client-secret"
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
GOOGLE_CLIENT_ID="your-client-id" (same as GOOGLE_OAUTH_CLIENT_ID)
FRONTEND_URL=http://localhost:3000
```

## Google Cloud Console Setup

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Select your project (or create a new one)

### 2. Enable APIs
- Go to "APIs & Services" > "Library"
- Enable these APIs:
  - **Google+ API** (for user info)
  - **Gmail API** (for reading emails)

### 3. Configure OAuth Consent Screen
- Go to "APIs & Services" > "OAuth consent screen"
- Choose "External" (unless you have a Google Workspace)
- Fill in required fields:
  - App name: AuraMail
  - User support email: Your email
  - Developer contact: Your email
- Add scopes:
  - `https://www.googleapis.com/auth/userinfo.profile`
  - `https://www.googleapis.com/auth/userinfo.email`
  - `https://www.googleapis.com/auth/gmail.readonly`
- Add test users (if in testing mode): Your Google account email

### 4. Create OAuth 2.0 Credentials
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "OAuth client ID"
- Choose "Web application"
- Name: AuraMail Backend
- **Authorized JavaScript origins:**
  - `http://localhost:5000`
- **Authorized redirect URIs:**
  - `http://localhost:5000/api/auth/google/callback` ⚠️ **MUST MATCH EXACTLY**
- Copy the Client ID and Client Secret to your `.env` file

### 5. Important Notes
- The redirect URI in Google Console **MUST EXACTLY MATCH** your backend redirect URI
- No trailing slashes
- Use `http://` for localhost (not `https://`)
- If you change the redirect URI, update both Google Console AND your `.env` file

## Testing the Setup

1. Start your backend: `cd app/backend && pnpm dev`
2. Start your frontend: `cd app/frontend && pnpm dev`
3. Visit: `http://localhost:3000/auth`
4. Click "Continue with Google"
5. Check backend logs for any errors

## Common Issues

### "redirect_uri_mismatch"
- **Fix:** Check that the redirect URI in Google Console exactly matches `http://localhost:5000/api/auth/google/callback`
- Make sure there are no trailing slashes or typos

### "access_denied"
- **Fix:** Make sure you've added your email as a test user in OAuth consent screen (if in testing mode)

### "invalid_client"
- **Fix:** Verify your Client ID and Client Secret are correct in `.env`
- Make sure there are no extra spaces or quotes (unless the value itself has quotes)

### "id_token missing"
- **Fix:** Make sure you've enabled Google+ API
- Check that the OAuth consent screen is properly configured

## Debugging

Check backend logs when authenticating - you should see:
1. "Google tokens received - expiry_date type: number" (or string)
2. User creation/update in database
3. "Redirecting to frontend: http://localhost:3000/auth/callback"

If you see errors, check:
- Backend terminal for detailed error messages
- Google Cloud Console > APIs & Services > Credentials (verify redirect URI)
- Browser console for frontend errors

