# 🎉 Docura v1.0.1 - Omarchy Integration Release

**A fast, elegant markdown editor built with Tauri and React**

**96% smaller than Typora · 23% less RAM · 100% Open Source**

---

## 🎨 Major New Feature: Omarchy Integration

Docura now **natively integrates with Omarchy** (DHH's curated Arch Linux environment)!

### What Makes It Special

- 🔍 **Auto-Detection** - Automatically detects Omarchy/Omakase environment
- 🎨 **Theme Sync** - Syncs with your terminal theme (Dracula, Nord, Catppuccin, Gruvbox, Tokyo Night, and more!)
- 🔤 **Font Sync** - Uses your Omarchy font in the editor (perfect for Nerd Fonts!)
- 🔄 **Auto-Update** - Checks and syncs every 30 seconds
- 🔒 **Respects Control** - When sync is enabled, Omarchy controls themes (no manual overrides)

**The Philosophy:** Just like Rails respects convention over configuration, Docura respects Omarchy's curation. When you enable sync, Omarchy is in control—and we honor that choice.

### Supported Themes

All 12 Omarchy themes mapped perfectly:
- **Dracula** → Dracula Dark
- **Catppuccin** → Cappuccino Dark
- **Catppuccin Latte** → Cappuccino Light
- **Nord** → Nord Dark
- **Gruvbox** → Monokai Dark
- **Tokyo Night** → GitHub Dark
- **Everforest** → Nord Light
- **Kanagawa** → Nord Dark
- **Rose Pine** → Nord Dark
- **Ristretto** → Cappuccino Dark
- **Matte Black** → GitHub Dark
- **Osaka Jade** → Nord Light

---

## ✨ Day 2 Features (v1.0.1)

### Productivity Enhancements
- ⌨️ **Keyboard Shortcuts** - Ctrl+S (Save), Ctrl+Shift+S (Save As), Ctrl+O (Open File), Ctrl+Shift+O (Open Folder), Ctrl+B (Toggle Sidebar), F11 (Fullscreen)
- 🔔 **Toast Notifications** - Beautiful feedback for every action (save, open, sync, errors)
- ⚙️ **Settings Dialog** - Configure Omarchy sync and future preferences
- 📋 **Menu System** - Professional unified menu (File, Export, View, Settings)

### Editor Improvements
- 🖼️ **Image Loading** - Display local images in markdown with secure Tauri asset protocol
- ✅ **Interactive Checkboxes** - Click to toggle task lists directly in Preview/Live modes
- 🔴 **Unsaved Changes Indicator** - Pulsing dot shows when file needs saving
- 🎯 **Active File Highlighting** - Current file highlighted in sidebar with accent border
- 📁 **Single File Mode** - Open files without folder now appear in sidebar

### Theme Integration
- 🎨 **Theme-Aware UI** - All new features match your selected theme perfectly
- 🔤 **Custom Font Support** - Omarchy fonts applied to Code and Live editors

---

## 📦 Installation

### Arch Linux (Recommended for Omarchy Users)

**Using pacman:**
```bash
# Download the package
wget https://github.com/WOF-Softwares/Docura/releases/download/v1.0.1/docura-bin-1.0.0-1-x86_64.pkg.tar.zst

# Install
sudo pacman -U docura-bin-1.0.0-1-x86_64.pkg.tar.zst
```

**Using the package file directly:**
```bash
# Extract and install
tar -xf docura-bin-1.0.0-1-x86_64.pkg.tar.zst -C /
```

### Debian/Ubuntu

```bash
# Download
wget https://github.com/WOF-Softwares/Docura/releases/download/v1.0.1/Docura_1.0.0_amd64.deb

# Install
sudo dpkg -i Docura_1.0.0_amd64.deb

# Fix dependencies if needed
sudo apt-get install -f
```

### Fedora/RHEL/openSUSE

```bash
# Download
wget https://github.com/WOF-Softwares/Docura/releases/download/v1.0.1/Docura-1.0.0-1.x86_64.rpm

# Install (Fedora/RHEL)
sudo rpm -i Docura-1.0.0-1.x86_64.rpm

# Or (openSUSE)
sudo zypper install Docura-1.0.0-1.x86_64.rpm
```

### Universal Linux (Any Distribution)

```bash
# Download AppImage
wget https://github.com/WOF-Softwares/Docura/releases/download/v1.0.1/Docura_1.0.0_amd64.AppImage

# Make executable
chmod +x Docura_1.0.0_amd64.AppImage

# Run
./Docura_1.0.0_amd64.AppImage
```

---

## 🚀 Quick Start

### For Omarchy Users

1. **Install Docura** (using your preferred method above)
2. **Launch Docura**
3. **Open Menu → Settings**
4. **Enable "Auto-sync with Omakase theme"**
5. **Done!** Your terminal and editor now stay in sync! 🎨

Change your theme in the terminal and watch Docura update automatically (or click "Sync Now" for instant sync).

### For Non-Omarchy Users

Docura works perfectly without Omarchy too! Just use it as a standalone markdown editor with:
- Three editing modes (Code, Live, Preview)
- 12 beautiful themes
- PDF export & print
- Document outline navigation
- And much more!

---

## 🌟 Core Features (v1.0)

### Three Powerful Editing Modes

1. **Code Mode** 📝
   - Monaco editor with syntax highlighting
   - 12 beautiful themes
   - Full IDE features (line numbers, code folding, etc.)

2. **Live Mode** ✍️
   - Split-pane WYSIWYG editing
   - Type markdown, see live preview
   - Toolbar buttons (Bold, Italic, Headers, etc.)
   - Perfect for beginners and pros

3. **Preview Mode** 👁️
   - Beautiful Typora-inspired typography
   - Interactive checkboxes
   - Read-only rendered view

### Performance & Size

- **96% smaller than Typora** - 12 MB vs 326 MB
- **23% less RAM** - 780 MB vs 1,011 MB  
- **94% smaller download** - 5 MB vs 80 MB
- **Native performance** - Rust backend with Tauri

### Features

- ✅ PDF Export with high-quality rendering
- ✅ Print Support with native system dialogs
- ✅ Document Outline with clickable navigation
- ✅ Tiling WM Support (i3, sway, Hyprland, etc.)
- ✅ Fullscreen Mode for distraction-free writing
- ✅ File Tree with folder navigation
- ✅ 12 Unified Themes across UI, editor, and preview
- ✅ Image Support with secure local file loading
- ✅ Interactive Checkboxes in preview modes

---

## 🎯 What's New in v1.0.1

### Omarchy Integration
- Dual detection (`omarchy-*` and `omakase-*` commands)
- Theme synchronization with 12 theme mappings
- Font synchronization (uses your terminal font in editor)
- Auto-sync every 30 seconds (configurable)
- Manual "Sync Now" button
- Control respect (blocks manual changes when synced)

### UX Improvements  
- Keyboard shortcuts for common actions
- Toast notifications for better feedback
- Settings dialog for configuration
- Menu system for better organization
- Unsaved changes indicator
- Active file highlighting in sidebar
- Single file mode support

### Editor Enhancements
- Image loading with Tauri asset protocol
- Interactive checkboxes (click to toggle!)
- Theme-aware checkbox styling
- Custom font support from Omarchy

### Bug Fixes
- Fixed infinite re-render loop with interactive checkboxes
- Improved file scope handling for images
- Better error handling for missing commands

---

## 📚 Documentation

- **Website**: https://wof-softwares.github.io/Docura/
- **GitHub**: https://github.com/WOF-Softwares/Docura
- **README**: https://github.com/WOF-Softwares/Docura/blob/master/README.md
- **Omarchy Integration Guide**: https://github.com/WOF-Softwares/Docura/blob/master/docs/OMAKASE_INTEGRATION.md
- **Blog**: "Respecting Omakase: Why We Built DHH's Philosophy Into Docura"

---

## 🔧 Build from Source

```bash
# Clone repository
git clone https://github.com/WOF-Softwares/Docura.git
cd Docura

# Install dependencies
npm install

# Development mode
npm run dev

# Build production
npm run tauri build
```

**Requirements:**
- Node.js 18+
- Rust (via rustup)
- WebKitGTK 4.1 (Linux)

---

## 💎 For Omarchy Users

This release was built with deep respect for DHH's Omarchy philosophy. When you enable Omarchy sync:

- ✅ Docura detects your setup automatically
- ✅ Themes sync perfectly (colors match exactly!)
- ✅ Your font is used in the editor
- ✅ Manual overrides are blocked (intentionally!)
- ✅ It just works

**Just like Rails respects convention over configuration, Docura respects Omarchy's curation.**

Opinionated. Simple. It just works. 🙏

---

## 📄 License

Apache 2.0 - Free and open source forever

---

## 🙏 Acknowledgments

**Special thanks to:**
- **DHH** - For Rails, Omarchy, and teaching us that opinionated software is good software
- **Tauri Team** - For the amazing Rust + WebView framework
- **Claude AI** - Primary AI partner in development
- **The Ruby & Arch communities** - For embracing well-crafted, opinionated tools

---

## 🐛 Known Issues

- Omarchy detection requires `omarchy-theme-current` or `omakase-theme-current` commands
- Font sync requires `omarchy-font-current` or `omakase-font-current` commands
- Some Nerd Font icons may not render if font is not installed system-wide

---

## 📝 Changelog

See [CHANGELOG.md](https://github.com/WOF-Softwares/Docura/blob/master/CHANGELOG.md) for detailed changes.

---

## 💬 Feedback & Support

- 🐛 **Issues**: https://github.com/WOF-Softwares/Docura/issues
- 💬 **Discussions**: https://github.com/WOF-Softwares/Docura/discussions
- 🌟 **Star the repo** if you find it useful!

---

**Built with ❤️ in 2 days with AI assistance (October 9-11, 2025)**

**Transparent about AI usage:** Cursor, Claude AI, GitHub Copilot, Warp Terminal, DeepSeek, Bing Copilot

*The future of software development is collaborative!* 🤝🤖

---

## 📦 Download Assets

- `docura-bin-1.0.0-1-x86_64.pkg.tar.zst` - Arch Linux package
- `Docura_1.0.0_amd64.deb` - Debian/Ubuntu package  
- `Docura-1.0.0-1.x86_64.rpm` - Fedora/RHEL/openSUSE package
- `Docura_1.0.0_amd64.AppImage` - Universal Linux binary

**Choose the package for your distribution and enjoy Docura!** 🚀

