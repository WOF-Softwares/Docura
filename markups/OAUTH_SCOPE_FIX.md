# 🔧 OAuth Scope Fix - Missing account_info.read

## The Problem

Error: `missing_scope: account_info.read`

This happens because Dropbox needs permission to read your account info (email) after OAuth.

## ✅ The Fix (2 Steps)

### Step 1: Add Missing Scope in Dropbox Console

1. **Go to Permissions tab:**
   ```
   https://www.dropbox.com/developers/apps/info/oni7s2m0zhzjqb1#permissions
   ```

2. **Enable this scope:**
   - ☑️ **`account_info.read`** - View basic information about user's account

3. **You should now have ALL required scopes:**
   - ☑️ `account_info.read` ← NEW!
   - ☑️ `files.content.write`
   - ☑️ `files.content.read`

4. **Click "Submit" button at the bottom!**

### Step 2: Rebuild Docura

The code has been updated to request all 3 scopes:

```rust
// Updated OAuth URL now includes account_info.read
scope=account_info.read files.content.write files.content.read
```

Rebuild the app:
```fish
# Stop current build (Ctrl+C)
npm run tauri dev
```

## 🕐 OAuth Code Expiration

**Important:** OAuth codes expire in ~10 minutes!

When testing OAuth:
1. Click "Connect Dropbox" in Docura
2. Authorize on Dropbox immediately
3. **Copy code right away**
4. **Paste in Docura immediately**
5. Click "Connect" button

Don't wait or the code will expire!

## 🧪 Test Flow

After fixing:

1. **Enable `account_info.read` in Dropbox console**
2. **Click "Submit"**
3. **Rebuild Docura:** `npm run tauri dev`
4. **Settings → Cloud Sync → Connect Dropbox**
5. **Authorize quickly**
6. **Copy & paste code immediately**
7. **✅ Success!** Should show your email

## 🎯 Expected Result

After successful OAuth:
```
✅ Dropbox connected!
Account: journalehsan@gmail.com
Target Folder: /Apps/Docura Sync/
```

## 🐛 Still Having Issues?

### "Code expired" error:
- Be faster! Copy and paste the code within 1-2 minutes
- Don't wait between steps

### "Missing scope" error:
- Make sure you clicked "Submit" in Permissions tab
- Wait a minute and try again
- Try generating a new access token to verify permissions are set

### "Invalid grant" error:
- Code was used already or expired
- Start over: Click "Connect Dropbox" again
- Get a fresh code

---

**TL;DR:** 
1. Add `account_info.read` scope in Dropbox console
2. Click Submit
3. Rebuild Docura
4. Test OAuth (be quick!)

