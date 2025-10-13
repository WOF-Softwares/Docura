# 🚀 Building Production Releases with Dropbox Credentials

## ⚠️ **IMPORTANT: Environment Variables Required!**

Production builds now **correctly embed Dropbox credentials** at compile time!

---

## 🔧 **How It Works:**

### **Build-Time Embedding:**
- Uses Rust's `option_env!()` macro to read environment variables **at compile time**
- Credentials are **baked into the binary** during the build process
- Fallback chain: compile-time → runtime → defaults

### **Code:**
```rust
client_id: option_env!("DROPBOX_CLIENT_ID")  // Read at compile time
    .map(|s| s.to_string())
    .or_else(|| std::env::var("DROPBOX_CLIENT_ID").ok())  // Fallback to runtime
    .unwrap_or_else(|| "YOUR_CLIENT_ID".to_string()),  // Final fallback
```

---

## 📋 **Production Build Instructions:**

### **Step 1: Set Environment Variables**

**Linux/macOS (Bash/Zsh):**
```bash
export DROPBOX_CLIENT_ID="oni7s2m0zhzjqb1"
export DROPBOX_CLIENT_SECRET="r9oyjntvotwlp4x"
export DROPBOX_REDIRECT_URI="https://wof-softwares.github.io/Docura/oauth-redirect.html"
```

**Fish Shell:**
```fish
set -x DROPBOX_CLIENT_ID "oni7s2m0zhzjqb1"
set -x DROPBOX_CLIENT_SECRET "r9oyjntvotwlp4x"
set -x DROPBOX_REDIRECT_URI "https://wof-softwares.github.io/Docura/oauth-redirect.html"
```

**Windows (PowerShell):**
```powershell
$env:DROPBOX_CLIENT_ID="oni7s2m0zhzjqb1"
$env:DROPBOX_CLIENT_SECRET="r9oyjntvotwlp4x"
$env:DROPBOX_REDIRECT_URI="https://wof-softwares.github.io/Docura/oauth-redirect.html"
```

---

### **Step 2: Build Production Release**

```bash
# Build with embedded credentials
./scripts/build-prod.sh --release
```

**The build script will:**
1. ✅ Check if `DROPBOX_CLIENT_ID` is set
2. ✅ Export variables for the build process
3. ✅ Embed credentials into the binary at compile time
4. ✅ Create packages (.deb, .rpm, .pkg.tar.xz)
5. ✅ Create GitHub release
6. ✅ Update docs/downloads

---

## ✅ **Verification:**

After building, the binary will have credentials embedded:

```bash
# Test the built binary (won't show credentials, but OAuth will work)
./src-tauri/target/release/docura
```

**Expected behavior:**
- ✅ OAuth opens with correct `client_id`
- ✅ Redirect URI matches your GitHub Pages URL
- ✅ Users can connect to Dropbox successfully

---

## 🔍 **Build Script Warnings:**

The build script now shows warnings if credentials are missing:

```
⚠️ DROPBOX_CLIENT_ID not set - Dropbox sync will not work in production build
⚠️ Set environment variables before building: DROPBOX_CLIENT_ID, DROPBOX_CLIENT_SECRET
```

**If you see this:**
1. Stop the build
2. Set environment variables
3. Rebuild

---

## 🎯 **Quick Build Command:**

**One-liner for production release:**

```bash
# Bash/Zsh
export DROPBOX_CLIENT_ID="oni7s2m0zhzjqb1" \
       DROPBOX_CLIENT_SECRET="r9oyjntvotwlp4x" \
       DROPBOX_REDIRECT_URI="https://wof-softwares.github.io/Docura/oauth-redirect.html" && \
./scripts/build-prod.sh --release
```

**Fish:**
```fish
set -x DROPBOX_CLIENT_ID "oni7s2m0zhzjqb1"; \
set -x DROPBOX_CLIENT_SECRET "r9oyjntvotwlp4x"; \
set -x DROPBOX_REDIRECT_URI "https://wof-softwares.github.io/Docura/oauth-redirect.html"; \
and ./scripts/build-prod.sh --release
```

---

## 📦 **CI/CD Integration:**

For automated builds (GitHub Actions, etc.):

```yaml
- name: Build with Dropbox credentials
  env:
    DROPBOX_CLIENT_ID: ${{ secrets.DROPBOX_CLIENT_ID }}
    DROPBOX_CLIENT_SECRET: ${{ secrets.DROPBOX_CLIENT_SECRET }}
    DROPBOX_REDIRECT_URI: "https://wof-softwares.github.io/Docura/oauth-redirect.html"
  run: ./scripts/build-prod.sh --release
```

**Remember to add secrets in GitHub repository settings!**

---

## 🔐 **Security Notes:**

1. ✅ **Client ID** - Safe to embed (it's public in OAuth flow anyway)
2. ✅ **Client Secret** - Safe to embed for native apps (Dropbox PKCE flow)
3. ✅ **Redirect URI** - Must match Dropbox app settings
4. ⚠️ **Don't commit** credentials to git
5. ⚠️ **Don't share** binaries with test credentials

---

## 🎉 **Result:**

Production users can now:
1. Download Docura from GitHub releases
2. Click "Connect Dropbox" in settings
3. OAuth flows works with embedded credentials
4. Files sync to `/Apps/Docura Sync/` automatically!

**No configuration needed for end users!** ✨

---

## 🐛 **Troubleshooting:**

### **OAuth fails with "Invalid client_id"**
- Environment variables weren't set during build
- Rebuild with credentials set

### **Redirect URI mismatch**
- Check `DROPBOX_REDIRECT_URI` matches Dropbox app console
- Update both and rebuild

### **"YOUR_CLIENT_ID" error**
- Binary wasn't built with credentials
- Rebuild following Step 1 & 2 above

---

## 📄 **For Developers:**

**Testing production build locally:**
```bash
# Build
./scripts/build-prod.sh --build-pkg

# Test the binary
./src-tauri/target/release/docura

# Or install the package
sudo dpkg -i packaging/arch/docura_*.deb
docura
```

**Verify OAuth:**
1. Open Docura
2. Settings → Cloud Sync → Connect Dropbox
3. Should redirect to Dropbox with correct app
4. After approval, redirects to your GitHub Pages
5. Code should work!

---

## 🏆 **Benefits:**

✅ **No user configuration** - Works out of the box  
✅ **Secure** - App Folder access only  
✅ **Professional** - Like commercial apps  
✅ **Maintainable** - Credentials in one place  
✅ **CI/CD friendly** - Uses secrets management  

**Docura is ready for production! 🚀**

