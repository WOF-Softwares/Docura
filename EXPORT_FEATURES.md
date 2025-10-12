# Export Features Documentation

Docura now supports exporting documents to multiple formats through an enhanced export submenu. This replaces the single PDF export option with a comprehensive export system.

## Available Export Formats

### PDF Export
- **Description**: Export your markdown document as a PDF file
- **Keyboard Shortcut**: `Ctrl+E`
- **Requirements**: Document must be in Preview or Live mode
- **Output**: Styled PDF with proper formatting

### HTML Exports

#### Standard HTML
- **Description**: Export as HTML with built-in styling
- **Features**: 
  - Clean, readable typography
  - Responsive design
  - Professional styling with proper spacing and colors

#### Plain HTML
- **Description**: Export as basic HTML without styling
- **Features**:
  - Minimal HTML structure
  - No CSS styling included
  - Perfect for further customization

#### HTML with Tailwind CSS
- **Description**: Export HTML with Tailwind CSS framework
- **Features**:
  - Includes Tailwind CSS CDN
  - Responsive prose styling
  - Modern utility-first design

#### HTML with Bootstrap
- **Description**: Export HTML with Bootstrap framework
- **Features**:
  - Includes Bootstrap CSS and JS CDN
  - Container-based responsive layout
  - Professional Bootstrap styling

### Data Formats

#### JSON Export
- **Description**: Export document metadata and content as JSON
- **Features**:
  - Includes document title, content, export timestamp
  - Machine-readable format
  - Perfect for data processing or API integration

#### RTF (Rich Text Format)
- **Description**: Export as RTF for compatibility with word processors
- **Features**:
  - Basic formatting preservation
  - Compatible with Microsoft Word, LibreOffice, etc.
  - Cross-platform text format

#### MediaWiki Format
- **Description**: Export in MediaWiki markup format
- **Features**:
  - Converts Markdown to MediaWiki syntax
  - Ready for Wikipedia and other MediaWiki sites
  - Preserves headings, links, and formatting

## How to Use

1. **Access Export Menu**: Click on the "Menu" button in the toolbar
2. **Navigate to Export**: Hover over the "Export" option to open the submenu
3. **Select Format**: Click on your desired export format
4. **Choose Location**: A file dialog will appear to select the save location
5. **Confirm Export**: The file will be exported and a success message will appear

## Technical Implementation

### Frontend Components
- Enhanced `Menu.jsx` with submenu support
- Updated `Toolbar.jsx` to pass export functions
- New export handlers in `App.jsx` for each format

### Backend Functions
- `export_to_pdf` - PDF export functionality
- `export_to_html` - Standard HTML export
- `export_to_html_plain` - Plain HTML export
- `export_to_html_tailwind` - HTML with Tailwind CSS
- `export_to_html_bootstrap` - HTML with Bootstrap
- `export_to_json` - JSON data export
- `export_to_rtf` - RTF format export
- `export_to_mediawiki` - MediaWiki format export

### File Extensions
- PDF: `.pdf`
- HTML: `.html`
- JSON: `.json`
- RTF: `.rtf`
- MediaWiki: `.mediawiki` or `.wiki`

## Adding New Export Formats

The export system is designed to be easily extensible. To add a new export format:

1. **Backend**: Add a new Tauri command function in `src-tauri/src/lib.rs`
2. **Frontend**: Add the export handler in `App.jsx`
3. **Menu**: Add the menu item in `Menu.jsx`
4. **Toolbar**: Pass the function through `Toolbar.jsx`

Example for adding a new format:

```rust
#[tauri::command]
async fn export_to_new_format(content: String, filename: String) -> Result<String, String> {
    // Implementation here
    Ok("Export successful".to_string())
}
```

## Error Handling

- All export functions include proper error handling
- User-friendly error messages are displayed via toast notifications
- File validation ensures the document is ready for export
- Graceful handling of file system permissions

## Future Enhancements

- **DOCX Export**: Microsoft Word document format
- **EPUB Export**: eBook format support
- **LaTeX Export**: Academic document format
- **Custom Templates**: User-defined export templates
- **Batch Export**: Export to multiple formats simultaneously
- **Export Settings**: Configurable export options (themes, layouts, etc.)

## Dependencies

- **Rust**: `chrono` for JSON timestamps
- **JavaScript**: Native browser file APIs
- **CDN Resources**: Tailwind CSS and Bootstrap (for respective HTML exports)

This export system provides users with flexible options for sharing and publishing their markdown documents while maintaining the simplicity and ease of use that Docura is known for.