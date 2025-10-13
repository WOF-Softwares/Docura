# 🔑 Dropbox Credentials - Quick Setup

## Your Dropbox App Configuration

**App Name:** Docura Sync  
**Permission Type:** Scoped App (App Folder)  
**App Folder:** `/Apps/Docura Sync/`  
**Redirect URI:** `https://wof-softwares.github.io/Docura/oauth-redirect.html`

## 📋 Credentials

### App Key (Client ID)
```
oni7s2m0zhzjqb1
```

### App Secret (Client Secret)
⚠️ **Click "Show" in your Dropbox App Console to reveal the secret**

The app secret is hidden by default for security. Once you reveal it, copy it for the next step.

## 🚀 Quick Setup Steps

### Step 1: Set Environment Variables

**Linux/macOS:**
```bash
# Add to ~/.bashrc or ~/.zshrc
export DROPBOX_CLIENT_ID="oni7s2m0zhzjqb1"
export DROPBOX_CLIENT_SECRET="YOUR_APP_SECRET_HERE"  # Replace with actual secret
export DROPBOX_REDIRECT_URI="https://wof-softwares.github.io/Docura/oauth-redirect.html"
```

Then reload:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

**Windows (PowerShell):**
```powershell
$env:DROPBOX_CLIENT_ID="oni7s2m0zhzjqb1"
$env:DROPBOX_CLIENT_SECRET="YOUR_APP_SECRET_HERE"  # Replace with actual secret
$env:DROPBOX_REDIRECT_URI="https://wof-softwares.github.io/Docura/oauth-redirect.html"
```

**Windows (CMD):**
```cmd
set DROPBOX_CLIENT_ID=oni7s2m0zhzjqb1
set DROPBOX_CLIENT_SECRET=YOUR_APP_SECRET_HERE
set DROPBOX_REDIRECT_URI=https://wof-softwares.github.io/Docura/oauth-redirect.html
```

### Step 2: Verify GitHub Pages is Enabled

1. Go to: https://github.com/wof-softwares/Docura/settings/pages
2. Under "Source":
   - Branch: `main` (or `master`)
   - Folder: `/docs`
3. Click "Save"
4. Wait a few minutes for deployment

### Step 3: Test Your Setup

**Check if OAuth redirect page is live:**
```
https://wof-softwares.github.io/Docura/oauth-redirect.html
```

**Check if privacy policy is live:**
```
https://wof-softwares.github.io/Docura/privacy.html
```

Both should load without errors.

### Step 4: Build and Test Docura

```bash
# Restart terminal to load environment variables
npm run tauri dev
```

Or for production build:
```bash
npm run tauri build
```

### Step 5: Test OAuth Flow

1. Open Docura
2. Go to Settings (⚙️) → Cloud Sync tab
3. Click "Connect Dropbox"
4. Beautiful OAuth dialog appears
5. Browser opens to Dropbox authorization
6. You'll see your email: `journalehsan@gmail.com`
7. Click "Allow"
8. Redirected to: `https://wof-softwares.github.io/Docura/oauth-redirect.html?code=XXX`
9. Code displays beautifully
10. Click "Copy Code"
11. Paste in Docura dialog
12. Click "Connect Dropbox"
13. ✅ Success! You're connected!

## 🔒 Security Notes

### ⚠️ NEVER Commit These to Git

Add to `.gitignore` if using `.env` file:
```gitignore
.env
.env.local
*.key
*.secret
```

### ✅ Safe Locations for Secrets

**Development:**
- Environment variables (as shown above)
- `.env` file (NOT committed to git)

**Production:**
- GitHub Secrets (for CI/CD)
- Environment variables on build server
- Secure credential manager

## 📊 Your URLs

### OAuth Redirect
```
https://wof-softwares.github.io/Docura/oauth-redirect.html
```

### Privacy Policy
```
https://wof-softwares.github.io/Docura/privacy.html
```

### Documentation
```
https://wof-softwares.github.io/Docura/
```

### GitHub Repository
```
https://github.com/wof-softwares/Docura
```

## ✅ Checklist

- [ ] Revealed app secret in Dropbox console
- [ ] Set `DROPBOX_CLIENT_ID` environment variable
- [ ] Set `DROPBOX_CLIENT_SECRET` environment variable
- [ ] Set `DROPBOX_REDIRECT_URI` environment variable
- [ ] Restarted terminal to load variables
- [ ] Enabled GitHub Pages in repository settings
- [ ] Verified oauth-redirect.html is accessible
- [ ] Verified privacy.html is accessible
- [ ] Built Docura with `npm run tauri dev` or `npm run tauri build`
- [ ] Tested OAuth flow end-to-end
- [ ] Successfully connected Dropbox
- [ ] Added sync folders
- [ ] Tested file sync

## 🎯 Next Steps

### 1. Test Sync Functionality

1. In Docura settings, add a sync folder:
   - Local: Choose a folder (e.g., `~/Documents/Notes`)
   - Dropbox subfolder: Enter a name (e.g., "My Notes")

2. Create a markdown file in that folder

3. Save it in Docura

4. Check Dropbox web interface:
   - Go to: https://www.dropbox.com/home/Apps/Docura%20Sync
   - Your file should appear there!

### 2. Apply for Production (Optional)

When you're ready for >500 users:

1. Go to Dropbox App Console
2. Click "Apply for Production"
3. Provide privacy policy URL:
   ```
   https://wof-softwares.github.io/Docura/privacy.html
   ```
4. Answer questionnaire about app functionality
5. Submit and wait for approval (1-2 weeks)

### 3. Share with Users

Your users can now:
1. Download Docura
2. Go to Settings → Cloud Sync
3. Click "Connect Dropbox"
4. Follow the beautiful OAuth flow
5. Start syncing!

## 🐛 Troubleshooting

### "Invalid Client ID"
- Double-check you copied the app key correctly: `oni7s2m0zhzjqb1`
- Make sure environment variable is set

### "Invalid Redirect URI"
- Must exactly match Dropbox settings: `https://wof-softwares.github.io/Docura/oauth-redirect.html`
- No trailing slash
- Case-sensitive

### "Page Not Found" (404)
- GitHub Pages might still be deploying (wait a few minutes)
- Check Pages is enabled in repository settings
- Verify branch and folder are correct

### Environment Variables Not Loading
- Restart terminal after setting variables
- Check spelling of variable names
- Try `echo $DROPBOX_CLIENT_ID` to verify (Linux/macOS)
- Try `echo %DROPBOX_CLIENT_ID%` to verify (Windows CMD)

## 📚 Documentation

- **Setup Guide:** `docs/sync/DROPBOX_APP_SETUP.md`
- **OAuth Redirect:** `docs/sync/OAUTH_REDIRECT_SETUP.md`
- **User Guide:** `docs/sync/USER_GUIDE.md`
- **Troubleshooting:** `docs/sync/TROUBLESHOOTING.md`

## 🎉 You're All Set!

Your Dropbox integration is configured and ready to go! The OAuth redirect page is live, privacy policy is published, and you have all credentials set up.

Just set the environment variables, build Docura, and test the connection!

---

**App Owner:** journalehsan@gmail.com  
**GitHub:** wof-softwares  
**Repository:** https://github.com/wof-softwares/Docura  
**OAuth Redirect:** https://wof-softwares.github.io/Docura/oauth-redirect.html  
**Created:** January 13, 2025

