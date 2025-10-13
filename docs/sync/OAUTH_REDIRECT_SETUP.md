# 🌐 OAuth Redirect Setup Guide

## Overview

Docura provides a web-based OAuth redirect page that can be hosted on GitHub Pages (or any static hosting) to handle Dropbox OAuth callbacks. This approach is more robust than using localhost and works even when the app isn't running.

## 🎯 Why Use Web Redirect?

### Advantages:
- ✅ **Always Available**: Works even if app isn't running during authorization
- ✅ **No Port Conflicts**: Doesn't require localhost:8080 to be free
- ✅ **Better UX**: Beautiful, branded authorization page
- ✅ **Cross-Platform**: Works on any OS without firewall issues
- ✅ **Mobile Friendly**: Could work with mobile companion in future

### How It Works:
1. User clicks "Connect Dropbox" in Docura
2. Browser opens to Dropbox authorization
3. User authorizes app
4. Dropbox redirects to `https://yourusername.github.io/Docura/oauth-redirect.html?code=XXX`
5. Page displays code to user
6. User copies code back to Docura
7. Optionally: Page tries WebSocket or deep link to auto-send code

## 📁 Files Included

### 1. `docs/oauth-redirect.html`
Beautiful OAuth callback page with:
- **Alpine.js** for reactive UI (loaded from CDN)
- **Auto code extraction** from URL parameters
- **Copy to clipboard** functionality
- **WebSocket support** for auto-sending code to running app
- **Deep link support** for opening Docura automatically
- **Error handling** for failed authorizations
- **Responsive design** matching Docura's branding

### 2. `docs/privacy.html`
Comprehensive privacy policy required for Dropbox production approval:
- GDPR/CCPA compliant
- Clear data handling explanations
- Third-party disclosure (Dropbox only)
- User rights and controls
- App folder access explanation

## 🚀 Setup Instructions

### Step 1: Deploy to GitHub Pages

1. **Enable GitHub Pages:**
   ```bash
   # In your GitHub repository settings:
   Settings → Pages → Source: main branch → /docs folder
   ```

2. **Your redirect URL will be:**
   ```
   https://[your-github-username].github.io/Docura/oauth-redirect.html
   ```

### Step 2: Update Dropbox App Settings

1. Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Select your Docura app
3. Under **OAuth 2** → **Redirect URIs**, add:
   ```
   https://[your-github-username].github.io/Docura/oauth-redirect.html
   ```
4. Click **Add** and **Save**

### Step 3: Update Docura Configuration

Update `src-tauri/src/dropbox_sync.rs`:

```rust
impl Default for DropboxAuthConfig {
    fn default() -> Self {
        Self {
            client_id: std::env::var("DROPBOX_CLIENT_ID")
                .unwrap_or_else(|_| "YOUR_CLIENT_ID".to_string()),
            client_secret: std::env::var("DROPBOX_CLIENT_SECRET")
                .unwrap_or_else(|_| "YOUR_CLIENT_SECRET".to_string()),
            // Update this to your GitHub Pages URL
            redirect_uri: "https://[your-username].github.io/Docura/oauth-redirect.html".to_string(),
        }
    }
}
```

Or use environment variable:
```bash
export DROPBOX_REDIRECT_URI="https://yourusername.github.io/Docura/oauth-redirect.html"
```

And update the code:
```rust
redirect_uri: std::env::var("DROPBOX_REDIRECT_URI")
    .unwrap_or_else(|_| "https://yourusername.github.io/Docura/oauth-redirect.html".to_string()),
```

### Step 4: Test the Flow

1. Build and run Docura
2. Go to Settings → Cloud Sync
3. Click "Connect Dropbox"
4. OAuth dialog appears and browser opens
5. Authorize on Dropbox
6. Redirected to your GitHub Pages redirect page
7. Code is displayed with copy button
8. Copy code and paste in Docura
9. ✅ Connected!

## 🔌 Advanced: WebSocket Auto-Send (Optional)

The redirect page supports sending the code directly to Docura via WebSocket.

### Enable WebSocket Server in Docura:

Add to `src-tauri/src/lib.rs`:

```rust
use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;
use futures_util::{StreamExt, SinkExt};

#[tauri::command]
async fn start_oauth_websocket_server(app: tauri::AppHandle) -> Result<(), String> {
    tokio::spawn(async move {
        let listener = TcpListener::bind("127.0.0.1:9527")
            .await
            .expect("Failed to bind WebSocket server");
        
        println!("🔌 OAuth WebSocket server listening on ws://127.0.0.1:9527");
        
        while let Ok((stream, _)) = listener.accept().await {
            let ws_stream = accept_async(stream)
                .await
                .expect("Failed to accept WebSocket");
            
            let (mut write, mut read) = ws_stream.split();
            
            while let Some(msg) = read.next().await {
                if let Ok(msg) = msg {
                    if msg.is_text() {
                        let data = msg.to_text().unwrap();
                        if let Ok(json) = serde_json::from_str::<serde_json::Value>(data) {
                            if json["type"] == "dropbox_oauth" {
                                let code = json["code"].as_str().unwrap();
                                // Handle the code automatically
                                println!("📨 Received OAuth code via WebSocket: {}", code);
                                
                                // Emit event to frontend
                                app.emit_all("oauth_code_received", code).unwrap();
                                
                                // Send success response
                                let response = serde_json::json!({
                                    "success": true
                                });
                                write.send(response.to_string().into()).await.ok();
                            }
                        }
                    }
                }
            }
        }
    });
    
    Ok(())
}
```

Add to `Cargo.toml`:
```toml
[dependencies]
tokio = { version = "1", features = ["full"] }
tokio-tungstenite = "0.21"
futures-util = "0.3"
```

Start the server when app initializes:
```rust
// In app setup
invoke("start_oauth_websocket_server").await?;
```

### How It Works:
1. Docura starts WebSocket server on port 9527
2. User authorizes Dropbox
3. Redirect page connects to `ws://localhost:9527`
4. Sends code automatically
5. Docura receives code and completes OAuth
6. User doesn't need to copy/paste! 🎉

## 🔗 Deep Link Support (Optional)

Register a custom URL scheme for Docura:

### Linux (.desktop file):
```ini
[Desktop Entry]
Name=Docura
Exec=docura %u
MimeType=x-scheme-handler/docura;
```

### macOS (Info.plist):
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>docura</string>
        </array>
    </dict>
</array>
```

### Windows (Registry):
```reg
HKEY_CLASSES_ROOT
   docura
      (Default) = "URL:Docura Protocol"
      URL Protocol = ""
      shell
         open
            command
               (Default) = "C:\Path\To\Docura.exe" "%1"
```

Then the redirect page can open:
```
docura://oauth/dropbox?code=XXXXX
```

## 📊 Hosting Alternatives

If you don't want to use GitHub Pages:

### 1. Netlify
- Drag and drop `docs/` folder
- Free SSL certificate
- Custom domain support

### 2. Vercel
- Connect GitHub repo
- Auto-deploy on push
- Edge network CDN

### 3. Cloudflare Pages
- GitHub integration
- Fast global CDN
- Free tier generous

### 4. Your Own Domain
- Upload to any static host
- Use your own domain
- More professional

## 🔒 Privacy Policy for Dropbox Approval

The `docs/privacy.html` file is required for Dropbox production approval (>500 users).

### What's Included:
- ✅ Clear data collection disclosure
- ✅ Third-party sharing (Dropbox only)
- ✅ User rights and controls
- ✅ GDPR/CCPA compliance
- ✅ App folder access explanation
- ✅ Contact information

### Update Before Submitting:
1. Replace email: `privacy@docura.app` → your email
2. Replace GitHub URL: `yourusername/docura` → your repo
3. Add your company name if applicable
4. Review all sections for accuracy

### Submit to Dropbox:
1. Go to Dropbox App Console
2. Click "Apply for Production"
3. Provide privacy policy URL:
   ```
   https://yourusername.github.io/Docura/privacy.html
   ```
4. Answer their questionnaire
5. Wait for approval (usually 1-2 weeks)

## 🧪 Testing Checklist

- [ ] GitHub Pages is deployed and accessible
- [ ] `oauth-redirect.html` loads correctly
- [ ] `privacy.html` loads correctly
- [ ] Dropbox app has correct redirect URI
- [ ] OAuth flow completes successfully
- [ ] Code is displayed in redirect page
- [ ] Copy button works
- [ ] Can paste code in Docura
- [ ] Connection succeeds
- [ ] WebSocket auto-send works (if implemented)
- [ ] Deep link works (if implemented)

## 🐛 Troubleshooting

### Redirect Page Not Loading
- Check GitHub Pages is enabled
- Verify branch and folder settings
- Wait a few minutes for deployment
- Check browser console for errors

### "Invalid Redirect URI" Error
- Must exactly match Dropbox app settings
- Include `https://` protocol
- No trailing slash
- Case-sensitive

### Code Not Displaying
- Check URL has `?code=` parameter
- Check browser console for errors
- Verify Alpine.js CDN is accessible

### WebSocket Connection Failed
- Ensure port 9527 is not blocked
- Check if Docura is running
- Verify WebSocket server started
- Look for firewall issues

## 📚 Additional Resources

- [Dropbox OAuth Guide](https://www.dropbox.com/developers/documentation/http/documentation#oauth2)
- [GitHub Pages Docs](https://docs.github.com/pages)
- [Alpine.js Documentation](https://alpinejs.dev/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

**Last Updated:** January 13, 2025

