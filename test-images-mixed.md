# Test: Mixed Local and Online Images

This document tests both local file images and internet URL images.

## ✅ Online Images (From Internet)

These should load directly from the web without any conversion:

### GitHub Logo
![GitHub Logo](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png)

### Placeholder Image
![Placeholder](https://via.placeholder.com/300x200/3b82f6/ffffff?text=Online+Image)

### Markdown Logo
![Markdown](https://markdown-here.com/img/icon256.png)

### Protocol-Relative URL
![Test](//via.placeholder.com/150)

## 📁 Local Images (From File System)

These should be converted to Tauri's asset:// protocol:

### Local Screenshot
![Local Screenshot](./screenshots/screenshot-1.png)

### Relative Path in Assets
![Assets Image](./assets/example.png)

### Absolute Path
![Absolute](/home/user/Documents/image.png)

## 🎨 Mixed Usage

You can use both in the same document!

- 🌐 **Online**: ![Badge](https://img.shields.io/badge/Status-Working-success)
- 📁 **Local**: ![Logo](./docs/logo.svg)

## 🔍 HTML img Tags

Both syntaxes work:

**Online:** <img src="https://via.placeholder.com/100" alt="HTML Online" />

**Local:** <img src="./assets/local-image.png" alt="HTML Local" />

---

## Expected Behavior:

1. ✅ All online URLs (http://, https://, //) should load directly
2. ✅ All local paths should be converted to `asset://` protocol
3. ✅ Check browser console for conversion logs:
   - 🌐 = External URL kept as-is
   - ✅ = Local path converted to asset://
   - ⚠️ = Conversion failed (file might not exist)

