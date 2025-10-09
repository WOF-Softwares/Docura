# 📝 Docura

**A fast, elegant, and secure document viewer/editor built with Rust and Iced.**

Docura is a native desktop app designed for SunlightOS and other Linux systems. It supports Markdown, PDF, and project-based document management — with a clean UI, customizable themes, and future AI integration. Inspired by Typora, but built for performance, safety, and deep system integration.

---

## ✨ Features

- 📝 Live Markdown editing with preview
- 📄 PDF viewing with native rendering
- 📂 Project sidebar with folder tree and recent files
- 🎨 Custom themes and color schemes
- 🔍 Outline and search panel
- 🔒 Offline-first, no telemetry
- 🧠 Planned: AI assistant for summaries, grammar fixes, and code explanations

---

## 🧱 Tech Stack

| Layer       | Tool |
|-------------|------|
| GUI         | [`Iced`](https://github.com/iced-rs/iced) |
| Markdown    | `pulldown-cmark` or `comrak` |
| PDF         | `poppler-rs` or `pdfium-render` |
| File I/O    | `tokio` or `async-std` |
| Theming     | Custom Iced styles |
| Packaging   | `.deb`, `.rpm`, `.msi`, AUR, AppImage |

---

## 🛣️ Roadmap

### Phase 1: Core Editor (Q4 2025)
- [x] Project setup and crate structure
- [ ] Markdown parser and live preview
- [ ] PDF viewer integration
- [ ] File open/save dialogs
- [ ] Basic UI layout with Iced

### Phase 2: Project Management (Q1 2026)
- [ ] Folder tree sidebar
- [ ] Recent files and favorites
- [ ] Outline and TOC generation
- [ ] Theme switching (light/dark/custom)

### Phase 3: AI & Extensions (Q2 2026)
- [ ] AI assistant integration (summarize, fix grammar, explain code)
- [ ] Plugin system for diagrams, charts, export formats
- [ ] Export to PDF/HTML/Slides

### Phase 4: Packaging & Release (Q3 2026)
- [ ] AppImage and AUR packaging
- [ ] Installer script for SunlightOS
- [ ] Public beta release

## 🚀 Getting Started

```
git clone https://github.com/yourusername/docura
cd docura
cargo run
```

---

## 🤝 Contributing

We welcome contributions in:

- UI components (Iced)
- Markdown and PDF rendering
- Theming and layout
- AI assistant workflows
- Documentation and testing

See `CONTRIBUTING.md` for guidelines.

------

## 📜 License

Apache 2.0 — see `LICENSE`

------

## 🌐 Community

- GitHub Discussions (coming soon)
- Matrix channel (planned)
- Blog posts and video updates (in progress)