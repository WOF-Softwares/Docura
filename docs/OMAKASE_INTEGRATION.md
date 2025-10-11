# Omakase Integration

Docura now integrates seamlessly with [Omakase](https://omakase.app) by DHH (David Heinemeier Hansson)! 🎨

## What is Omakase?

Omakase is DHH's curated development environment, providing a beautiful, consistent terminal experience with themes and fonts. It's used by Ruby on Rails developers and productivity enthusiasts worldwide.

## Features

### Auto Theme Synchronization

Docura can automatically sync its theme with your Omakase theme:

- **Automatic Detection**: Docura detects if you're running in an Omakase environment
- **Theme Mapping**: Maps Omakase themes to Docura's built-in themes
- **Real-time Sync**: Checks and syncs every 30 seconds when enabled
- **Manual Sync**: Click the "Omakase" button in the toolbar for instant sync

### Supported Omakase Themes

| Omakase Theme      | Docura Theme      |
|--------------------|-------------------|
| Dracula            | Dracula Dark      |
| Catppuccin         | Cappuccino Dark   |
| Catppuccin Latte   | Cappuccino Light  |
| Nord               | Nord Dark         |
| Everforest         | Nord Light        |
| Gruvbox            | Monokai Dark      |
| Kanagawa           | Nord Dark         |
| Matte Black        | GitHub Dark       |
| Osaka Jade         | Nord Light        |
| Ristretto          | Cappuccino Dark   |
| Rose Pine          | Nord Dark         |
| Tokyo Night        | GitHub Dark       |

## How to Use

### 1. Enable Omakase Sync

1. Open **Menu** → **Settings** (or click the ⚙️ icon)
2. In the **Omakase Integration** section, you'll see if Omakase is detected
3. Check the **"Auto-sync with Omakase theme"** checkbox
4. Docura will now sync with your Omakase theme every 30 seconds!

### 2. Manual Sync

- When auto-sync is enabled, click the **🔄 Omakase** button in the toolbar
- This forces an immediate theme sync

### 3. Settings Page

The new Settings dialog provides:
- Omakase detection status
- Current Omakase theme and font
- Mapped Docura theme
- Toggle for auto-sync
- Manual sync button

## How It Works

### Detection

Docura checks for Omakase by running:
```bash
which omakase-theme-current
```

If the command exists, Omakase is detected! ✨

### Theme Retrieval

Docura uses two Omakase commands:
```bash
# Get current theme
omakase-theme-current
# Output: Dracula

# Get current font
omakase-font-current
# Output: CaskaydiaMono Nerd Font Mono
```

### Sync Interval

When auto-sync is enabled:
1. Syncs immediately on enable
2. Checks Omakase theme every 30 seconds
3. Updates Docura theme if changed
4. Shows toast notification on theme change

## Technical Details

### Backend (Rust)

Three new Tauri commands:
- `check_omakase_command()` - Detects Omakase
- `get_omakase_theme()` - Gets current theme
- `get_omakase_font()` - Gets current font

### Frontend (React)

New components:
- `SettingsDialog.jsx` - Settings UI
- `Menu.jsx` - Unified menu system
- `omakaseSync.js` - Sync utility with theme mapping

### Configuration

Omakase sync preference is saved in:
```
~/.local/share/dacura/config.json
```

```json
{
  "theme": "dracula-dark",
  "omakase_sync": true,
  "recent_files": []
}
```

## Omakase Themes Location

Omakase stores themes in:
```
~/.config/omakase/themes/
```

Available themes:
```
catppuccin
catppuccin-latte
dracula
everforest
gruvbox
kanagawa
matte-black
nord
osaka-jade
ristretto
rose-pine
tokyo-night
```

## Why This Integration?

DHH built Omakase to provide a consistent, beautiful development environment. By syncing with Omakase, Docura:

1. **Matches Your Workflow**: Your editor matches your terminal
2. **Reduces Context Switching**: Consistent themes everywhere
3. **Respects Your Choices**: Uses the theme you've already chosen
4. **Honors the Creator**: DHH built Ruby on Rails and Omakase - this integration respects that legacy

## Special Thanks

**To DHH (David Heinemeier Hansson)**:
- For creating Ruby on Rails (changed the web!)
- For building Omakase (beautiful developer experience)
- For making development tools that inspire us

This integration is built with admiration and respect for the tools that make developers' lives better. 🙏

## Development Notes

### Adding New Theme Mappings

Edit `src/utils/omakaseSync.js`:

```javascript
const OMAKASE_THEME_MAP = {
  'your-omakase-theme': 'your-docura-theme',
  // ... existing mappings
}
```

### Testing Without Omakase

Omakase detection gracefully fails if not installed:
- Settings dialog shows "Omakase not detected"
- Sync button doesn't appear in toolbar
- App works normally without Omakase

## Future Enhancements

Potential future features:
- [ ] Omakase font support in editor
- [ ] Custom theme mapping in settings
- [ ] Instant sync (without 30s interval)
- [ ] Sync other Omakase preferences
- [ ] Export Docura theme to Omakase format

---

**Built with ❤️ for the Omakase and Ruby community!**

Sharing this with DHH? Tag him: [@dhh](https://twitter.com/dhh)

