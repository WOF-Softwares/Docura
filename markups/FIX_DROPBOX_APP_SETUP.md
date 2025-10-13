# 🔧 Fix Dropbox App - "This app is not valid" Error

## Problem
Error: **"This app is not valid"**

This happens because:
1. ❌ App is in Development mode (1/500 users)
2. ❌ You haven't added yourself as a development user
3. ❌ Permissions might not be set correctly

## ✅ Solution - 3 Steps

### Step 1: Add Yourself as Development User

1. **Go to your Dropbox App Console:**
   ```
   https://www.dropbox.com/developers/apps/info/oni7s2m0zhzjqb1
   ```

2. **Scroll down to "Development users" section**

3. **Click "Enable additional users"** (if you see it)

4. **Add your email:**
   - Click "+ Add" or similar button
   - Enter: `journalehsan@gmail.com`
   - Click "Add" or "Invite"

5. **Accept the invitation:**
   - Check your email (journalehsan@gmail.com)
   - Click the invitation link
   - Accept access

### Step 2: Set Permissions (Scopes)

1. **Go to Permissions tab:**
   ```
   https://www.dropbox.com/developers/apps/info/oni7s2m0zhzjqb1#permissions
   ```

2. **Enable these scopes:**
   - ☑️ `files.content.write` - Write to app folder
   - ☑️ `files.content.read` - Read from app folder

3. **Click "Submit" button** at the bottom

4. **Important:** You might need to re-authorize the app after changing scopes

### Step 3: Verify App Settings

In **Settings tab**, confirm:

```
✅ App folder name: Docura Sync
✅ App key: oni7s2m0zhzjqb1
✅ App secret: r9oyjntvotwlp4x
✅ Redirect URI: https://wof-softwares.github.io/Docura/oauth-redirect.html
✅ Development users: journalehsan@gmail.com (added)
```

## 🧪 Test Again

After making these changes:

1. **Restart Docura** (if it's running)
   ```fish
   npm run tauri dev
   ```

2. **Settings → Cloud Sync → Connect Dropbox**

3. **Should work now!** ✅

## 🔍 Troubleshooting

### Still getting "app is not valid"?

**Check Development Users:**
- Make sure your email appears in the development users list
- Status should show "Accepted" or "Active"

**Check Permissions:**
- Go to Permissions tab
- Make sure `files.content.write` and `files.content.read` are checked
- Make sure you clicked "Submit" after selecting them

**Try clearing browser cookies:**
- Clear Dropbox cookies
- Try the OAuth flow again

### Alternative: Apply for Production

If you want to skip development mode restrictions:

1. **Go to Settings tab**
2. **Click "Apply for production"**
3. **Fill out the questionnaire:**
   - Privacy Policy URL: `https://wof-softwares.github.io/Docura/privacy.html`
   - App description: "Markdown editor with Dropbox sync"
   - Use case: "Personal document synchronization"

4. **Submit and wait for approval** (1-2 weeks)

5. **Once approved:** No need to add development users!

## 📋 Quick Checklist

Before testing:
- [ ] Added journalehsan@gmail.com as development user
- [ ] Accepted invitation email
- [ ] Set permissions: files.content.write + files.content.read
- [ ] Clicked "Submit" on permissions
- [ ] Verified redirect URI is correct
- [ ] Restarted Docura

## 🎯 Expected Result

After fixing:
1. Click "Connect Dropbox" in Docura
2. Browser opens to Dropbox
3. **See your email and app name**
4. Click "Allow"
5. Redirect to beautiful OAuth page
6. Copy code and connect!

---

**Most Common Issue:** Forgetting to add yourself as a development user!

**Quick Fix:** Add `journalehsan@gmail.com` to development users → Accept email → Try again!

