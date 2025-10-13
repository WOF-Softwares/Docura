# 🔧 Dropbox Sync Troubleshooting Guide

## 🚨 Common Issues and Solutions

### Authentication Problems

#### Issue: "Authentication Failed" Error
**Symptoms:**
- Cannot connect to Dropbox
- "Invalid token" error messages
- Sync operations fail with auth errors

**Solutions:**
1. **Refresh Authentication:**
   ```javascript
   // In Settings → Sync tab
   1. Click "Disconnect from Dropbox"
   2. Wait 5 seconds
   3. Click "Connect to Dropbox"
   4. Complete OAuth flow again
   ```

2. **Clear Stored Credentials:**
   ```bash
   # Clear application data (varies by OS)
   # Linux: ~/.local/share/docura/
   # macOS: ~/Library/Application Support/docura/
   # Windows: %APPDATA%/docura/
   
   # Delete credentials.json file
   rm ~/.local/share/docura/credentials.json
   ```

3. **Check Dropbox App Status:**
   - Visit [Dropbox App Console](https://dropbox.com/developers/apps)
   - Verify app is active and not rate-limited
   - Check app permissions

#### Issue: "Token Expired" Error
**Symptoms:**
- Previously working sync suddenly fails
- "Token has expired" error message

**Solutions:**
1. **Automatic Token Refresh:**
   ```rust
   // Backend automatically handles this
   // If refresh fails, user needs to re-authenticate
   ```

2. **Manual Re-authentication:**
   - Go to Settings → Sync
   - Click "Reconnect to Dropbox"
   - Complete OAuth flow

### Sync Performance Issues

#### Issue: Slow Sync Speeds
**Symptoms:**
- Files take long time to sync
- Progress bar moves slowly
- High memory/CPU usage during sync

**Diagnostics:**
```javascript
// Check sync performance in browser console
console.log('Sync Performance Metrics:', {
  averageSyncTime: performance.getAverageMetric('sync_duration'),
  totalFilesSynced: syncStats.totalFiles,
  networkSpeed: navigator.connection?.downlink
});
```

**Solutions:**

1. **Optimize Network Settings:**
   ```typescript
   // In settings, adjust these values:
   const optimizedSettings = {
     maxConcurrentUploads: 3,     // Default: 5
     maxConcurrentDownloads: 5,   // Default: 10
     chunkSize: 4 * 1024 * 1024,  // 4MB chunks
     retryDelay: 2000,            // 2 second retry delay
     bandwidthLimit: 1024,        // KB/s, 0 = unlimited
   };
   ```

2. **File Size Optimization:**
   ```bash
   # Check for large files
   find /path/to/sync/folder -type f -size +10M -name "*.md"
   
   # Compress large markdown files with images
   # Consider moving large assets to separate folder
   ```

3. **Exclude Non-Essential Files:**
   ```javascript
   // Add to exclusion patterns
   const excludePatterns = [
     "*.jpg", "*.png", "*.gif",    // Large images
     "*.pdf", "*.doc", "*.docx",   // Non-markdown docs
     "node_modules/", ".git/",     // Development folders
     "*.log", "*.tmp"              // Temporary files
   ];
   ```

#### Issue: High CPU/Memory Usage
**Symptoms:**
- Computer becomes slow during sync
- High memory usage in Task Manager
- Fan running constantly

**Solutions:**

1. **Enable Low Power Mode:**
   ```typescript
   // In Settings → Sync → Advanced
   const powerSettings = {
     lowPowerMode: true,
     reducedSyncFrequency: true,
     pauseOnBattery: true,
     maxMemoryUsage: 512, // MB
   };
   ```

2. **Reduce Concurrent Operations:**
   ```rust
   // Backend configuration
   pub struct SyncConfig {
       max_concurrent_ops: usize,  // Reduce from 10 to 3
       file_chunk_size: usize,     // Reduce chunk size
       memory_limit_mb: usize,     // Set memory limit
   }
   ```

### File Conflict Issues

#### Issue: Frequent Conflicts
**Symptoms:**
- Many files show conflict warnings
- Conflict dialogs appear often
- Same files repeatedly conflict

**Solutions:**

1. **Improve Conflict Detection:**
   ```typescript
   // Better conflict detection algorithm
   const conflictDetection = {
     useContentHash: true,        // Compare file content, not just timestamps
     ignoreMinorTimeDiffs: true,  // Ignore differences < 1 second
     autoResolveIdentical: true,  // Auto-resolve if content is identical
   };
   ```

2. **Sync More Frequently:**
   ```javascript
   // Reduce conflict chances with frequent sync
   const syncSettings = {
     autoSync: true,
     syncInterval: 1, // Sync every minute instead of 5
     immediateSync: true, // Sync immediately on file change
   };
   ```

3. **Set Default Conflict Resolution:**
   ```typescript
   // For specific use cases
   const conflictSettings = {
     defaultResolution: 'keep_local',  // or 'keep_remote', 'ask'
     autoResolveIdentical: true,
     backupConflicted: true,          // Keep backup of conflicted files
   };
   ```

#### Issue: Cannot Resolve Conflicts
**Symptoms:**
- Conflict dialog won't close
- "Resolution failed" error
- Files remain in conflict state

**Solutions:**

1. **Manual File Resolution:**
   ```bash
   # Backup current file
   cp conflicted_file.md conflicted_file.backup.md
   
   # Download fresh copy from Dropbox
   # Then manually merge changes
   ```

2. **Reset File Sync State:**
   ```javascript
   // Clear sync state for specific file
   await invoke('reset_file_sync_state', { path: '/path/to/file.md' });
   ```

### Network and Connectivity Issues

#### Issue: "Network Error" Messages
**Symptoms:**
- Intermittent sync failures
- "Connection timeout" errors
- Sync works sometimes, fails other times

**Solutions:**

1. **Configure Retry Logic:**
   ```rust
   // Enhanced retry with exponential backoff
   pub struct RetryConfig {
       max_retries: u32,           // 5 retries
       initial_delay_ms: u64,      // 1000ms
       max_delay_ms: u64,          // 30000ms (30 seconds)
       backoff_multiplier: f64,    // 2.0
   }
   ```

2. **Proxy Configuration:**
   ```javascript
   // For corporate networks
   const proxySettings = {
     enabled: true,
     host: 'proxy.company.com',
     port: 8080,
     username: 'user',
     password: 'pass',
     bypassList: ['localhost', '*.local']
   };
   ```

3. **Network Diagnostics:**
   ```bash
   # Test connectivity to Dropbox
   curl -I https://api.dropboxapi.com/2/check/user
   
   # Test DNS resolution
   nslookup api.dropboxapi.com
   
   # Check for firewall blocks
   telnet api.dropboxapi.com 443
   ```

#### Issue: Firewall/Corporate Network Blocks
**Symptoms:**
- Sync fails only on work network
- "Connection refused" errors
- Works on mobile hotspot but not office WiFi

**Solutions:**

1. **Required Firewall Rules:**
   ```bash
   # Whitelist these domains in firewall:
   *.dropboxapi.com
   *.dropboxusercontent.com
   content.dropboxapi.com
   api.dropboxapi.com
   
   # Required ports:
   443 (HTTPS)
   80 (HTTP redirects)
   ```

2. **Corporate Proxy Setup:**
   ```rust
   // Backend proxy configuration
   use reqwest::Proxy;
   
   let proxy = Proxy::all("http://proxy.company.com:8080")?
       .basic_auth("username", "password");
   
   let client = Client::builder()
       .proxy(proxy)
       .build()?;
   ```

### File System Issues

#### Issue: "Permission Denied" Errors
**Symptoms:**
- Cannot read/write certain files
- Sync fails with permission errors
- Files created with wrong permissions

**Solutions:**

1. **Fix File Permissions:**
   ```bash
   # Linux/macOS
   chmod -R 755 /path/to/sync/folder
   chown -R $USER:$USER /path/to/sync/folder
   
   # Windows (as Administrator)
   icacls "C:\path\to\sync\folder" /grant Everyone:F /T
   ```

2. **Run with Elevated Permissions:**
   ```bash
   # Linux/macOS
   sudo docura
   
   # Windows
   # Right-click → "Run as Administrator"
   ```

#### Issue: File Locks/In-Use Errors
**Symptoms:**
- "File is in use" errors
- Cannot sync open files
- Temporary file conflicts

**Solutions:**

1. **Implement File Lock Detection:**
   ```rust
   use std::fs::OpenOptions;
   
   fn is_file_locked(path: &str) -> bool {
       OpenOptions::new()
           .write(true)
           .open(path)
           .is_err()
   }
   ```

2. **Retry Logic for Locked Files:**
   ```typescript
   // Frontend retry mechanism
   const retryLockedFile = async (path: string, maxRetries = 3) => {
     for (let i = 0; i < maxRetries; i++) {
       try {
         await syncFile(path);
         return;
       } catch (error) {
         if (error.type === 'file_locked' && i < maxRetries - 1) {
           await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
           continue;
         }
         throw error;
       }
     }
   };
   ```

## 🔍 Debugging Tools

### Enable Debug Logging

1. **Frontend Debug Mode:**
   ```javascript
   // In browser console
   localStorage.setItem('docura_debug', 'true');
   
   // Or in settings
   Settings → Advanced → Enable Debug Logging
   ```

2. **Backend Debug Mode:**
   ```rust
   // In development
   RUST_LOG=debug cargo tauri dev
   
   // In production build
   // Set environment variable
   export RUST_LOG=docura::sync=debug
   ```

### Log Analysis

**Check Sync Logs:**
```bash
# Linux
tail -f ~/.local/share/docura/logs/sync.log

# macOS
tail -f ~/Library/Logs/docura/sync.log

# Windows
type %APPDATA%\docura\logs\sync.log
```

**Common Log Patterns to Look For:**
```bash
# Authentication issues
grep "auth" sync.log

# Network problems
grep -i "network\|timeout\|connection" sync.log

# File conflicts
grep "conflict" sync.log

# Performance issues
grep -i "slow\|timeout\|retry" sync.log
```

### Performance Profiling

1. **Frontend Performance:**
   ```javascript
   // Enable performance monitoring
   const perfObserver = new PerformanceObserver((list) => {
     list.getEntries().forEach((entry) => {
       if (entry.name.includes('sync')) {
         console.log(`${entry.name}: ${entry.duration}ms`);
       }
     });
   });
   perfObserver.observe({ entryTypes: ['measure'] });
   ```

2. **Backend Performance:**
   ```rust
   use std::time::Instant;
   
   let start = Instant::now();
   sync_file(path).await?;
   let duration = start.elapsed();
   
   if duration.as_millis() > 5000 {
       log::warn!("Slow sync operation: {:?}", duration);
   }
   ```

### Diagnostic Commands

**Test Dropbox Connectivity:**
```javascript
// In browser console or settings diagnostic panel
const testConnectivity = async () => {
  try {
    const result = await invoke('test_dropbox_connection');
    console.log('Dropbox connectivity:', result);
  } catch (error) {
    console.error('Connection test failed:', error);
  }
};
```

**Sync Health Check:**
```rust
// Backend health check command
#[tauri::command]
async fn sync_health_check() -> Result<HealthReport, String> {
    let report = HealthReport {
        auth_status: check_auth_status().await?,
        network_status: test_network_connectivity().await?,
        file_system_status: check_file_permissions().await?,
        sync_queue_status: get_sync_queue_health().await?,
    };
    Ok(report)
}
```

## 📊 Monitoring and Metrics

### Performance Metrics to Track

```typescript
interface SyncMetrics {
  // Performance metrics
  averageSyncTime: number;      // milliseconds
  syncSuccessRate: number;      // percentage
  networkBandwidthUsage: number; // KB/s
  
  // Error metrics
  authFailureCount: number;
  networkErrorCount: number;
  conflictCount: number;
  
  // Usage metrics
  totalFilesSynced: number;
  totalBytesTransferred: number;
  activeUsersCount: number;
}
```

### Health Monitoring

```rust
pub struct HealthMetrics {
    pub sync_queue_length: usize,
    pub failed_operations: usize,
    pub memory_usage_mb: f64,
    pub cpu_usage_percent: f64,
    pub network_latency_ms: u64,
}
```

## 🆘 Emergency Recovery

### Complete Sync Reset

**When All Else Fails:**
```bash
# 1. Backup current files
cp -r /path/to/sync/folder /path/to/backup

# 2. Stop Docura application
killall docura

# 3. Clear sync database
rm ~/.local/share/docura/sync.db

# 4. Clear sync settings
rm ~/.local/share/docura/sync-settings.json

# 5. Restart Docura and reconfigure
```

### Data Recovery

**Recover from Dropbox:**
```javascript
// Emergency download all files from Dropbox
const emergencyRestore = async () => {
  const folders = await invoke('get_all_sync_folders');
  
  for (const folder of folders) {
    await invoke('download_entire_folder', {
      remotePath: folder.remotePath,
      localPath: folder.localPath + '_restored'
    });
  }
};
```

## 📞 Getting Additional Help

### Support Channels

1. **GitHub Issues:**
   - [Report bugs](https://github.com/WOF-Softwares/Docura/issues)
   - Search existing issues first

2. **Community Forum:**
   - User discussions and solutions
   - Community-contributed fixes

3. **Email Support:**
   - For sensitive issues or enterprise support
   - Include diagnostic logs and system info

### Information to Include in Support Requests

```markdown
**System Information:**
- OS: [Windows 11 / macOS 13 / Ubuntu 22.04]
- Docura Version: [1.2.3]
- Dropbox Account Type: [Personal / Business]

**Issue Description:**
- What were you trying to do?
- What happened instead?
- When did this start happening?

**Error Messages:**
[Copy exact error messages here]

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Diagnostic Logs:**
[Attach sync.log file]
```

### Self-Help Resources

- **Documentation Website:** Complete feature documentation
- **Video Tutorials:** Step-by-step setup guides  
- **FAQ Section:** Common questions and answers
- **Community Wiki:** User-contributed solutions

---

This troubleshooting guide should help resolve most common Dropbox sync issues. If you continue experiencing problems, don't hesitate to reach out for support!