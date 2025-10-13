# 👤 Dropbox Sync User Guide

## 🚀 Getting Started

### Step 1: Connect Your Dropbox Account

1. **Open Settings**
   - Click the ⚙️ settings icon in the toolbar
   - Or use keyboard shortcut `Ctrl/Cmd + ,`

2. **Navigate to Sync Tab**
   - Click on the "☁️ Sync" tab in the settings panel

3. **Connect to Dropbox**
   - Click the "Connect to Dropbox" button
   - You'll be redirected to Dropbox's authorization page
   - Sign in to your Dropbox account and authorize Docura
   - Return to Docura when prompted

✅ **Success!** You should see your account info displayed in the settings.

### Step 2: Add Your First Sync Folder

1. **Click "Add Sync Folder"**
   - In the Sync settings, click the "+ Add Sync Folder" button

2. **Choose Local Folder**
   - Select the folder on your computer you want to sync
   - This can be any folder containing markdown files

3. **Set Dropbox Path**
   - Choose where in your Dropbox this folder should sync
   - Example: `/Apps/Docura/My Notes`

4. **Configure Sync Direction**
   - **Bidirectional**: Changes sync both ways (recommended)
   - **Upload Only**: Only upload local changes to Dropbox
   - **Download Only**: Only download changes from Dropbox

5. **Save Configuration**
   - Click "Add Folder" to save

🎉 **Congratulations!** Your folder is now synced with Dropbox.

## 📁 Managing Synced Files

### Sync Status Indicators

In the file sidebar, you'll see icons next to your files:

- ✅ **Green Checkmark**: File is synced and up-to-date
- 🔄 **Blue Arrow**: File is currently syncing
- ⚠️ **Yellow Warning**: Sync conflict needs resolution
- ❌ **Red X**: Sync error occurred
- 📤 **Upload Arrow**: Waiting to upload changes
- 📥 **Download Arrow**: Waiting to download changes
- ⏸️ **Pause Icon**: Sync is paused for this file

### Manual Sync Options

**Right-click Context Menu:**
- Right-click any file or folder in the sidebar
- Select "☁️ Sync to Dropbox" to manually sync
- For folders, choose "📁 Sync Folder" to sync all contents

**Toolbar Sync Button:**
- Click the sync button in the toolbar for global sync status
- Green: All files synced
- Blue: Sync in progress
- Red: Sync issues need attention

## ⚔️ Handling Conflicts

### What Causes Conflicts?

Conflicts occur when:
- You edit a file on multiple devices before it syncs
- Someone else edits a shared file simultaneously
- Files are modified while offline and differ when reconnecting

### Resolving Conflicts

When a conflict occurs:

1. **Conflict Notification**
   - You'll see a notification about the conflict
   - The file will show a ⚠️ warning icon

2. **Open Conflict Resolver**
   - Click the warning icon or notification
   - The conflict resolution dialog will open

3. **Choose Resolution**
   - **Keep Local Version**: Use your current changes
   - **Keep Remote Version**: Use the Dropbox version
   - **View Side-by-Side**: Compare both versions
   - **Merge Changes**: Manually combine both versions
   - **Keep Both**: Save both versions with different names

4. **Apply Resolution**
   - Click "Apply" to resolve the conflict
   - The file will sync normally afterward

### Automatic Conflict Resolution

You can set automatic resolution in settings:
- **Ask Every Time**: Show dialog for each conflict (default)
- **Always Keep Local**: Automatically keep your version
- **Always Keep Remote**: Automatically keep Dropbox version

## ⚙️ Advanced Settings

### Sync Frequency

**Auto-Sync Options:**
- **Real-time**: Sync immediately when files change (recommended)
- **Every 5 minutes**: Batch sync every 5 minutes
- **Every 15 minutes**: Sync every 15 minutes
- **Manual Only**: Only sync when you trigger it

### File Exclusions

**Exclude File Types:**
Add patterns to exclude certain files:
- `*.tmp` - Exclude temporary files
- `.*` - Exclude hidden files
- `node_modules/` - Exclude specific folders
- `*.log` - Exclude log files

**Example Exclusion Patterns:**
```
*.tmp
*.log
.DS_Store
node_modules/
.git/
*.backup
```

### Storage Management

**Monitor Usage:**
- View your Dropbox storage usage in settings
- See how much space Docura is using
- Get warnings when approaching storage limits

**Storage Optimization:**
- Enable "Optimize Storage" to compress older files
- Set automatic cleanup for temporary sync files
- Configure maximum local cache size

## 🔔 Notifications

### Notification Types

- **Sync Complete**: When files finish syncing
- **Conflict Detected**: When manual resolution is needed  
- **Error Occurred**: When sync operations fail
- **Storage Warning**: When approaching Dropbox limits
- **Connection Issues**: When network problems occur

### Notification Settings

Customize notifications in the Sync settings:
- ✅ Show success notifications
- ✅ Show conflict notifications (recommended)
- ✅ Show error notifications (recommended)
- ❌ Show progress notifications (can be noisy)

## 🚨 Troubleshooting

### Common Issues

**"Authentication Failed"**
- Your Dropbox token may have expired
- Click "Reconnect to Dropbox" in settings
- Re-authorize the application

**"File Not Found"**
- The file may have been deleted on Dropbox
- Check your Dropbox web interface
- Use "Download from Dropbox" to restore

**"Sync Stuck"**
- Large files may take time to sync
- Check your internet connection
- Try pausing and resuming sync

**"Permission Denied"**
- Check file permissions on your local system
- Ensure Docura has write access to the folder
- Try running as administrator (Windows) or with sudo (Linux/Mac)

### Speed Issues

**Slow Sync Performance:**
1. Check your internet speed
2. Reduce concurrent sync operations in settings
3. Exclude large non-markdown files
4. Enable compression for large files

**High CPU/Memory Usage:**
1. Reduce sync frequency for large folders
2. Enable "Low Power Mode" in settings
3. Exclude unnecessary file types
4. Close other bandwidth-heavy applications

### Network Issues

**Working Offline:**
- Docura will queue changes when offline
- Changes sync automatically when connection returns
- You'll see "Offline" status in the sync indicator

**Firewall/Proxy Issues:**
- Ensure Dropbox API endpoints are not blocked
- Configure proxy settings if needed
- Contact your IT administrator for corporate networks

## 💡 Tips and Best Practices

### Organization Tips

**Folder Structure:**
```
📁 Dropbox/Apps/Docura/
├── 📁 Projects/
│   ├── 📝 Project A Notes.md
│   └── 📝 Project B Planning.md
├── 📁 Daily Notes/
│   ├── 📝 2025-10-13.md
│   └── 📝 2025-10-14.md
└── 📁 Reference/
    ├── 📝 Cheat Sheets.md
    └── 📝 Templates.md
```

**Naming Conventions:**
- Use descriptive filenames
- Include dates in daily notes: `YYYY-MM-DD.md`
- Avoid special characters: `<>:"/\|?*`
- Use hyphens instead of spaces: `my-document.md`

### Performance Tips

**Optimize Sync Performance:**
- Keep individual files under 10MB
- Use fewer, larger files instead of many small ones
- Sync only essential folders
- Regular cleanup of unused files

**Battery Optimization:**
- Enable "Low Power Mode" on laptops
- Reduce sync frequency when on battery
- Pause sync during critical work sessions

### Security Best Practices

**File Security:**
- Use Dropbox's built-in encryption
- Consider additional encryption for sensitive documents
- Regularly review shared folder permissions
- Enable two-factor authentication on Dropbox

**Access Control:**
- Regularly review connected apps in Dropbox settings
- Revoke access for unused applications
- Monitor file activity in Dropbox logs

## 📊 Sync Statistics

View detailed sync information in Settings → Sync → Statistics:

**Usage Statistics:**
- Total files synced
- Total data transferred
- Sync success rate
- Average sync time

**Recent Activity:**
- Last 10 sync operations
- Recent conflicts and resolutions
- Error history and patterns

**Performance Metrics:**
- Network usage by Docura
- Sync operation latency
- Peak sync times

## 🆘 Getting Help

**In-App Help:**
- Hover over any setting for tooltips
- Click "?" icons for contextual help
- Check the status bar for sync information

**Support Resources:**
- Visit our documentation website
- Check community forums for common issues
- Contact support through the app's Help menu

**Logs and Diagnostics:**
- Enable "Debug Logging" in settings for detailed logs
- Export sync logs for support requests
- Use "Run Sync Diagnostic" to test connectivity

---

## 🎯 Quick Reference

### Keyboard Shortcuts
- `Ctrl/Cmd + Shift + S` - Manual sync current file
- `Ctrl/Cmd + Shift + A` - Sync all files
- `Ctrl/Cmd + ,` - Open settings
- `Ctrl/Cmd + Shift + R` - Resolve conflicts

### Status Icons Quick Guide
| Icon | Meaning |
|------|---------|
| ✅ | Synced and up-to-date |
| 🔄 | Currently syncing |
| ⚠️ | Conflict needs resolution |
| ❌ | Sync error |
| 📤 | Waiting to upload |
| 📥 | Waiting to download |
| ⏸️ | Sync paused |
| 🌐 | Offline mode |

### Common File Patterns to Exclude
```
# Temporary files
*.tmp
*.temp
*.swp
*.swo

# System files
.DS_Store
Thumbs.db
desktop.ini

# Development files
node_modules/
.git/
.svn/
*.log

# Backup files
*.bak
*.backup
*~
```

This guide will help you get the most out of Docura's Dropbox sync feature!