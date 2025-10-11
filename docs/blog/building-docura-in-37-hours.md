---
title: Building Docura in 37 Hours
date: October 11, 2025
author: Ehsan
readTime: 5 min read
excerpt: The story behind creating a full-featured markdown editor in just over a day and a half.
---

# Building Docura in 37 Hours

## 💡 The Spark

A few nights ago, I opened Typora and was reminded of why I loved it — the clean interface, the beautiful typography, the distraction-free writing. But I had 15 days left on my trial, and instead of reaching for my wallet, I asked myself: **"Could I build something better?"**

Not just a clone — something that addressed Typora's limitations:
- Only one editing mode (WYSIWYG-only can feel limiting)
- No split-pane view for learning markdown syntax
- Closed source and $14.99 price tag
- Heavy memory footprint (1011 MB on my system)
- Poor Linux integration (no tiling window manager support)

So I fired up my IDE and started what became **Docura**.

## 🏗️ The Tech Stack

I chose **Tauri 2.8** as the foundation for three critical reasons:

1. **WebKitGTK vs Chromium**: Tauri uses the system's native WebKit renderer instead of bundling a full Chromium instance like Electron does. Result? **780 MB vs 1011 MB** — a 231 MB saving.

2. **Rust Backend**: File I/O, system integration, and window management in native Rust instead of Node.js means lower overhead and better security.

3. **Native Integration**: On Linux, Tauri apps feel truly native — respecting system themes, using system dialogs, and integrating seamlessly with window managers.

For the frontend, I picked:
- **React 19** with Vite 7 for instant HMR
- **Monaco Editor** (the same editor powering VS Code)
- **@uiw/react-md-editor** for WYSIWYG editing
- **react-markdown** + **remark-gfm** for GFM rendering
- **jspdf** + **html2canvas** for PDF generation

## ⚙️ Three Editing Modes

The core innovation in Docura is **three distinct editing modes**:

### 1. Code Mode 📝
Pure markdown editing with Monaco Editor featuring custom syntax highlighting for 12 themes, line numbers, code folding, and all IDE features.

### 2. Live Mode ✍️ (The Game-Changer)
Split-pane WYSIWYG editing that solves Typora's biggest weakness:
- Left pane: Raw markdown with toolbar buttons
- Right pane: Live rendered preview
- Educational and powerful

### 3. Preview Mode 👁️
Read-only rendered markdown with Typora-inspired typography, interactive checkboxes, and clickable outline navigation.

## 🕰️ The Timeline

| Time | Achievement |
|------|-------------|
| **Oct 9, 10:12 PM** | Project started |
| **Overnight** | Tauri + React setup, Monaco integration |
| **Oct 10** | Theme system, WYSIWYG mode, toolbar |
| **Oct 10, late** | File explorer, outline navigation |
| **Oct 11, morning** | PDF export, print preview, native dialogs |
| **Oct 11, 11:29 AM** | ✅ **v1.0 complete** |

**Total: 37 hours and 17 minutes.**

## 📊 The Performance Win

Memory comparison (both apps editing the same markdown file on Arch Linux):

- **Typora (Electron)**: 1011 MB
- **Docura (Tauri)**: 780 MB
- **Savings**: 231 MB (23% lighter!)

Why? No bundled Chromium, Rust backend, optimized React rendering, and efficient WebKitGTK.

## 🎯 What's Next

Docura v1.0 is production-ready, but there's more to build:
- Search & replace (Ctrl+F, Ctrl+H)
- Recent files list
- Diagram support (Mermaid, PlantUML)
- Math equations (LaTeX/KaTeX)
- AppImage & AUR packaging

## 💬 Final Thoughts

Docura started as a "can I build this?" challenge. 37 hours later, it's a markdown editor that:
- Uses **23% less memory** than Typora
- Offers **three editing modes** instead of one
- Costs **$0** instead of $14.99
- Respects **Linux workflows**
- Is **fully open source**

**⭐ [Star us on GitHub](https://github.com/WOF-Softwares/Docura)**

