---
title: Working with Images
description: Add local and online images to your markdown documents
---

# 🖼️ Working with Images

Docura seamlessly handles both local file system images and online internet images!

## Image Types Supported

### 🌐 Online Images (Internet URLs)

Load directly from the web:

```markdown
![GitHub Badge](https://img.shields.io/badge/Status-Active-success)
![Avatar](https://avatars.githubusercontent.com/u/12345)
![Logo](https://cdn.example.com/logo.png)
```

**Supported protocols**:
- `https://` - Standard web (recommended)
- `http://` - Standard web
- `//example.com` - Protocol-relative
- `ftp://` - File transfer
- `data:` - Base64 encoded images

**Benefits**:
- No local storage needed
- Always up-to-date
- Great for badges, avatars
- Perfect for GitHub READMEs

---

### 📁 Local Images (File System)

Store images alongside your markdown:

```markdown
![Screenshot](./screenshots/demo.png)
![Logo](./assets/logo.svg)
![Diagram](../images/architecture.png)
```

**Supported paths**:
- Relative: `./assets/image.png`
- Parent directory: `../images/photo.jpg`
- Subdirectory: `screenshots/app.png`
- Absolute: `/home/user/Pictures/photo.png`

**Benefits**:
- Works offline
- Full control
- No external dependencies
- Instant loading

## Adding Images

### Method 1: Markdown Syntax

```markdown
![Alt Text](path/to/image.png)
```

**Example**:
```markdown
![App Screenshot](./screenshots/main-ui.png)
```

### Method 2: HTML Syntax

```html
<img src="path/to/image.png" alt="Alt Text" />
```

**Example**:
```html
<img src="./assets/logo.svg" alt="Docura Logo" width="200" />
```

### Method 3: Paste from Clipboard (Ctrl+V)

**Fastest way to add images!**

1. Copy image (screenshot, browser image, etc.)
2. Place cursor in editor
3. Press `Ctrl+V`
4. Image automatically saved to `assets/` folder
5. Markdown syntax inserted!

**Magic features**:
- Auto-creates `assets/` folder
- Generates unique filename
- Handles duplicates
- Inserts proper markdown

**Example result**:
```markdown
![pasted-image-1697123456789.png](assets/pasted-image-1697123456789.png)
```

## Image Organization

### Recommended Structure

```
my-document/
├── document.md
├── assets/
│   ├── screenshot-1.png
│   ├── screenshot-2.png
│   └── logo.svg
└── images/
    └── diagrams/
        └── architecture.png
```

### Best Practices

✅ **DO**:
- Keep images in `assets/` or `images/` folder
- Use relative paths
- Optimize image sizes
- Use descriptive filenames

❌ **DON'T**:
- Use absolute paths (not portable)
- Store huge images (optimize first)
- Mix unrelated images
- Use special characters in names

## How It Works

### Automatic Conversion

Docura automatically handles image paths:

```
Local path:   ./assets/logo.png
             ↓
Tauri converts
             ↓
Secure URL:   asset://localhost/path/to/assets/logo.png
             ↓
Displayed safely!
```

### Online URLs

```
Online URL:   https://example.com/image.png
             ↓
No conversion needed
             ↓
Browser loads directly
             ↓
Displayed instantly!
```

### Debug Console

Check DevTools (F12) to see processing:

```
🌐 Keeping external URL: https://example.com/image.png
✅ Converted local image: ./assets/logo.png → asset://
⚠️ Failed to convert: ./missing.png (file not found)
```

## Image Formats

### Supported Formats

✅ **Raster**:
- PNG (`.png`) - Best for screenshots
- JPEG/JPG (`.jpg`, `.jpeg`) - Best for photos
- GIF (`.gif`) - Animated images
- WebP (`.webp`) - Modern, small size

✅ **Vector**:
- SVG (`.svg`) - Scalable, logos
- SVG+XML - Inline SVG

### Format Recommendations

**Screenshots**: PNG (lossless)  
**Photos**: JPEG (smaller size)  
**Logos**: SVG (scalable)  
**Icons**: PNG or SVG  
**Animations**: GIF or WebP  
**Diagrams**: SVG or PNG  

## Advanced Usage

### Image with Link

```markdown
[![Alt Text](image.png)](https://link.com)
```

**Example**:
```markdown
[![GitHub](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png)](https://github.com)
```

### Image with Title

```markdown
![Alt Text](image.png "Hover title")
```

### HTML with Sizing

```html
<img src="./logo.png" alt="Logo" width="200" height="100" />
```

### Image Gallery

```html
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
  <img src="./photo1.jpg" alt="Photo 1" />
  <img src="./photo2.jpg" alt="Photo 2" />
  <img src="./photo3.jpg" alt="Photo 3" />
</div>
```

## Special Cases

### GitHub README Images

Perfect for viewing locally:

```markdown
<!-- Badges work! -->
![Build](https://github.com/user/repo/workflows/CI/badge.svg)
![License](https://img.shields.io/badge/License-MIT-blue)

<!-- Raw GitHub images work! -->
![Logo](https://raw.githubusercontent.com/user/repo/main/logo.png)
```

### Relative Paths

```markdown
<!-- Same folder -->
![Image](image.png)

<!-- Subfolder -->
![Image](assets/image.png)

<!-- Parent folder -->
![Image](../images/image.png)

<!-- Current directory explicitly -->
![Image](./assets/image.png)
```

### Base64 Encoded

```markdown
![Inline](data:image/png;base64,iVBORw0KGgoAAAANS...)
```

## Troubleshooting

### Image Not Showing?

**Local images**:
1. Check file exists at path
2. Verify path is correct (relative to markdown file)
3. Check file permissions
4. Look for typos in filename
5. Check console (F12) for errors

**Online images**:
1. Check internet connection
2. Verify URL is accessible
3. Try opening URL in browser
4. Check if image host is down

### Image Path Wrong?

**Fix relative paths**:

```markdown
<!-- If markdown is at: /home/user/docs/article.md -->
<!-- And image is at: /home/user/docs/images/photo.png -->

<!-- Wrong -->
![Photo](/home/user/docs/images/photo.png)

<!-- Correct -->
![Photo](./images/photo.png)
```

### Pasted Image Not Saving?

**Requirements**:
- Must have current file saved (not untitled)
- Must have write permissions
- Must have valid image in clipboard

**Steps**:
1. Save file first (`Ctrl+S`)
2. Copy image
3. Click in editor
4. Paste (`Ctrl+V`)

### Images Break When Moving Files?

**Use relative paths**:

```markdown
<!-- Bad (breaks when moving) -->
![Image](/home/user/project/image.png)

<!-- Good (works anywhere) -->
![Image](./assets/image.png)
```

## Performance Tips

### Optimize Before Adding

```bash
# Optimize PNG
pngquant image.png

# Optimize JPEG
jpegoptim --max=85 photo.jpg

# Convert to WebP
cwebp image.png -o image.webp
```

### Image Size Guidelines

- **Screenshots**: 1920x1080 max
- **Thumbnails**: 300x300 max
- **Logos**: 512x512 max
- **Photos**: 2000px width max

### Online Images

✅ **Use CDN-hosted images** (faster)  
✅ **Use HTTPS** (secure)  
✅ **Verify reliability** (uptime)  
❌ **Don't hotlink** without permission  

## Examples

### Documentation Image

```markdown
### Installation Steps

Follow these steps to install:

![Step 1](./assets/install-step-1.png)

1. Open the installer
2. Click "Next"

![Step 2](./assets/install-step-2.png)

3. Choose destination
4. Click "Install"
```

### Blog Post with Images

```markdown
# My Trip to Paris

![Eiffel Tower](https://example.com/eiffel.jpg)

The Eiffel Tower was amazing! Here are some of my favorite photos:

![Photo 1](./trip-photos/paris-1.jpg)
![Photo 2](./trip-photos/paris-2.jpg)
![Photo 3](./trip-photos/paris-3.jpg)
```

### README with Badges

```markdown
# My Project

![Build](https://github.com/user/repo/workflows/CI/badge.svg)
![Coverage](https://codecov.io/gh/user/repo/branch/main/graph/badge.svg)
![License](https://img.shields.io/badge/License-MIT-blue)

## Screenshots

![Main UI](./screenshots/main.png)
![Settings](./screenshots/settings.png)
```

## Related Guides

- 🚀 [Getting Started](./getting-started.md)
- 📝 [Markdown Syntax](./markdown-syntax.md)
- 🚀 [Export Features](./export-features.md)

---

**Mix local and online images freely! Docura handles both seamlessly!** 🖼️✨

