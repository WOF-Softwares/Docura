---
title: "The Multi-Window Bug That Taught Me About Tauri Event Isolation"
date: "October 11, 2025"
author: "Docura Team"
tags: ["Tauri", "Rust", "Desktop Apps", "Bug Fix", "Open Source"]
readTime: "8 min read"
---

# 🐞 The Multi-Window Bug That Taught Me About Tauri Event Isolation

**TL;DR:** While building Docura (an open-source Typora alternative), I discovered that Tauri's event system broadcasts to all windows by default. Both the old and new windows would update when opening a folder in a new window. The fix? Use `emit_to()` for targeted emission and `currentWindow.listen()` for scoped listening. Here's the full story.

---

## The Feature That Seemed So Simple

I was building a "respectful UX" feature for Docura—when you try to open a second folder, instead of silently creating a new window (like Typora does), Docura asks:

```
📁 Open New Folder?

You already have "ProjectA" open.
How would you like to proceed?

[🖥️  Open in New Window]  ← Keep both open!
[🔄 Replace This Folder]   ← Switch folders
[Cancel]
```

This mirrors VS Code's behavior—user choice, not forced decisions. Clean, professional, and user-centric. What could go wrong?

## 🧨 The Bug: When Windows Refuse to Mind Their Own Business

**The symptom:** Open Folder A in Window 1. Try to open Folder B in a new window. Choose "Open in New Window."

**Expected:** Window 1 = Folder A, Window 2 = Folder B  
**Reality:** Window 1 = Folder B, Window 2 = Folder B 😱

Both windows changed! The original window lost its state. My carefully isolated multi-window architecture had become a chaotic mess.

After diving into the Tauri documentation and sprinkling `console.log()` statements everywhere, I found the culprit:

### The Root Cause: Global Event Broadcasting

In Tauri v2, there are TWO ways to emit events:

```rust
// ❌ THIS broadcasts to ALL windows
window.emit("cli-open-folder", payload)

// ✅ THIS targets a specific window
app.emit_to("window-label", "cli-open-folder", payload)
```

Similarly, on the JavaScript side:

```javascript
// ❌ THIS listens to ALL events globally
listen('cli-open-folder', handler)

// ✅ THIS listens only to THIS window's events  
currentWindow.listen('cli-open-folder', handler)
```

I was using the global broadcast methods, so every window was receiving and processing events meant for others. Classic multi-window isolation failure.

## 🔧 The Fix: Proper Event Isolation

The solution required changes on **both** the Rust backend and JavaScript frontend.

### Part 1: Rust Backend (Targeted Emission)

**Before (Broadcasting to everyone):**
```rust
#[command]
async fn open_new_window(app: tauri::AppHandle, folder_path: Option<String>) -> Result<(), String> {
    let new_window = tauri::WebviewWindowBuilder::new(
        &app,
        &window_label,
        tauri::WebviewUrl::App("index.html".into())
    )
    .build()
    .map_err(|e| e.to_string())?;
    
    if let Some(path) = folder_path {
        // ❌ This broadcasts to ALL windows!
        new_window.emit("cli-open-folder", path)
            .map_err(|e| e.to_string())?;
    }
    
    Ok(())
}
```

**After (Targeted emission):**
```rust
#[command]
async fn open_new_window(app: tauri::AppHandle, folder_path: Option<String>) -> Result<(), String> {
    // Generate unique window label
    let window_label = format!("docura-{}", std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis());
    
    let new_window = tauri::WebviewWindowBuilder::new(
        &app,
        &window_label,
        tauri::WebviewUrl::App("index.html".into())
    )
    .build()
    .map_err(|e| e.to_string())?;
    
    if let Some(path) = folder_path {
        // Wait for window to initialize
        tokio::time::sleep(tokio::time::Duration::from_millis(2000)).await;
        
        // ✅ Target ONLY the new window by its label
        app.emit_to(&window_label, "cli-open-folder", path)
            .map_err(|e| e.to_string())?;
        log::info!("Event emitted to window: {}", window_label);
    }
    
    Ok(())
}
```

**Key changes:**
- Generate a unique window label using timestamp
- Use `app.emit_to(&window_label, ...)` instead of `window.emit(...)`
- Events now go to the specific window only

I also fixed the CLI argument handler:

```rust
// CLI arguments - emit only to main window
if path.is_dir() {
    // ✅ Targets main window specifically
    app.emit_to("main", "cli-open-folder", arg);
} else if path.is_file() {
    app.emit_to("main", "cli-open-file", arg);
}
```

### Part 2: JavaScript Frontend (Scoped Listeners)

**Before (Global listener):**
```javascript
useEffect(() => {
    let unlistenFolder, unlistenFile
    
    // ❌ Listens to ALL events globally
    listen('cli-open-folder', async (event) => {
        const folderPath = event.payload
        // This runs in ALL windows!
        await openFolder(folderPath)
    }).then(fn => { unlistenFolder = fn })
    
    return () => {
        if (unlistenFolder) unlistenFolder()
    }
}, [])
```

**After (Window-specific listener):**
```javascript
useEffect(() => {
    let unlistenFolder, unlistenFile
    
    // ✅ Get reference to THIS window
    const currentWindow = getCurrentWindow()
    
    // ✅ Listen ONLY to events for THIS window
    currentWindow.listen('cli-open-folder', async (event) => {
        const folderPath = event.payload
        // This runs ONLY in the target window!
        await openFolder(folderPath)
    }).then(fn => { 
        unlistenFolder = fn
        console.log('✅ CLI folder listener registered for THIS window')
    })
    
    return () => {
        if (unlistenFolder) unlistenFolder()
    }
}, [])
```

**Key changes:**
- Import `getCurrentWindow()` from `@tauri-apps/api/window`
- Use `currentWindow.listen()` instead of global `listen()`
- Each window now only responds to its own events

## ✅ The Result: Multi-Window Magic ✨

After implementing both fixes, Docura's multi-window behavior is now rock solid:

- ✅ **Window Isolation:** Each window maintains its own independent state
- ✅ **VS Code-like UX:** Open Project A in Window 1, Project B in Window 2, no bleed-over
- ✅ **Predictable Behavior:** Events go exactly where they're supposed to go
- ✅ **Professional Feel:** Users get the polished experience they expect

Test it yourself:
```bash
# Terminal 1
docura ~/project1 &

# Terminal 2  
docura ~/project2 &

# Both windows stay independent! 🎉
```

## 📚 Lessons Learned

### 1. **Default != Safe in Multi-Window Apps**
Tauri's default event methods (`emit()`, `listen()`) are convenient but broadcast globally. Always use scoped methods in multi-window scenarios.

### 2. **Test With Multiple Windows Early**
Don't wait until the feature is "done" to test with 3+ windows. These bugs compound as complexity grows.

### 3. **The Documentation Has Your Back**
Tauri's docs mention this, but it's easy to miss. Reading through the [Event System](https://tauri.app/v1/guides/features/events/) and [Window Management](https://tauri.app/v1/guides/features/window/) sections would have saved me hours.

### 4. **Isolation Requires Discipline at Both Ends**
Backend AND frontend need to cooperate. One scoped, one global = still broken.

## 🎯 The Bigger Picture: Why This Matters

This isn't just about one bug in one app. It's about **architectural patterns** that scale:

- **Microservices mindset:** Each window is like a microservice—isolated, independent, communicating via well-defined channels
- **User respect:** When users open multiple windows, they expect isolation. Breaking that violates the mental model
- **Professional polish:** The difference between "works most of the time" and "works perfectly every time"

## 🚀 Try Docura Today

Docura is fully open source (Apache 2.0 license). If you're tired of Typora's price tag and want a faster, lighter, more respectful markdown editor:

- **GitHub:** [WOF-Softwares/Docura](https://github.com/WOF-Softwares/Docura)
- **Features:** 3 editing modes, 12 themes, PDF export, Omarchy integration, CLI support
- **Size:** 12 MB vs Typora's 326 MB (96% smaller!)
- **Performance:** 23% less RAM usage

Star the repo if you find this useful, and contributions are always welcome! 🙏

## 💬 Your Turn

Have you hit similar multi-window bugs in Tauri, Electron, or other frameworks? How did you solve them? Drop a comment or open an issue on the repo—let's learn from each other!

---

**About the Author:** I'm building Docura as an open-source alternative to Typora, with help from modern AI tools like Claude and Cursor. Follow the journey on [GitHub](https://github.com/WOF-Softwares/Docura).

**Published:** October 11, 2025  
**Tags:** #Tauri #Rust #DesktopApps #BugFix #OpenSource #Markdown #MultiWindow

---

*If you enjoyed this post, consider sharing it on Twitter or dev.to. Every share helps more developers avoid the same pitfall! 🚀*

