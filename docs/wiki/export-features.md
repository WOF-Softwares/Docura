---
title: Export Features
description: Export your markdown to PDF, HTML, JSON, RTF, and more
---

# 🚀 Export Features

Docura offers comprehensive export options to share your work in any format!

## Quick Export

### Export to PDF (Ctrl+E)

Fastest way to create PDFs:

1. Press `Ctrl+E` or click **Export → PDF**
2. Choose save location
3. Enter filename
4. Done! PDF created with your theme styling

**Features**:
- Theme-aware styling
- Preserves formatting
- High-quality output
- Native save dialog

## Export Menu

Access all formats from **Export** menu in toolbar:

```
Export
├── PDF Export (Ctrl+E)
├── HTML Exports ▶
│   ├── Standard HTML
│   ├── Plain HTML
│   ├── HTML with Tailwind CSS
│   └── HTML with Bootstrap
├── JSON Export
├── RTF Export
└── MediaWiki Export
```

## Export Formats

### 📄 PDF Export

**Best for**: Sharing, printing, archiving

**Features**:
- Professional formatting
- Theme colors preserved
- Page breaks handled
- Images included
- Hyperlinks active

**Usage**:
```
Ctrl+E → Choose location → Save
```

**Tips**:
- Use Preview mode first to check formatting
- Theme affects PDF colors
- Great for documentation

---

### 🌐 HTML Exports

#### Standard HTML

**Best for**: Web publishing, embedding

**Features**:
- Clean semantic HTML
- Basic styling included
- Responsive layout
- Code highlighting

**Usage**:
```
Export → HTML Exports → Standard HTML
```

**Output**:
```html
<!DOCTYPE html>
<html>
<head>
    <style>/* Basic styling */</style>
</head>
<body>
    <!-- Your content -->
</body>
</html>
```

#### Plain HTML

**Best for**: Minimal output, custom styling

**Features**:
- No styling
- Pure HTML structure
- Maximum flexibility
- Smallest file size

**Usage**:
```
Export → HTML Exports → Plain HTML
```

**Perfect for**:
- Adding your own CSS
- CMS systems
- HTML email

#### HTML with Tailwind CSS

**Best for**: Modern web projects

**Features**:
- Tailwind CSS CDN included
- Utility classes applied
- Responsive by default
- Beautiful prose styling

**Usage**:
```
Export → HTML Exports → HTML with Tailwind CSS
```

**Output includes**:
```html
<script src="https://cdn.tailwindcss.com"></script>
<div class="prose prose-gray max-w-none">
    <!-- Your content with Tailwind classes -->
</div>
```

#### HTML with Bootstrap

**Best for**: Bootstrap projects

**Features**:
- Bootstrap 5 CDN included
- Bootstrap components
- Grid system ready
- Responsive columns

**Usage**:
```
Export → HTML Exports → HTML with Bootstrap
```

**Output includes**:
```html
<link href="bootstrap.min.css" rel="stylesheet">
<div class="container">
    <div class="col-lg-8">
        <!-- Your content -->
    </div>
</div>
```

---

### 📊 JSON Export

**Best for**: Data processing, APIs, backups

**Features**:
- Structured data format
- Metadata included
- Timestamp added
- Easy to parse

**Usage**:
```
Export → JSON Export
```

**Output structure**:
```json
{
  "title": "Document Title",
  "content": "# Your markdown content...",
  "exported_at": "2025-10-12T10:30:00Z",
  "format": "markdown"
}
```

**Use cases**:
- API integration
- Database storage
- Backup/restore
- Content management

---

### 📝 RTF Export

**Best for**: Word processors, rich text editors

**Features**:
- Microsoft Word compatible
- LibreOffice compatible
- Google Docs compatible
- Basic formatting preserved

**Usage**:
```
Export → RTF Export
```

**Supported formatting**:
- **Bold** text
- *Italic* text
- Headings (#, ##, ###)
- Paragraphs

**Note**: Complex markdown may simplify to basic formatting.

---

### 📖 MediaWiki Export

**Best for**: Wikipedia, wikis, knowledge bases

**Features**:
- MediaWiki syntax
- Wiki-compatible links
- Section formatting
- Ready to paste

**Usage**:
```
Export → MediaWiki Export
```

**Conversion**:
```
Markdown         → MediaWiki
# Heading        → = Heading =
## Subheading    → == Subheading ==
**bold**         → '''bold'''
*italic*         → ''italic''
[link](url)      → [[link|url]]
```

**Perfect for**:
- Wikipedia articles
- Company wikis
- Documentation sites
- Knowledge bases

## Export Workflow

### Basic Workflow

```
1. Write content
2. Review in Preview mode
3. Choose export format
4. Select save location
5. Done! ✅
```

### Professional Workflow

```
1. Write in Live/Code mode
2. Review in Preview mode
3. Choose theme for styling
4. Export PDF for client
5. Export HTML for web
6. Export JSON for backup
```

### Batch Export (Future)

Coming soon: Export to multiple formats at once!

## Export Tips

### For Best Results

✅ **Review first**: Check Preview mode before exporting  
✅ **Choose right format**: Match format to use case  
✅ **Check images**: Ensure all images load properly  
✅ **Test theme**: Theme affects PDF and HTML styling  

### Common Use Cases

**Documentation**:
- PDF for distribution
- HTML for web hosting
- MediaWiki for internal wiki

**Blog Posts**:
- HTML with Tailwind for website
- JSON for CMS backup
- PDF for offline reading

**Reports**:
- PDF for formal submission
- HTML with Bootstrap for portal
- RTF for Word editing

**Academic**:
- PDF for submission
- HTML for online version
- RTF for collaboration

## Keyboard Shortcuts

| Format | Shortcut | Menu Path |
|--------|----------|-----------|
| **PDF** | `Ctrl+E` | Export → PDF Export |
| **All others** | - | Export → [Format] |

## Advanced Features

### Theme-Aware Exports

PDF and HTML exports respect your theme:
- Dark theme → Dark styled PDF
- Light theme → Light styled PDF
- Colors preserved
- Syntax highlighting matched

### Smart File Dialogs

Each format has appropriate:
- File extension (.pdf, .html, .json, etc.)
- File type filter
- Default name suggestion

### Error Handling

If export fails:
- Error message shows reason
- File not created
- Can retry immediately
- Check console for details

## Troubleshooting

### Export Failed?

**Check**:
1. **Write permissions**: Can you save to that folder?
2. **Disk space**: Enough space available?
3. **File name**: No special characters?
4. **File in use**: Not already open elsewhere?

### Images Missing in Export?

**Solution**:
1. Verify images exist on disk
2. Check relative paths are correct
3. Use Preview mode to test first
4. Ensure images in allowed scope

### PDF Styling Wrong?

**Fix**:
1. Check theme selection
2. Try different theme
3. Review in Preview mode first
4. Update Docura to latest version

## Future Enhancements

### Coming Soon

- [ ] Export templates
- [ ] Custom export settings
- [ ] Batch export multiple files
- [ ] Email export
- [ ] Cloud storage integration
- [ ] Export profiles

## Related Guides

- 🖼️ [Working with Images](./images.md)
- 🎨 [Themes](./themes.md)
- 📝 [Markdown Syntax](./markdown-syntax.md)

---

**Export your work in any format! Share anywhere!** 🚀✨

