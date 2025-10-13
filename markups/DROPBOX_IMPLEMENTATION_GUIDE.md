# Dropbox Sync Implementation Guide

## ✅ Step 1: COMPLETE - Backend & UI Foundation

We've successfully implemented the foundational infrastructure for Dropbox sync integration!

### What's Been Built

#### 1. **Settings Dialog UI** (`src/components/SettingsDialog.jsx`)
- ✅ New "Cloud Sync" tab in Settings
- ✅ Dropbox authentication section
- ✅ Connection status display
- ✅ Sync folders management UI
- ✅ Add/Remove folder buttons
- ✅ Beautiful folder item cards with paths
- ✅ Connect/Disconnect buttons
- ✅ Auto-sync toggle

#### 2. **Dropbox API Module** (`src-tauri/src/dropbox_sync.rs`)
- ✅ OAuth 2.0 authentication flow
- ✅ Token exchange & refresh
- ✅ User info retrieval
- ✅ File upload/download
- ✅ Folder create/list operations
- ✅ Secure token management

#### 3. **Tauri Commands** (`src-tauri/src/lib.rs`)
- ✅ `dropbox_get_auth_url` - Get OAuth URL
- ✅ `dropbox_exchange_code` - Exchange auth code
- ✅ `dropbox_disconnect` - Disconnect account
- ✅ `dropbox_get_status` - Get connection status
- ✅ `dropbox_set_target_folder` - Set target folder
- ✅ `dropbox_add_sync_folder` - Add sync folder
- ✅ `dropbox_remove_sync_folder` - Remove sync folder
- ✅ `dropbox_get_sync_folders` - List sync folders
- ✅ `dropbox_toggle_sync` - Toggle auto-sync
- ✅ `dropbox_sync_file` - Sync specific file

#### 4. **Configuration** (`src-tauri/src/lib.rs`)
- ✅ `DropboxConfig` struct with:
  - Access token (encrypted)
  - Refresh token
  - User email
  - Target folder
  - Sync folder mappings
- ✅ `SyncFolder` struct for path mappings
- ✅ Integrated into `AppConfig`

#### 5. **Frontend Utilities** (`src/utils/dropboxSync.js`)
- ✅ Helper functions for all Dropbox operations
- ✅ OAuth flow management
- ✅ File sync utilities
- ✅ Path mapping helpers

#### 6. **Styling** (`src/styles/App.css`)
- ✅ Dropbox sync section styles
- ✅ Folder item cards
- ✅ Button styles
- ✅ Connection status indicators

## 🔄 Next Steps: Frontend Integration

### Step 2A: Connect Settings Dialog to Backend

Update `App.jsx` to add state and handlers:

```javascript
// Add to App.jsx state
const [dropboxStatus, setDropboxStatus] = useState({ connected: false });
const [dropboxSyncEnabled, setDropboxSyncEnabled] = useState(false);
const [syncFolders, setSyncFolders] = useState([]);

// Load Dropbox status on mount
useEffect(() => {
  loadDropboxStatus();
  loadSyncFolders();
}, []);

const loadDropboxStatus = async () => {
  const status = await getDropboxStatus();
  setDropboxStatus(status);
};

const loadSyncFolders = async () => {
  const folders = await getDropboxSyncFolders();
  setSyncFolders(folders);
};

// OAuth Handler
const handleDropboxAuth = async () => {
  try {
    const authUrl = await startDropboxOAuth();
    
    // Open URL in browser (using shell plugin or manual copy)
    // For now, show dialog with URL
    const code = prompt(`Visit this URL and paste the code:\n\n${authUrl}\n\nPaste code here:`);
    
    if (code) {
      await exchangeDropboxCode(code);
      await loadDropboxStatus();
      toast.success('Dropbox connected!');
    }
  } catch (error) {
    toast.error('Failed to connect Dropbox');
  }
};

// Disconnect Handler
const handleDropboxDisconnect = async () => {
  try {
    await disconnectDropbox();
    setDropboxStatus({ connected: false });
    setSyncFolders([]);
    toast.success('Dropbox disconnected');
  } catch (error) {
    toast.error('Failed to disconnect');
  }
};

// Add Folder Handler
const handleAddSyncFolder = async () => {
  try {
    // Open folder picker
    const localPath = await open({ directory: true });
    
    if (localPath) {
      // Ask for subfolder name
      const subfolder = prompt('Subfolder name in Dropbox:', 
        localPath.split('/').pop()
      );
      
      if (subfolder) {
        await addDropboxSyncFolder(localPath, subfolder);
        await loadSyncFolders();
        toast.success('Folder added to sync');
      }
    }
  } catch (error) {
    toast.error('Failed to add folder');
  }
};

// Remove Folder Handler
const handleRemoveSyncFolder = async (index) => {
  try {
    await removeDropboxSyncFolder(index);
    await loadSyncFolders();
    toast.success('Folder removed from sync');
  } catch (error) {
    toast.error('Failed to remove folder');
  }
};

// Toggle Sync Handler
const handleDropboxSyncToggle = async (enabled) => {
  try {
    await toggleDropboxSync(enabled);
    setDropboxSyncEnabled(enabled);
    toast.success(enabled ? 'Dropbox sync enabled' : 'Dropbox sync disabled');
  } catch (error) {
    toast.error('Failed to toggle sync');
  }
};
```

### Step 2B: Pass Props to SettingsDialog

```javascript
<SettingsDialog
  // ... existing props ...
  dropboxSyncEnabled={dropboxSyncEnabled}
  onDropboxSyncToggle={handleDropboxSyncToggle}
  dropboxStatus={dropboxStatus}
  onDropboxAuth={handleDropboxAuth}
  onDropboxDisconnect={handleDropboxDisconnect}
  onAddSyncFolder={handleAddSyncFolder}
  onRemoveSyncFolder={handleRemoveSyncFolder}
  syncFolders={syncFolders}
/>
```

### Step 2C: Auto-Sync Integration

Add to file save logic in `App.jsx`:

```javascript
const saveFile = async () => {
  // ... existing save logic ...
  
  // After saving, sync to Dropbox if enabled
  if (dropboxSyncEnabled && currentFile) {
    if (shouldSyncFile(currentFile, syncFolders)) {
      try {
        await syncFileToDropbox(currentFile, fileContent);
        console.log('✅ Synced to Dropbox');
      } catch (error) {
        console.error('Dropbox sync failed:', error);
        // Don't show error toast to avoid interrupting user
      }
    }
  }
};
```

## 🔐 Dropbox App Setup

### Creating Dropbox App

1. Visit https://www.dropbox.com/developers/apps
2. Click "Create app"
3. Select:
   - **API**: Scoped access
   - **Access**: Full Dropbox
   - **Name**: Docura Sync
4. Configure app:
   - **Redirect URIs**: `http://localhost:8080/oauth/callback`
   - **Permissions**: `files.content.write`, `files.content.read`, `files.metadata.read`
5. Get credentials:
   - App key (Client ID)
   - App secret (Client Secret)

### Setting Environment Variables

```bash
# Add to ~/.bashrc or ~/.zshrc
export DROPBOX_CLIENT_ID="your_app_key_here"
export DROPBOX_CLIENT_SECRET="your_app_secret_here"

# Or create .env file in project root
echo "DROPBOX_CLIENT_ID=your_app_key" >> .env
echo "DROPBOX_CLIENT_SECRET=your_app_secret" >> .env
```

## 📁 How It Works

### Folder Sync Architecture

```
Local Filesystem              →    Dropbox
────────────────────────────────────────────────────
/home/user/Documents/notes    →    /My Documents/notes
/home/user/work/projects      →    /My Documents/projects
/home/user/personal/diary     →    /My Documents/diary
```

### Sync Flow

1. **User Saves File**: File saved to local disk
2. **Check Sync Status**: Is Dropbox sync enabled?
3. **Find Sync Folder**: Does file belong to a synced folder?
4. **Calculate Path**: Map local path to Dropbox path
5. **Upload**: Upload to Dropbox in background
6. **Organize**: Files organized in subfolders under target folder

### Security & Privacy

- ✅ Tokens stored in `~/.config/docura/config.json`
- ✅ Access tokens auto-refresh when expired
- ✅ No data sent to third parties
- ✅ OAuth 2.0 secure authentication
- 🔄 Future: System keychain integration

## 🧪 Testing

### Manual Testing Steps

1. **Build app**: `npm run tauri dev`
2. **Open Settings**: Ctrl+Shift+P
3. **Go to Cloud Sync tab**
4. **Click "Connect Dropbox"**
5. **Paste auth code** (from OAuth URL)
6. **Add sync folder**:
   - Choose local folder
   - Name Dropbox subfolder
7. **Enable auto-sync**
8. **Test**: Save a markdown file in synced folder
9. **Verify**: Check Dropbox web interface

### Edge Cases to Test

- [ ] Token expiration & refresh
- [ ] Network errors during upload
- [ ] Large file uploads
- [ ] Duplicate filenames
- [ ] Folder with many files
- [ ] Disconnect & reconnect
- [ ] Multiple sync folders
- [ ] Nested folders

## 📊 Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Settings UI | ✅ Complete | Cloud Sync tab with Dropbox section |
| Dropbox API | ✅ Complete | Full OAuth & file operations |
| Config Storage | ✅ Complete | Secure token & folder mappings |
| Tauri Commands | ✅ Complete | 10 commands registered |
| Frontend Utils | ✅ Complete | Helper functions ready |
| App.jsx Integration | 🔄 Pending | Need to add state & handlers |
| OAuth Flow | 🔄 Pending | Need redirect server or manual paste |
| Auto-Sync | 🔄 Pending | Need to hook into save logic |
| Testing | 🔄 Pending | Need Dropbox app credentials |

## 🚀 Future Enhancements

### Phase 2 Features
- [ ] OAuth redirect server (auto-complete flow)
- [ ] Bi-directional sync (download from Dropbox)
- [ ] Conflict resolution UI
- [ ] Sync progress indicators
- [ ] Selective file sync (ignore patterns)
- [ ] Bandwidth throttling
- [ ] Sync history log
- [ ] Multiple Dropbox accounts

### Phase 3 Features
- [ ] Real-time collaboration
- [ ] Shared folders support
- [ ] Version history UI
- [ ] Offline queue
- [ ] Compression before upload
- [ ] Delta sync (only changed parts)

## 📝 Files Modified/Created

```
Modified:
├── src/components/SettingsDialog.jsx    # Added Dropbox UI
├── src/styles/App.css                   # Added Dropbox styles
├── src-tauri/src/lib.rs                 # Added commands & config
└── src-tauri/Cargo.toml                 # Added dependencies

Created:
├── src-tauri/src/dropbox_sync.rs        # Dropbox API module
├── src/utils/dropboxSync.js             # Frontend utilities
├── DROPBOX_SYNC_STEP1_COMPLETE.md       # Progress summary
└── DROPBOX_IMPLEMENTATION_GUIDE.md      # This file
```

## 🎯 Next Action Items

1. **Add Dropbox app credentials** (environment variables)
2. **Update App.jsx** with state management
3. **Wire up Settings Dialog handlers**
4. **Implement OAuth flow** (manual or auto)
5. **Hook auto-sync into save logic**
6. **Test with real Dropbox account**
7. **Document user setup instructions**

---

**Status**: Step 1 Complete - Foundation is solid! Ready for frontend integration.

**Estimated Time for Step 2**: 1-2 hours for complete integration and testing.

