# Image Loading in Docura

## Overview

Docura now supports loading local images in markdown files securely through Tauri's asset protocol. This allows you to view images referenced in your markdown documents while maintaining security.

## How It Works

### 1. **Asset Protocol Configuration**
The app is configured to serve local files through Tauri's secure asset protocol:

```json
"security": {
  "assetProtocol": {
    "enable": true,
    "scope": [
      "$HOME/**",
      "$DOCUMENT/**",
      "$DOWNLOAD/**",
      "$PICTURE/**",
      "$DESKTOP/**"
    ]
  }
}
```

### 2. **Dynamic File System Scope**
When you open a file or folder, Docura automatically grants read access to that directory:

- **Opening a folder**: Grants recursive read access to the entire folder
- **Opening a file**: Grants recursive read access to the file's parent directory
- This ensures images in the same directory or subdirectories can be loaded

### 3. **Automatic Path Conversion**
The app automatically converts image paths in markdown to Tauri's asset protocol:

**Original markdown:**
```markdown
![Logo](./images/logo.png)
```

**Converted internally:**
```markdown
![Logo](asset://localhost/absolute/path/to/images/logo.png)
```

## Supported Image Formats

- PNG (`.png`)
- JPEG (`.jpg`, `.jpeg`)
- GIF (`.gif`)
- SVG (`.svg`)
- WebP (`.webp`)

## Image Path Types

### Relative Paths
Images relative to the markdown file:
```markdown
![Image](./image.png)
![Image](images/photo.jpg)
![Image](../assets/icon.svg)
```

### Absolute Paths
Full system paths:
```markdown
![Image](/home/user/Pictures/photo.png)
![Image](/home/user/Documents/project/assets/logo.svg)
```

### URLs
External images via HTTP/HTTPS (no conversion needed):
```markdown
![Image](https://example.com/image.png)
```

## Security

### Sandboxed Access
- Only directories you explicitly open are accessible
- Images outside the opened folder cannot be loaded (unless absolute path)
- The asset protocol prevents unauthorized file system access

### Automatic Scope Management
- File system scope is granted automatically when opening files/folders
- Scope is limited to the necessary directories
- No manual configuration required

## Example Usage

1. **Create a markdown file** with images:
```markdown
# My Document

## Local Image
![Screenshot](./screenshots/app.png)

## Relative Path
![Icon](../icons/logo.svg)
```

2. **Open the file** in Docura (Ctrl+O)
3. **Switch to Preview or Live mode** to see the images
4. Images load automatically!

## Troubleshooting

### Images Not Loading?

**Check file paths:**
- Ensure image paths are correct relative to the markdown file
- Use forward slashes (/) even on Windows
- Check for typos in filenames

**Check permissions:**
- Ensure you have read permissions for the image files
- On Linux, check that the files are readable by your user

**Check file location:**
- Images must be in the same directory tree as the opened file/folder
- Or use absolute paths to access images elsewhere

**Console logs:**
- Open Developer Tools (F12) to see any error messages
- Look for "Failed to convert image path" warnings

### Supported Locations

Images work best when located:
- In the same directory as the markdown file
- In subdirectories of the opened folder
- Anywhere under your home directory (with absolute paths)

## Technical Details

### Components

1. **imagePathConverter.js**: Utility to convert markdown image paths
2. **Asset Protocol**: Tauri's secure file serving mechanism
3. **File System Scope**: Dynamic permission management
4. **MDEditor Integration**: Automatic path conversion in preview modes

### Code Flow

```
User opens file
  ↓
grant_file_scope() called
  ↓
File system scope granted
  ↓
Markdown content loaded
  ↓
convertMarkdownImagePaths() processes images
  ↓
Paths converted to asset:// URLs
  ↓
MDEditor renders with converted paths
  ↓
Images displayed securely
```

## Best Practices

1. **Use relative paths** when possible for portability
2. **Organize images** in a dedicated folder (e.g., `images/`, `assets/`)
3. **Keep images close** to markdown files for easy management
4. **Test different views**: Check images in both Live and Preview modes
5. **Use descriptive alt text** for accessibility

## Future Improvements

Planned enhancements:
- Image drag-and-drop support
- Image optimization/compression
- Automatic image path resolution
- Image gallery view
- Clipboard image paste

