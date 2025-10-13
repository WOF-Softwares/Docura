---
title: "Dropbox Cloud Sync"
category: "Cloud Sync"
difficulty: "Beginner"
readTime: "10 min read"
---

# ☁️ Dropbox Cloud Sync Guide

**Access your documents from anywhere with secure Dropbox synchronization!**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Security & Privacy](#security--privacy)
3. [Getting Started](#getting-started)
4. [Managing Sync Folders](#managing-sync-folders)
5. [How Auto-Sync Works](#how-auto-sync-works)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

---

## 🌟 Overview

Docura's Dropbox sync lets you access your markdown documents from any device. Write on your desktop, continue on your laptop - your work follows you everywhere!

### ✨ Key Features

- **🔐 Secure App Folder** - Only accesses `/Apps/Docura Sync/` in your Dropbox
- **🔄 Auto-Sync** - Saves automatically sync to cloud
- **📁 Multiple Folders** - Sync as many folders as you need
- **⚡ Fast & Reliable** - Built on Dropbox's robust infrastructure
- **🆓 Free** - No subscriptions, no limits

### 📊 How It Works

```
Your Computer                    Dropbox Cloud
┌─────────────┐                 ┌──────────────────┐
│ ~/Documents/│                 │ /Apps/           │
│   Notes/    │ ──── Sync ───→  │   Docura Sync/   │
│   *.md      │                 │     Notes/       │
└─────────────┘                 │       *.md       │
                                └──────────────────┘
```

---

## 🔐 Security & Privacy

### App Folder Architecture

Docura uses **App Folder access**, the most secure Dropbox permission:

✅ **What Docura CAN access:**
- Only `/Apps/Docura Sync/` folder
- Files you explicitly choose to sync
- Nothing else!

❌ **What Docura CANNOT access:**
- Your other Dropbox files
- Your photos, documents, backups
- Any folder outside `/Apps/Docura Sync/`

### Privacy First

- ✅ **No tracking** - Zero analytics or telemetry
- ✅ **Local-first** - Files stored on your device
- ✅ **Open source** - Audit the code yourself
- ✅ **OAuth 2.0** - Industry-standard authentication
- ✅ **Token encryption** - Secure credential storage

**Your data stays private. Always.** 🔒

---

## 🚀 Getting Started

### Prerequisites

- Dropbox account (free tier works!)
- Docura v1.0.5 or later
- Internet connection for sync

### Step 1: Connect Dropbox

1. **Open Settings**
   - Click ⚙️ icon in toolbar
   - Or press `Ctrl+Shift+P`

2. **Go to Cloud Sync Tab**
   - Click "Cloud Sync" in sidebar

3. **Connect Dropbox**
   - Click "Connect Dropbox" button
   - Browser opens automatically

4. **Authorize**
   - Log into Dropbox (if needed)
   - Click "Allow" to authorize
   - Copy the authorization code

5. **Complete Connection**
   - Paste code in Docura dialog
   - Click "Submit"
   - ✅ Connected!

### Step 2: Add Your First Sync Folder

1. **Click "Add Folder to Sync"**

2. **Choose Local Folder**
   - Select folder with your markdown files
   - Example: `~/Documents/Notes`

3. **Name It for Dropbox**
   - Give it a clear name
   - Example: "My Notes"
   - Files will sync to `/Apps/Docura Sync/My Notes/`

4. **Done!**
   - Folder appears in sync list
   - Auto-sync is now active!

---

## 📁 Managing Sync Folders

### Adding More Folders

You can sync multiple folders:

```
Local                           Dropbox
~/Documents/Work/      →        /Apps/Docura Sync/Work/
~/Notes/Personal/      →        /Apps/Docura Sync/Personal/
~/Projects/Docs/       →        /Apps/Docura Sync/Project Docs/
```

**To add a folder:**
1. Click "Add Folder to Sync"
2. Select local folder
3. Name it for Dropbox
4. Done!

### Removing Folders

**To stop syncing a folder:**
1. Find folder in sync list
2. Click 🗑️ (trash icon)
3. Confirm removal
4. Folder stops syncing (files remain on Dropbox)

### Viewing Sync Status

In Settings → Cloud Sync, you'll see:

- **Account:** Your Dropbox email
- **Status:** Connected ✅
- **Sync Folders:** List of all synced folders
  - Local path
  - Dropbox path
  - Remove button

---

## 🔄 How Auto-Sync Works

### Automatic Sync Triggers

Files sync to Dropbox automatically when you:

1. **Manual Save** - Press `Ctrl+S`
2. **Auto-Save** - After 2 seconds of inactivity (if enabled)
3. **Switch Files** - When changing documents
4. **Close Docura** - On application exit

### What Gets Synced

✅ **Synced:**
- Markdown files (`.md`, `.markdown`)
- Text files (`.txt`)
- All files in configured sync folders

❌ **Not Synced:**
- Files outside sync folders
- System files
- Temporary files

### Sync Behavior

```
You Save File
    ↓
Docura Checks: Is this in a sync folder?
    ↓ YES
Upload to Dropbox
    ↓
Done! ✅
```

**Sync is:**
- ⚡ Fast - Only changed files upload
- 🔄 Automatic - No manual intervention
- 🔒 Secure - Encrypted in transit

---

## 🔧 Troubleshooting

### Connection Issues

**Problem:** Can't connect to Dropbox

**Solutions:**
1. ✅ Check internet connection
2. ✅ Try disconnecting and reconnecting
3. ✅ Clear browser cache and try again
4. ✅ Generate new access token in Dropbox settings

### Sync Not Working

**Problem:** Files not syncing

**Solutions:**
1. ✅ Verify folder is in sync list
2. ✅ Check Dropbox connection status
3. ✅ Ensure file is saved (not just edited)
4. ✅ Look for error messages in Settings

### Authorization Code Expired

**Problem:** "Code doesn't exist or has expired"

**Solution:**
- OAuth codes expire in ~10 minutes
- Get a fresh code and paste immediately
- Be quick! ⚡

### Missing Scopes

**Problem:** Permission errors

**Solution:**
- Make sure you granted all permissions
- Re-authorize if needed
- Check Dropbox app settings

### File Not Found

**Problem:** Can't find synced files on Dropbox

**Location:**
```
Dropbox (web or app)
└── Apps/
    └── Docura Sync/
        └── [Your Folder Name]/
            └── your-file.md
```

---

## ❓ FAQ

### Q: Is Dropbox sync free?
**A:** Yes! Both Docura and Dropbox free tier work together. No subscriptions.

### Q: How much Dropbox storage do I need?
**A:** Markdown files are tiny! Free tier (2GB) holds thousands of documents.

### Q: Can I sync the same folder on multiple computers?
**A:** Yes! Install Docura on each computer, connect Dropbox, add the same folders.

### Q: What happens if I edit on two devices simultaneously?
**A:** Dropbox handles conflicts. You'll see both versions - choose which to keep.

### Q: Can I share synced folders with others?
**A:** Yes! Share `/Apps/Docura Sync/[folder]` from Dropbox. They can view/edit if they have Docura.

### Q: Does sync work offline?
**A:** Files must sync when online. Offline edits will sync when connection returns.

### Q: Can I use other cloud providers?
**A:** Coming soon! Google Drive, OneDrive, and self-hosted options are planned.

### Q: Is this production-ready?
**A:** We submitted to Dropbox for approval on **October 13, 2025**. Waiting 1-2 weeks for production approval. Currently works great in development mode!

### Q: How do I disconnect Dropbox?
**A:** Settings → Cloud Sync → Click "Disconnect Dropbox". Removes connection but keeps files.

### Q: Where are my credentials stored?
**A:** Securely in `~/.local/share/docura/config.json` with encryption. Never in plaintext.

---

## 🎯 Best Practices

### 1. Organize Your Folders
```
Good Structure:
├── Work/
│   ├── Projects/
│   └── Meetings/
└── Personal/
    ├── Journal/
    └── Ideas/
```

### 2. Name Folders Clearly
- ✅ "Work Projects" - Clear and descriptive
- ❌ "Stuff" - Too vague

### 3. Don't Sync Everything
- Only sync what you need across devices
- Keep local-only files separate

### 4. Regular Backups
- Dropbox is sync, not backup
- Keep separate backups of important work

### 5. Monitor Sync Status
- Check Settings occasionally
- Verify files are syncing correctly

---

## 🚀 Advanced Tips

### Multiple Computers Setup

**Computer 1 (Desktop):**
```bash
Sync: ~/Documents/Work/     → /Apps/Docura Sync/Work/
Sync: ~/Notes/              → /Apps/Docura Sync/Notes/
```

**Computer 2 (Laptop):**
```bash
Sync: ~/Work/               → /Apps/Docura Sync/Work/
Sync: ~/Documents/Notes/    → /Apps/Docura Sync/Notes/
```

**Result:** Same Dropbox folders, different local paths. Works perfectly!

### Team Collaboration

1. Create shared Dropbox folder
2. Each team member:
   - Connects Dropbox in Docura
   - Adds shared folder to sync
3. Everyone sees same files, real-time!

### Selective Sync

Only sync specific project folders:
```
~/Projects/
├── ProjectA/     ← Sync this ✅
├── ProjectB/     ← Don't sync ❌
└── ProjectC/     ← Sync this ✅
```

---

## 📚 Related Documentation

- [Privacy Policy →](../privacy.html)
- [Dropbox App Setup (Developers) →](../sync/DROPBOX_APP_SETUP.md)
- [OAuth Redirect Setup →](../sync/OAUTH_REDIRECT_SETUP.md)
- [API Reference →](../sync/API_REFERENCE.md)

---

## 🎉 What's Next?

### Coming Soon
- ☁️ **Google Drive** - Alternative cloud provider
- ☁️ **OneDrive** - Microsoft integration
- ☁️ **Self-Hosted** - ownCloud, Nextcloud support
- 🔄 **Conflict Resolution** - Visual merge tool
- 📱 **Mobile App** - Access on phone/tablet
- 🌐 **Web Editor** - Edit from any browser

---

## 💡 Need Help?

- 💬 [GitHub Discussions](https://github.com/wof-softwares/Docura/discussions)
- 🐛 [Report Issues](https://github.com/wof-softwares/Docura/issues)
- 📧 [Email Support](mailto:journalehsan@gmail.com)

---

<div align="center">

**Happy Syncing! ☁️✨**

*Your documents, everywhere you are.*

**Status:** Submitted for Dropbox production approval on **October 13, 2025**

[⬇️ Get Docura](https://wof-softwares.github.io/Docura) | 
[⭐ Star on GitHub](https://github.com/wof-softwares/Docura)

</div>

