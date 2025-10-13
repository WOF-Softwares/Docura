# Dropbox Sync Implementation - Step 1 Complete ✅

## What We've Built

We've successfully implemented the **first phase** of Dropbox sync integration for Docura! Here's what's been completed:

### 1. Settings Dialog UI ✅
- **New "Cloud Sync" Tab**: Added a dedicated tab in Settings for all cloud sync providers (Dropbox, Omakase, Plasma)
- **Dropbox Section**: Complete UI for Dropbox authentication and configuration
- **Folder Management**: UI to add/remove sync folders with visual feedback
- **Connection Status**: Shows connected account email and target folder
- **Beautiful Styling**: New CSS for folder items, buttons, and controls

### 2. Rust Backend Implementation ✅
- **`dropbox_sync.rs` Module**: Complete Dropbox API integration
  - OAuth 2.0 authentication flow
  - Token exchange and refresh
  - User info retrieval
  - File upload/download
  - Folder operations (create, list)
  
- **Tauri Commands**: 10 new commands for frontend-backend communication
  - `dropbox_get_auth_url`: Get OAuth URL
  - `dropbox_exchange_code`: Exchange auth code for tokens
  - `dropbox_disconnect`: Disconnect Dropbox account
  - `dropbox_get_status`: Get connection status
  - `dropbox_set_target_folder`: Set target Dropbox folder
  - `dropbox_add_sync_folder`: Add local folder to sync
  - `dropbox_remove_sync_folder`: Remove sync folder
  - `dropbox_get_sync_folders`: Get all sync folders
  - `dropbox_toggle_sync`: Enable/disable auto-sync
  - `dropbox_sync_file`: Sync a specific file

### 3. Configuration & State ✅
- **Updated `AppConfig`**: Added Dropbox settings
  - Access token (encrypted storage)
  - Refresh token
  - User email
  - Target folder in Dropbox
  - List of sync folder mappings
  - Sync enabled flag

- **`SyncFolder` Structure**: Maps local paths to Dropbox paths
  ```rust
  pub struct SyncFolder {
      local_path: String,     // e.g., "/home/user/Documents/notes"
      dropbox_path: String,   // e.g., "/My Documents/notes"
  }
  ```

### 4. Dependencies Added ✅
- **reqwest**: HTTP client for Dropbox API calls
- **urlencoding**: URL encoding for OAuth parameters
- **chrono**: Already present, used for token expiration

## How It Works

### OAuth Flow
1. User clicks "Connect Dropbox" in Settings
2. App generates OAuth URL and opens in browser
3. User authorizes Docura
4. Dropbox redirects with auth code
5. App exchanges code for access token
6. Tokens stored securely in config

### Sync Folder Management
1. User adds folders via Settings dialog
2. Each folder maps: Local Path → Dropbox Path
3. Dropbox path is: `/{target_folder}/{subfolder_name}`
4. Example:
   - Local: `/home/user/Documents/my_notes`
   - Dropbox: `/My Documents/my_notes`

### File Syncing
When a file is saved:
1. Check if auto-sync is enabled
2. Find matching sync folder
3. Calculate relative path
4. Upload to corresponding Dropbox location
5. Organized in subfolders for tidiness

## Next Steps (Remaining TODOs)

### TODO 3: Native Folder Picker 🔄
Need to implement:
```javascript
const onAddSyncFolder = async () => {
  // 1. Open native folder picker dialog
  const localPath = await open({ directory: true });
  
  // 2. Show dialog for subfolder name in Dropbox
  const subfolderName = prompt("Subfolder name in Dropbox:");
  
  // 3. Call backend to add mapping
  await invoke('dropbox_add_sync_folder', { 
    localPath, 
    dropboxSubfolder: subfolderName 
  });
}
```

### TODO 4: Dropbox Target Folder Config 🔄
Need to add UI for users to change the target folder in Dropbox:
```javascript
const onSetTargetFolder = async () => {
  const folderName = prompt("Target folder in Dropbox:", "My Documents");
  await invoke('dropbox_set_target_folder', { folderName });
}
```

### Future Enhancements (Step 2)
- Auto-sync implementation (watch file changes)
- Bi-directional sync (download from Dropbox)
- Conflict resolution UI
- Sync status indicators in file tree
- Progress bars for uploads
- OAuth redirect server (instead of manual code paste)

## Dropbox App Setup Required

To use this feature, you need to create a Dropbox app:

1. Go to https://www.dropbox.com/developers/apps
2. Click "Create app"
3. Choose:
   - **Scoped access**
   - **Full Dropbox** access
   - App name: "Docura"
4. Get your credentials:
   - App key (Client ID)
   - App secret (Client Secret)
5. Set environment variables:
   ```bash
   export DROPBOX_CLIENT_ID="your_app_key"
   export DROPBOX_CLIENT_SECRET="your_app_secret"
   ```
6. Add redirect URI: `http://localhost:8080/oauth/callback`

## Security Notes

- Tokens are stored in `~/.config/docura/config.json`
- Access tokens expire and auto-refresh
- Client secret should be in environment variable
- Future: Move to system keychain for token storage

## File Structure

```
src-tauri/src/
├── lib.rs                 # Updated with Dropbox commands
├── dropbox_sync.rs        # NEW: Dropbox API integration
└── Cargo.toml             # Updated dependencies

src/components/
├── SettingsDialog.jsx     # Updated with Dropbox UI
└── ...

src/styles/
└── App.css                # Added Dropbox sync styles
```

## Testing the Implementation

1. **Build the app**: `npm run tauri dev`
2. **Open Settings**: Click gear icon or Ctrl+Shift+P
3. **Go to Cloud Sync tab**: See Dropbox section
4. **Note**: OAuth flow needs Dropbox app credentials first!

## Summary

✅ **Backend**: Complete Dropbox API integration  
✅ **UI**: Beautiful settings dialog with folder management  
✅ **Config**: Secure credential storage  
🔄 **Frontend Handlers**: Need to connect UI to backend  
🔄 **OAuth Server**: Need to handle redirect (or use code paste method)

The foundation is solid! Now we just need to wire up the frontend event handlers and implement the folder picker dialogs.

---

**Next Step**: Update `App.jsx` to add state management and handlers for Dropbox operations.

