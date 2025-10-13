# 🔌 Dropbox Sync API Reference

## Tauri Commands

### Authentication Commands

#### `dropbox_auth_start()`
Initiates the Dropbox OAuth2 authentication flow.

**Returns:** `Result<String, String>`
- Success: OAuth URL for user to visit
- Error: Authentication setup error message

**Example:**
```javascript
const authUrl = await invoke('dropbox_auth_start');
window.open(authUrl, '_blank');
```

#### `dropbox_auth_complete(code: string)`
Completes the OAuth flow with the authorization code.

**Parameters:**
- `code`: Authorization code from Dropbox callback

**Returns:** `Result<AuthResult, String>`
```typescript
interface AuthResult {
  access_token: string;
  account_id: string;
  display_name: string;
  email: string;
}
```

#### `dropbox_disconnect()`
Disconnects from Dropbox and clears stored credentials.

**Returns:** `Result<(), String>`

**Example:**
```javascript
await invoke('dropbox_disconnect');
```

### Sync Configuration Commands

#### `sync_get_settings()`
Retrieves current sync settings.

**Returns:** `Result<SyncSettings, String>`

#### `sync_save_settings(settings: SyncSettings)`
Saves sync settings.

**Parameters:**
- `settings`: Complete sync settings object

**Returns:** `Result<(), String>`

#### `sync_add_folder(folder: SyncFolder)`
Adds a new folder to sync configuration.

**Parameters:**
- `folder`: Folder configuration object

**Returns:** `Result<String, String>` (folder ID)

#### `sync_remove_folder(folder_id: string)`
Removes a folder from sync configuration.

**Parameters:**
- `folder_id`: ID of folder to remove

**Returns:** `Result<(), String>`

### File Operations Commands

#### `sync_file(path: string)`
Syncs a single file with Dropbox.

**Parameters:**
- `path`: Absolute path to file

**Returns:** `Result<FileSyncResult, String>`
```typescript
interface FileSyncResult {
  path: string;
  status: 'uploaded' | 'downloaded' | 'up_to_date' | 'conflict';
  bytes_transferred: number;
  conflict?: FileConflict;
}
```

#### `sync_folder(path: string)`
Syncs an entire folder with Dropbox.

**Parameters:**
- `path`: Absolute path to folder

**Returns:** `Result<FolderSyncResult, String>`
```typescript
interface FolderSyncResult {
  files_synced: number;
  bytes_transferred: number;
  conflicts: FileConflict[];
  errors: string[];
}
```

#### `sync_get_status(path?: string)`
Gets sync status for a file or all files.

**Parameters:**
- `path` (optional): Specific file path, or all files if omitted

**Returns:** `Result<SyncStatus, String>`

### Conflict Resolution Commands

#### `sync_resolve_conflict(path: string, resolution: ConflictResolution)`
Resolves a sync conflict for a specific file.

**Parameters:**
- `path`: File path with conflict
- `resolution`: How to resolve the conflict

**Returns:** `Result<(), String>`

**Resolution Types:**
```typescript
type ConflictResolution = 
  | { type: 'keep_local' }
  | { type: 'keep_remote' }
  | { type: 'merge', merged_content: string }
  | { type: 'rename_both', local_name: string, remote_name: string };
```

### File System Commands

#### `watch_folder(path: string)`
Starts watching a folder for file changes.

**Parameters:**
- `path`: Folder path to watch

**Returns:** `Result<String, String>` (watcher ID)

#### `unwatch_folder(watcher_id: string)`
Stops watching a folder.

**Parameters:**
- `watcher_id`: ID returned from `watch_folder`

**Returns:** `Result<(), String>`

## React Hooks

### `useDropboxSync()`
Main hook for Dropbox synchronization.

**Returns:**
```typescript
interface UseDropboxSyncReturn {
  // Authentication state
  isAuthenticated: boolean;
  userInfo: DropboxUser | null;
  
  // Sync operations
  syncFile: (path: string) => Promise<void>;
  syncFolder: (path: string) => Promise<void>;
  syncAll: () => Promise<void>;
  
  // Settings management
  settings: SyncSettings;
  updateSettings: (settings: Partial<SyncSettings>) => Promise<void>;
  
  // Folder management
  folders: SyncFolder[];
  addFolder: (folder: Omit<SyncFolder, 'id'>) => Promise<string>;
  removeFolder: (folderId: string) => Promise<void>;
  
  // Status and progress
  syncStatus: Map<string, FileSyncState>;
  activeOperations: SyncOperation[];
  isLoading: boolean;
  error: string | null;
}
```

### `useSyncStatus(path?: string)`
Hook for tracking sync status of files.

**Parameters:**
- `path` (optional): Specific file/folder path

**Returns:**
```typescript
interface UseSyncStatusReturn {
  status: SyncStatus;
  lastSync: Date | null;
  hasConflict: boolean;
  isUpToDate: boolean;
  progress: number; // 0-100
}
```

### `useConflictResolver()`
Hook for handling sync conflicts.

**Returns:**
```typescript
interface UseConflictResolverReturn {
  conflicts: FileConflict[];
  resolveConflict: (path: string, resolution: ConflictResolution) => Promise<void>;
  getConflictPreview: (path: string) => Promise<ConflictPreview>;
}
```

## Event System

### Frontend Events

#### Sync Events
```typescript
// File sync completed
type SyncCompletedEvent = {
  type: 'sync_completed';
  path: string;
  result: 'success' | 'conflict' | 'error';
  bytesTransferred: number;
};

// Conflict detected
type ConflictDetectedEvent = {
  type: 'conflict_detected';
  path: string;
  conflict: FileConflict;
};

// Sync progress update
type SyncProgressEvent = {
  type: 'sync_progress';
  path: string;
  progress: number; // 0-100
  operation: 'upload' | 'download';
};
```

### Backend Events (Rust)

#### Tauri Events
```rust
// Emit sync status update
app_handle.emit_all("sync_status_changed", SyncStatusPayload {
    path: file_path,
    status: SyncStatus::Synced,
    timestamp: Utc::now(),
})?;

// Emit conflict detection
app_handle.emit_all("conflict_detected", ConflictPayload {
    path: file_path,
    conflict: file_conflict,
})?;
```

## Data Models

### TypeScript Interfaces

```typescript
export interface SyncSettings {
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number; // minutes
  conflictResolution: 'ask' | 'local' | 'remote';
  excludePatterns: string[];
  includeFolders: SyncFolder[];
  storageLimit: number; // MB
  notifications: boolean;
  bandwidthLimit: number; // KB/s, 0 = unlimited
}

export interface SyncFolder {
  id: string;
  localPath: string;
  remotePath: string;
  enabled: boolean;
  lastSync: Date | null;
  syncDirection: 'bidirectional' | 'upload' | 'download';
  fileCount: number;
  totalSize: number;
  excludePatterns: string[];
}

export interface FileSyncState {
  path: string;
  status: SyncStatus;
  lastSynced: Date | null;
  localModified: Date;
  remoteModified: Date | null;
  conflict: FileConflict | null;
  error: string | null;
  progress: number; // 0-100
  retryCount: number;
}

export interface FileConflict {
  type: 'modify' | 'delete' | 'create';
  localVersion: FileVersion;
  remoteVersion: FileVersion;
  resolution: ConflictResolution | null;
  autoResolvable: boolean;
}
```

### Rust Structs

```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DropboxCredentials {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_at: Option<DateTime<Utc>>,
    pub account_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SyncOperation {
    pub id: String,
    pub operation_type: OperationType,
    pub file_path: String,
    pub status: OperationStatus,
    pub progress: u8,
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum OperationType {
    Upload,
    Download,
    Delete,
    CreateFolder,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum OperationStatus {
    Pending,
    Running,
    Completed,
    Failed,
    Cancelled,
}
```

## Error Handling

### Error Types

```typescript
// Frontend error types
export type SyncError = 
  | { type: 'network'; message: string; retryable: boolean }
  | { type: 'auth'; message: string; action: 'reconnect' | 'reauth' }
  | { type: 'quota'; message: string; bytesAvailable: number }
  | { type: 'conflict'; path: string; conflict: FileConflict }
  | { type: 'permission'; path: string; message: string }
  | { type: 'invalid_file'; path: string; reason: string };
```

```rust
// Backend error types
#[derive(Debug, Serialize, Deserialize, thiserror::Error)]
pub enum SyncError {
    #[error("Network error: {message}")]
    Network { message: String, retryable: bool },
    
    #[error("Authentication error: {message}")]
    Authentication { message: String },
    
    #[error("Quota exceeded: {bytes_over} bytes over limit")]
    QuotaExceeded { bytes_over: u64 },
    
    #[error("File conflict: {path}")]
    Conflict { path: String },
    
    #[error("Permission denied: {path}")]
    Permission { path: String },
    
    #[error("Invalid file: {path} - {reason}")]
    InvalidFile { path: String, reason: String },
}
```

## Rate Limiting

### API Rate Limits
- **Files API**: 1000 requests/hour per user
- **Upload API**: 500 uploads/hour per user  
- **Download API**: 1000 downloads/hour per user

### Implementation
```rust
use tokio::time::{interval, Duration};
use std::sync::Arc;
use tokio::sync::Semaphore;

pub struct RateLimiter {
    semaphore: Arc<Semaphore>,
    interval: Duration,
}

impl RateLimiter {
    pub fn new(max_requests: usize, window: Duration) -> Self {
        Self {
            semaphore: Arc::new(Semaphore::new(max_requests)),
            interval: window,
        }
    }
    
    pub async fn acquire(&self) -> Result<(), SyncError> {
        let _permit = self.semaphore.acquire().await
            .map_err(|_| SyncError::RateLimited)?;
        
        tokio::time::sleep(self.interval).await;
        Ok(())
    }
}
```

## Testing

### Unit Tests
```typescript
// Frontend tests
describe('useDropboxSync', () => {
  it('should sync file successfully', async () => {
    const { result } = renderHook(() => useDropboxSync());
    
    await act(async () => {
      await result.current.syncFile('/path/to/file.md');
    });
    
    expect(result.current.syncStatus.get('/path/to/file.md')?.status).toBe('synced');
  });
});
```

```rust
// Backend tests
#[tokio::test]
async fn test_sync_file_upload() {
    let sync_engine = SyncEngine::new_test().await;
    let result = sync_engine.sync_file("/test/file.md").await;
    
    assert!(result.is_ok());
    assert_eq!(result.unwrap().status, SyncStatus::Synced);
}
```

## Performance Monitoring

### Metrics to Track
- Sync operation latency
- File transfer speeds
- Error rates by type
- Memory usage during sync
- Battery impact on mobile

### Implementation
```typescript
// Frontend performance tracking
const performanceTracker = {
  trackSyncDuration: (path: string, duration: number) => {
    console.log(`Sync completed for ${path} in ${duration}ms`);
    // Send to analytics
  },
  
  trackError: (error: SyncError) => {
    console.error('Sync error:', error);
    // Send to error reporting
  }
};
```