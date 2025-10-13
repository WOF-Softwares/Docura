# 🔧 Dropbox App Setup Guide

## Creating a Dropbox App for Docura

### Prerequisites
- A Dropbox account
- Access to the [Dropbox App Console](https://www.dropbox.com/developers/apps)

## Step-by-Step Setup

### 1. Create New App

1. Visit [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Click **"Create app"** button
3. Choose the following options:

   **Choose an API:**
   - ✅ Select **"Scoped access"** (recommended)

   **Choose the type of access you need:**
   - ✅ Select **"App folder"** ⭐ (IMPORTANT!)
   
   > **Why App Folder?**
   > - More secure - only accesses `/Apps/Docura/` folder
   > - Users trust it more (limited permissions)
   > - Cleaner organization
   > - Better privacy

   **Name your app:**
   - Enter a unique name (e.g., "Docura Sync" or "Docura - Markdown Sync")
   - Name must be unique across all Dropbox apps

4. Click **"Create app"**

### 2. Configure App Settings

Once your app is created, configure these settings:

#### A. Permissions Tab

Add the following permissions:
- ✅ `files.content.write` - Upload and modify files
- ✅ `files.content.read` - Download and read files

Click **"Submit"** to save permissions.

#### B. Settings Tab

**App key and secret:**
- Copy your **App key** (Client ID)
- Click **"Show"** to reveal **App secret** (Client Secret)
- ⚠️ **Keep these secret!** Don't commit to git

**OAuth 2:**
- Redirect URIs: Add `http://localhost:8080/oauth/callback`
  (You can change the port if needed)

**App folder name:**
- Will be `/Apps/[Your App Name]/` in user's Dropbox
- Example: `/Apps/Docura/`

### 3. Set Environment Variables

#### For Development:

**Linux/macOS:**
```bash
# Add to ~/.bashrc or ~/.zshrc
export DROPBOX_CLIENT_ID="your_app_key_here"
export DROPBOX_CLIENT_SECRET="your_app_secret_here"
```

**Windows (PowerShell):**
```powershell
$env:DROPBOX_CLIENT_ID="your_app_key_here"
$env:DROPBOX_CLIENT_SECRET="your_app_secret_here"
```

**Windows (CMD):**
```cmd
set DROPBOX_CLIENT_ID=your_app_key_here
set DROPBOX_CLIENT_SECRET=your_app_secret_here
```

#### For Production:

Store credentials securely:
- Use environment variables on server
- Use secure config management (e.g., AWS Secrets Manager, HashiCorp Vault)
- Never commit credentials to git
- Add `.env` files to `.gitignore`

### 4. Build and Test

1. **Restart your terminal** to load environment variables

2. **Build Docura:**
   ```bash
   npm run tauri build
   ```

3. **Run Docura:**
   ```bash
   npm run tauri dev
   ```

4. **Test Connection:**
   - Open Docura
   - Go to Settings → Cloud Sync
   - Click "Connect Dropbox"
   - You should see the OAuth dialog
   - Browser opens to Dropbox authorization page
   - Authorize the app
   - Paste the code back in Docura
   - ✅ Connection successful!

## 📁 Understanding App Folder Access

### What Users See

When users authorize Docura with App Folder access:

1. **In Dropbox:**
   - A folder appears at `/Apps/Docura/`
   - All synced files go into this folder
   - Organized by user's configured subfolders

2. **In Docura:**
   - Users select local folders to sync
   - Files automatically sync to `/Apps/Docura/[subfolder]/`
   - Example: Local `~/Documents/Notes` → Dropbox `/Apps/Docura/Notes/`

### Security Benefits

✅ **Limited Scope:**
- App can ONLY access `/Apps/Docura/` folder
- Cannot access any other Dropbox files
- Cannot access root Dropbox folder

✅ **User Trust:**
- Clear, visible folder in Dropbox
- Easy to see what's being synced
- Easy to revoke access (delete folder)

✅ **Data Isolation:**
- Synced files are separate from other data
- No mixing with user's existing Dropbox structure
- Clean uninstall (just delete app folder)

## 🔒 Security Best Practices

### Credentials Management

❌ **DON'T:**
- Commit credentials to git
- Hard-code credentials in source
- Share credentials in public channels
- Use production credentials in development

✅ **DO:**
- Use environment variables
- Rotate credentials periodically
- Use different credentials for dev/staging/prod
- Monitor Dropbox App Console for unusual activity

### User Data Protection

✅ **Best Practices:**
- Never log file contents
- Use HTTPS for all API calls (already handled by Dropbox)
- Don't cache credentials in memory longer than needed
- Clear sensitive data on logout
- Implement proper error handling (don't leak info in errors)

## 🧪 Testing the Integration

### Manual Test Checklist

- [ ] OAuth flow completes successfully
- [ ] User info displays correctly in settings
- [ ] Can add sync folders
- [ ] Files upload to correct Dropbox path
- [ ] Files download from Dropbox
- [ ] Sync status updates correctly
- [ ] Can disconnect and reconnect
- [ ] Token refresh works (wait for expiry)
- [ ] Error handling works (disconnect internet, try sync)

### Automated Tests

```bash
# Run integration tests
npm run test:integration

# Test specific scenarios
npm run test:dropbox
```

## 🐛 Troubleshooting

### "Invalid OAuth credentials" Error
- Check environment variables are set
- Verify App Key and Secret are correct
- Make sure you've enabled the app in Dropbox console

### "Invalid redirect URI" Error
- Check redirect URI in Dropbox app settings
- Must exactly match what's configured in code
- Include protocol (http/https) and port

### "Insufficient permissions" Error
- Check permissions tab in Dropbox console
- Make sure you've submitted permission changes
- May need to re-authorize after permission changes

### Files Not Syncing
- Verify app folder exists in Dropbox
- Check user has granted permissions
- Look for error messages in console
- Try disconnecting and reconnecting

## 📚 Additional Resources

- [Dropbox API Documentation](https://www.dropbox.com/developers/documentation)
- [OAuth 2.0 Guide](https://www.dropbox.com/developers/documentation/http/documentation#oauth2)
- [App Folder Guide](https://www.dropbox.com/developers/reference/developer-guide#app-folder)
- [Dropbox SDKs](https://www.dropbox.com/developers/documentation/http/documentation#libraries)

## 🆘 Support

If you encounter issues:
1. Check this guide first
2. Review `TROUBLESHOOTING.md`
3. Check Dropbox App Console for errors
4. Enable debug logging in Docura
5. Open an issue on GitHub with:
   - Error messages
   - Steps to reproduce
   - App console screenshots (redact credentials!)

---

**Last Updated:** 2025-01-13
**Dropbox API Version:** v2

