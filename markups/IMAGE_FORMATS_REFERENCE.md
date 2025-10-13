# 🖼️ Docura Image Formats - Quick Reference

## ✅ Supported Image Sources

### 🌐 Online Images (Internet URLs)

| Format | Example | Status |
|--------|---------|--------|
| **HTTP** | `http://example.com/image.png` | ✅ Works |
| **HTTPS** | `https://example.com/image.png` | ✅ Works |
| **Protocol-relative** | `//example.com/image.png` | ✅ Works |
| **FTP** | `ftp://example.com/image.png` | ✅ Works |
| **Data URI** | `data:image/png;base64,...` | ✅ Works |
| **Blob URL** | `blob:https://example.com/uuid` | ✅ Works |

### 📁 Local Images (File System)

| Format | Example | Status |
|--------|---------|--------|
| **Relative** | `./images/photo.png` | ✅ Auto-converted |
| **Relative parent** | `../assets/logo.svg` | ✅ Auto-converted |
| **Absolute** | `/home/user/Documents/img.jpg` | ✅ Auto-converted |
| **Assets folder** | `assets/screenshot.png` | ✅ Auto-converted |

## 📝 Markdown Syntax

### Standard Markdown

```markdown
![Alt Text](https://example.com/image.png)
![Local Image](./assets/photo.jpg)
```

### HTML img Tags

```markdown
<img src="https://example.com/image.png" alt="Online" />
<img src="./assets/photo.jpg" alt="Local" />
```

## 🎯 Real-World Examples

### GitHub Badges

```markdown
![Build Status](https://github.com/user/repo/workflows/CI/badge.svg)
![Coverage](https://codecov.io/gh/user/repo/branch/main/graph/badge.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
```

### Shields.io Badges

```markdown
![Version](https://img.shields.io/badge/version-1.0.0-success)
![Stars](https://img.shields.io/github/stars/user/repo?style=social)
```

### External Images

```markdown
![Logo](https://raw.githubusercontent.com/user/repo/main/logo.png)
![Avatar](https://avatars.githubusercontent.com/u/12345?v=4)
```

### Local Screenshots

```markdown
![Screenshot 1](./screenshots/screenshot-1.png)
![Screenshot 2](./screenshots/screenshot-2.png)
```

### Mixed Document

```markdown
# My Project

<!-- Online CI/CD status -->
![Build](https://github.com/user/repo/actions/workflows/ci.yml/badge.svg)

<!-- Local demo -->
![Demo](./docs/demo.gif)

<!-- External logo -->
![Logo](https://cdn.example.com/logo.svg)

<!-- Local architecture diagram -->
![Architecture](./assets/architecture.png)
```

## 🔧 How Detection Works

```javascript
// These are detected as ONLINE URLs:
https://example.com/image.png  ✅
http://example.com/image.png   ✅
//example.com/image.png         ✅
ftp://example.com/image.png     ✅
data:image/png;base64,...       ✅
blob:https://...                ✅
asset://localhost/...           ✅

// These are detected as LOCAL FILES:
./images/photo.png              📁
../assets/logo.svg              📁
assets/screenshot.png           📁
/home/user/Documents/img.jpg    📁
```

## 🐛 Debugging

Open DevTools Console (F12 → Console) to see processing:

```
🌐 Keeping external URL: https://github.com/...
✅ Converted local image: ./assets/logo.png → asset://
⚠️ Failed to convert image path: ./missing.png
```

## 💡 Tips

1. **Use HTTPS for online images** - More secure than HTTP
2. **Use relative paths for local images** - More portable
3. **Keep local images in `assets/` folder** - Better organization
4. **Check console logs** - See what's being processed
5. **Test with `test-images-mixed.md`** - Verify both types work

## 🚀 Quick Test

Copy this to a new file and open in Docura:

```markdown
# Image Test

## Online
![Badge](https://img.shields.io/badge/Status-Working-success)

## Local
![Logo](./docs/logo.svg)
```

Expected results:
- Badge loads from shields.io
- Logo converts to `asset://` and loads from disk
- Console shows processing for both

## 📚 Documentation

- **Full Guide**: `docs/IMAGE_HANDLING.md`
- **Feature Summary**: `docs/IMAGE_FEATURE_SUMMARY.md`
- **Test File**: `test-images-mixed.md`

## ✨ Summary

✅ All HTTP/HTTPS URLs load directly  
✅ All local paths convert to `asset://`  
✅ Both types work in same document  
✅ Console logs show processing  
✅ Works with markdown and HTML syntax  

**It just works!** 🎉

