# 🎨 Docura Theme System

Docura includes a beautiful Typora-like markdown rendering system with 4 built-in themes.

## Built-in Themes

### 1. 🦇 Dracula Dark
- **Description:** Purple and cyan dark theme inspired by the popular Dracula color scheme
- **Best for:** Night coding, reduced eye strain
- **Colors:** Purple headings, cyan links, warm background

### 2. ☕ Cappuccino Dark  
- **Description:** Warm dark theme with pink and orange accents
- **Best for:** Cozy late-night writing
- **Colors:** Soft purple, teal accents, brown undertones

### 3. ❄️ Nord Light
- **Description:** Arctic-inspired light theme with blue accents
- **Best for:** Daytime work, clean aesthetic
- **Colors:** Cool blues, Arctic whites, subtle grays

### 4. ☀️ Solarized Light
- **Description:** Scientifically designed for optimal readability
- **Best for:** Long reading sessions, accessibility
- **Colors:** Warm beige background, carefully balanced contrasts

## How to Change Themes

1. Click the **Palette icon** (🎨) in the toolbar
2. Browse theme previews in the dialog
3. Click on your preferred theme
4. Click "Apply Theme"
5. Your choice is automatically saved to `~/.local/share/dacura/config.json`

## Theme Features

Each theme includes styled support for:

- ✍️ **Typography** - Headings (H1-H6), paragraphs, emphasis
- 🔗 **Links** - Hover effects and active states
- 📝 **Code Blocks** - Syntax highlighting support
- 📊 **Tables** - Headers, rows, alternating backgrounds
- 💬 **Blockquotes** - Styled quote blocks with borders
- 📋 **Lists** - Ordered and unordered lists
- 🖼️ **Images** - Rounded corners with subtle shadows
- ➖ **Horizontal Rules** - Section dividers

## Configuration Storage

Themes are stored in:
```
~/.local/share/dacura/config.json
```

Example configuration:
```json
{
  "theme": "dracula-dark",
  "recent_files": []
}
```

## Future: Custom Themes

In future versions, you'll be able to create custom themes by placing them in:
```
~/.local/share/dacura/themes/my-theme/
  ├── manifest.json
  └── style.css
```

Example `manifest.json`:
```json
{
  "id": "my-theme",
  "name": "My Custom Theme",
  "description": "A beautiful custom theme",
  "author": "Your Name",
  "version": "1.0.0",
  "type": "dark"
}
```

Example `style.css`:
```css
[data-md-theme="my-theme"] {
  --bg-primary: #1e1e1e;
  --text-primary: #d4d4d4;
  --heading-color: #569cd6;
  /* ... more variables ... */
}
```

## CSS Variables Reference

All themes use these CSS variables for consistency:

| Variable | Purpose |
|----------|---------|
| `--bg-primary` | Main background color |
| `--text-primary` | Main text color |
| `--text-secondary` | Secondary/muted text |
| `--text-strong` | Bold text emphasis |
| `--text-emphasis` | Italic text color |
| `--heading-color` | H1-H6 colors |
| `--heading-border` | H1-H2 border bottom |
| `--link-color` | Hyperlink color |
| `--link-hover` | Hyperlink hover color |
| `--code-bg` | Inline code background |
| `--code-color` | Inline code text |
| `--code-block-bg` | Code block background |
| `--code-block-color` | Code block text |
| `--blockquote-bg` | Quote background |
| `--blockquote-border` | Quote left border |
| `--blockquote-color` | Quote text color |
| `--table-bg` | Table background |
| `--table-header-bg` | Table header background |
| `--table-header-color` | Table header text |
| `--table-alt-bg` | Alternating row background |
| `--border-color` | General borders |
| `--shadow-color` | Shadow effects |

## Tips for Best Experience

1. **Match UI Theme**: The markdown theme is separate from the UI (light/dark) theme. Mix and match for your preference!
2. **Preview Mode**: Use the "Preview" tab to see your markdown rendered with the current theme
3. **Accessibility**: All themes are designed with sufficient contrast ratios for readability
4. **Performance**: Theme switching is instant with zero performance impact

---

Made with ❤️ for markdown lovers

