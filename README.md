# 📝 Docura

**A fast, elegant, and memory-efficient Markdown editor built with Tauri and React.**

Docura is a native desktop app designed for Linux systems. Inspired by Typora, it offers a clean, modern UI for Markdown editing and viewing — but uses **23% less memory** than traditional Electron-based editors. Built with Rust (Tauri) for performance, safety, and a minimal footprint.

---

## ✨ Features

- 📝 **Monaco Editor** - Full-featured code editor with syntax highlighting
- 👁️ **Live Preview** - Real-time Markdown rendering with syntax-highlighted code blocks
- 📂 **File Browser** - Folder tree sidebar with recursive directory support
- 📑 **Document Outline** - Automatic heading extraction and navigation
- 🎨 **Theme Switching** - Beautiful light and dark themes
- 💾 **Auto-Save** - File operations with native dialogs
- 🚀 **Lightweight** - Uses **780 MB RAM** vs Typora's 1011 MB (23% less!)
- 🔒 **Privacy-First** - Offline-first, no telemetry, fully local

---

## 🧱 Tech Stack

| Layer       | Technology |
|-------------|------------|
| **Backend** | [Tauri 2.8](https://tauri.app) - Rust-based desktop framework |
| **Frontend** | React 19 + Vite 7 |
| **Editor** | [Monaco Editor](https://microsoft.github.io/monaco-editor/) - VSCode's editor |
| **Markdown** | [react-markdown](https://github.com/remarkjs/react-markdown) with syntax highlighting |
| **File I/O** | Tauri plugins (fs, dialog) |
| **Renderer** | WebKitGTK (system native) |
| **Styling** | Custom CSS with CSS variables for theming |

---

## 📊 Performance Comparison

Tested on Linux (Arch) with both applications running a markdown file:

```
╔════════════════════════════════════════════════════════════╗
║        TYPORA vs DACURA - Memory Usage Comparison         ║
╠════════════════════════════════════════════════════════════╣
║  Application          │  Memory Used │   Difference ║
║  Typora (Electron)    │   1011.14 MB │     baseline ║
║  Dacura (Tauri)       │    780.22 MB │   -230.92 MB ║
╠════════════════════════════════════════════════════════════╣
║  Dacura uses 22.8% LESS memory than Typora!              ║
║  Memory saved: ~231 MB                                     ║
╚════════════════════════════════════════════════════════════╝
```

### Why is Dacura more efficient?

- **WebKitGTK vs Chromium** - WebKit is lighter than full Chromium
- **Rust vs Node.js** - More memory-efficient backend
- **System Integration** - Uses system WebKit rather than bundling everything
- **No V8 overhead** - Electron includes full V8 JavaScript engine for backend

---

## 🛣️ Roadmap

### ✅ Phase 1: Core Editor (Complete!)
- [x] Tauri + React project setup
- [x] Monaco Editor integration
- [x] Live Markdown preview
- [x] File open/save dialogs
- [x] Modern UI layout with sidebar

### ✅ Phase 2: Project Management (Complete!)
- [x] Folder tree sidebar with recursive browsing
- [x] Outline and TOC generation
- [x] Theme switching (light/dark)
- [x] Document header navigation

### 🚧 Phase 3: Enhanced Features (In Progress)
- [ ] Export to PDF functionality
- [ ] Print support
- [ ] Recent files and favorites
- [ ] Search across files
- [ ] Custom keyboard shortcuts
- [ ] Split view (edit + preview side-by-side)

### 🔮 Phase 4: Extensions & Polish
- [ ] Plugin system for custom renderers
- [ ] Diagram support (Mermaid, PlantUML)
- [ ] Export to HTML/Slides
- [ ] Vim/Emacs keybindings
- [ ] AI assistant integration (optional)

### 📦 Phase 5: Distribution
- [ ] AppImage packaging
- [ ] AUR package for Arch Linux
- [ ] `.deb` package for Debian/Ubuntu
- [ ] Public beta release

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16+)
- **Rust** (latest stable via rustup)
- **System dependencies** (Linux):
  ```bash
  # Arch Linux
  sudo pacman -S webkit2gtk-4.1
  
  # Ubuntu/Debian
  sudo apt install libwebkit2gtk-4.1-dev
  ```

### Running in Development

```bash
# Clone the repository
git clone https://github.com/WOF-Softwares/Docura.git
cd Docura

# Install dependencies
npm install

# Run the app
npm run tauri:dev
```

### Building for Production

```bash
# Build optimized binary
npm run tauri:build

# Binary will be in src-tauri/target/release/
```

---

## 🤝 Contributing

We welcome contributions! Areas where you can help:

- 🎨 **UI/UX improvements** - React components and styling
- 📝 **Markdown rendering** - Enhanced preview features
- 🔧 **Rust backend** - File operations and system integration
- 🎯 **Features** - Implement items from the roadmap
- 📚 **Documentation** - Improve guides and examples
- 🐛 **Bug fixes** - Report and fix issues

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and test
4. Commit: `git commit -am 'Add some feature'`
5. Push: `git push origin feature/my-feature`
6. Open a Pull Request

------

## 📜 License

Apache 2.0 — see `LICENSE`

------

## 🌐 Community & Support

- 💬 **Issues** - [GitHub Issues](https://github.com/WOF-Softwares/Docura/issues)
- 🌟 **Star the repo** - If you find Docura useful!
- 🐦 **Share** - Spread the word about lightweight desktop apps

---

## 🙏 Acknowledgments

- Inspired by [Typora](https://typora.io/) - The excellent Markdown editor
- Built with [Tauri](https://tauri.app/) - The Rust-powered desktop framework
- Powered by [Monaco Editor](https://microsoft.github.io/monaco-editor/) - VSCode's editor component