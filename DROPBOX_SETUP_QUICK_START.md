# 🚀 Dropbox Sync - Quick Start Guide

## Step-by-Step Setup (5 Minutes)

### 1. Create Dropbox App

1. **Go to Dropbox Developers:**
   - Visit: https://www.dropbox.com/developers/apps
   - Sign in with your Dropbox account

2. **Create New App:**
   - Click "Create app"
   - Choose: **Scoped access**
   - Choose: **Full Dropbox** access
   - App name: **Docura** (or any name you prefer)
   - Click "Create app"

3. **Configure App Settings:**
   - Go to the "Settings" tab
   - Under "OAuth 2", find "Redirect URIs"
   - Add: `http://localhost:8080/oauth/callback`
   - Click "Add"

4. **Set Permissions:**
   - Go to "Permissions" tab
   - Enable these scopes:
     - ✅ `files.content.write`
     - ✅ `files.content.read`
     - ✅ `files.metadata.read`
   - Click "Submit" at bottom

5. **Get Credentials:**
   - Go back to "Settings" tab
   - Find "App key" (this is your CLIENT_ID)
   - Click "Show" next to "App secret" (this is your CLIENT_SECRET)
   - **Keep these safe!**

### 2. Set Environment Variables

**Option A: In Terminal (temporary)**
```bash
export DROPBOX_CLIENT_ID="your_app_key_here"
export DROPBOX_CLIENT_SECRET="your_app_secret_here"
```

**Option B: In your shell config (permanent)**

For Bash (`~/.bashrc`):
```bash
echo 'export DROPBOX_CLIENT_ID="your_app_key"' >> ~/.bashrc
echo 'export DROPBOX_CLIENT_SECRET="your_app_secret"' >> ~/.bashrc
source ~/.bashrc
```

For Fish (`~/.config/fish/config.fish`):
```bash
echo 'set -x DROPBOX_CLIENT_ID "your_app_key"' >> ~/.config/fish/config.fish
echo 'set -x DROPBOX_CLIENT_SECRET "your_app_secret"' >> ~/.config/fish/config.fish
source ~/.config/fish/config.fish
```

For Zsh (`~/.zshrc`):
```bash
echo 'export DROPBOX_CLIENT_ID="your_app_key"' >> ~/.zshrc
echo 'export DROPBOX_CLIENT_SECRET="your_app_secret"' >> ~/.zshrc
source ~/.zshrc
```

**Option C: Create `.env` file (project-specific)**
```bash
# In project root
echo "DROPBOX_CLIENT_ID=your_app_key" > .env
echo "DROPBOX_CLIENT_SECRET=your_app_secret" >> .env
```

### 3. Verify Setup

```bash
# Check if variables are set
echo $DROPBOX_CLIENT_ID
echo $DROPBOX_CLIENT_SECRET
```

You should see your credentials printed.

### 4. Build and Run Docura

```bash
# Install dependencies (if not done)
npm install

# Run in development mode
npm run tauri dev
```

### 5. Connect Dropbox in Docura

1. **Open Settings:**
   - Click ⚙️ (gear icon) in toolbar
   - Or press `Ctrl+Shift+P`

2. **Go to Cloud Sync Tab:**
   - Click "☁️ Cloud Sync" tab

3. **Connect Dropbox:**
   - Scroll to "Dropbox Sync" section
   - Click "Connect Dropbox" button

4. **Complete OAuth:**
   - Copy the URL from the prompt
   - Open it in your browser
   - Click "Allow" to authorize Docura
   - Copy the authorization code
   - Paste it in the Docura prompt
   - Click OK

5. **Verify Connection:**
   - You should see your Dropbox email
   - Connection status shows "✓ Dropbox connected!"

### 6. Add Folders to Sync

1. **Click "Add Folder to Sync"**

2. **Select Local Folder:**
   - Choose a folder on your computer
   - Example: `/home/user/Documents/my_notes`

3. **Name Dropbox Subfolder:**
   - Enter a name: `my_notes`
   - This creates: `/My Documents/my_notes` in Dropbox

4. **Folder Added:**
   - You'll see it in the sync folders list
   - Shows: Local path → Dropbox path

### 7. Enable Auto-Sync

1. **Toggle Auto-Sync:**
   - Check "Enable Dropbox Auto-Sync" checkbox
   - Toast: "Dropbox auto-sync enabled"

2. **Done!**
   - Files in synced folders will auto-upload on save

### 8. Test It!

1. **Create/Open a File:**
   - In a synced folder
   - Example: `/home/user/Documents/my_notes/test.md`

2. **Write Content:**
   ```markdown
   # Test Dropbox Sync
   
   This file should sync to Dropbox!
   ```

3. **Save:**
   - Press `Ctrl+S`
   - Toast: "Saved: test.md"
   - Console: "✅ Synced to Dropbox: test.md"

4. **Verify in Dropbox:**
   - Go to https://www.dropbox.com
   - Navigate to `/My Documents/my_notes/`
   - You should see `test.md`!

## 🎉 Success!

Your Dropbox sync is now active!

### What Happens Now:

✅ **Auto-Sync on Save:** Every time you save a file in a synced folder, it uploads to Dropbox

✅ **Auto-Sync on Auto-Save:** If auto-save is enabled, files sync automatically 2 seconds after typing stops

✅ **Background Sync:** Uploads happen silently in the background

✅ **Organized Structure:** Files are organized in subfolders under "My Documents" (or your target folder)

### Tips:

- **Multiple Folders:** You can add multiple local folders, each with its own Dropbox subfolder
- **Target Folder:** You can change the Dropbox target folder in Settings
- **Disconnect:** Click "Disconnect Dropbox" to stop syncing and clear credentials
- **Check Console:** Use browser DevTools (F12) to see sync logs

## 📁 Example Setup

```
Local Folders:
├── /home/user/Documents/notes      → Dropbox: /My Documents/notes
├── /home/user/work/projects        → Dropbox: /My Documents/projects
└── /home/user/personal/diary       → Dropbox: /My Documents/diary

When you save:
/home/user/Documents/notes/todo.md  → /My Documents/notes/todo.md
/home/user/work/projects/plan.md    → /My Documents/projects/plan.md
```

## 🐛 Troubleshooting

### "Failed to connect Dropbox"
- Check environment variables are set: `echo $DROPBOX_CLIENT_ID`
- Make sure App key and secret are correct
- Verify redirect URI is `http://localhost:8080/oauth/callback`

### Files Not Syncing
- Check "Enable Dropbox Auto-Sync" is checked
- Verify file is in a synced folder
- Look at console logs (F12) for errors
- Try disconnect and reconnect

### "Not connected" After Some Time
- Tokens auto-refresh, but may fail
- Disconnect and reconnect Dropbox
- Check internet connection

### OAuth Code Invalid
- Code expires quickly, paste it immediately
- Make sure you copied the entire code
- Try the OAuth flow again

## 📚 More Info

- **Full Documentation:** `docs/DROPBOX_SYNC_INTEGRATION.md`
- **User Guide:** `docs/sync/USER_GUIDE.md`
- **Troubleshooting:** `docs/sync/TROUBLESHOOTING.md`
- **API Reference:** `docs/sync/API_REFERENCE.md`

## 🚀 Advanced

### Change Target Folder
Currently "My Documents", but you can change it:

```javascript
// In Settings Dialog, add UI for:
await invoke('dropbox_set_target_folder', { 
  folderName: 'Docura Files' 
});
```

### Check Sync Status
```javascript
const status = await invoke('dropbox_get_status');
console.log(status);
// { connected: true, email: "user@example.com", targetFolder: "My Documents" }
```

### Manual Sync
```javascript
await invoke('dropbox_sync_file', {
  localPath: '/path/to/file.md',
  content: fileContent
});
```

---

**Enjoy seamless Dropbox sync in Docura!** ☁️✨

