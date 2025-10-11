# 🌟 Day 2 Evening Improvements - The Carpet Gets Better!

## 🎯 The Vision

> "It becomes a better carpet" - More refinements to make Docura truly professional!

---

## 📋 State Management Improvements

### Problem 1: Folder → File Confusion

**Current behavior:**
```
1. User opens folder → Files list appears
2. User opens a file → File opens, but folder files still visible
3. Confusing! Is the folder still "open"?
```

**Better behavior:**
```
1. User opens folder → Files list appears
2. User opens a file → Clear folder, show just this file
3. Clear! User sees only what's relevant
```

### Problem 2: New File in Sidebar

**Current behavior:**
```
1. User clicks "New File" → Editor clears
2. Sidebar is empty (if no folder)
3. User thinks: "Where is my file?"
```

**Better behavior:**
```
1. User clicks "New File" → Editor clears
2. Sidebar shows: "📄 Untitled" (or smart name!)
3. User sees: "Ah, there's my new file!"
```

### Problem 3: No Smart Preview Name

**Current behavior:**
```
New file always shows: "Untitled"
```

**Better behavior (SMART!):**
```
User types: "# My Project Plan"
Sidebar updates to: "📄 My Project Plan"

User types: "Shopping list for weekend"
Sidebar updates to: "📄 Shopping list for we..."
```

**Live preview of filename!** ✨

---

## 🔄 Folder Switching Intelligence

### Problem: Destructive Folder Switch

**Current behavior:**
```
1. User opens "ProjectA" folder
2. User has unsaved changes
3. User opens "ProjectB" folder
4. ProjectA disappears! Changes lost!
```

**Better behavior:**
```
1. User opens "ProjectA" folder
2. User has unsaved changes
3. User opens "ProjectB" folder
4. Dialog appears:
   "You have ProjectA open with unsaved changes.
   
   Would you like to:
   ○ Open in new window (keep both)
   ○ Replace this window (close ProjectA)
   
   [New Window] [Replace]"
```

**Like Chrome/VS Code!** User controls their workspace! 🎯

---

## 💻 Command-Line Arguments (CLI Support)

### The Power User Feature

**Current behavior:**
```bash
$ docura
# Always opens empty
```

**Better behavior:**
```bash
# Open current folder
$ docura .

# Open specific file
$ docura readme.md
$ docura ~/Documents/notes.md

# Open specific folder
$ docura ~/Projects/MyApp

# Multiple instances
$ docura . &
$ docura ~/other-project &
```

**Professional CLI support!** 🚀

---

## 🎨 Implementation Plan

### Phase 1: State Management (Priority 1)

#### 1.1: Folder → File Transition
```javascript
const openFile = async (filePath) => {
  // If folder is open, ask user
  if (currentFolder && hasUnsavedChanges) {
    const choice = confirm('Switch to single file? This will close the folder view.')
    if (!choice) return
  }
  
  // Clear folder state
  setCurrentFolder(null)
  
  // Open file
  setCurrentFile(filePath)
  // ... load content
  
  // Update sidebar to show just this file
  setFiles([{
    name: fileName,
    path: filePath,
    type: 'file'
  }])
}
```

#### 1.2: New File with Smart Name
```javascript
const newFile = async () => {
  // ... existing logic
  
  // Add "Untitled" to sidebar
  setFiles([{
    name: 'Untitled',
    path: null, // Not saved yet
    type: 'file',
    isUntitled: true
  }])
  
  // Listen for content changes
  // Update name dynamically!
}

const updateUntitledFileName = (content) => {
  if (!currentFile) {
    // Extract smart name
    const smartName = getSmartFileName(content)
    
    // Update sidebar
    setFiles([{
      name: smartName || 'Untitled',
      path: null,
      type: 'file',
      isUntitled: true
    }])
  }
}

const getSmartFileName = (content) => {
  if (!content) return 'Untitled'
  
  // Try H1 header first
  const h1Match = content.match(/^#\s+(.+)$/m)
  if (h1Match) {
    return h1Match[1].trim().substring(0, 30) + (h1Match[1].length > 30 ? '...' : '')
  }
  
  // Fallback: First line
  const firstLine = content.split('\n')[0].trim()
  if (firstLine) {
    return firstLine.substring(0, 30) + (firstLine.length > 30 ? '...' : '')
  }
  
  return 'Untitled'
}
```

#### 1.3: Content Change Listener
```javascript
useEffect(() => {
  if (!currentFile && fileContent) {
    // This is an unsaved new file
    // Update the preview name
    updateUntitledFileName(fileContent)
  }
}, [fileContent])
```

---

### Phase 2: Multi-Window Support (Priority 2)

#### 2.1: Folder Switch Dialog
```javascript
const openFolder = async () => {
  // Check if folder already open
  if (currentFolder) {
    // Ask user
    const choice = await showFolderSwitchDialog()
    
    if (choice === 'new-window') {
      // Open new Docura instance
      await invoke('open_new_window', { folderPath: selectedFolder })
      return
    } else if (choice === 'cancel') {
      return
    }
    // else: replace (continue)
  }
  
  // Normal folder open logic
  // ...
}
```

#### 2.2: New Rust Command
```rust
#[tauri::command]
fn open_new_window(app: tauri::AppHandle, folder_path: String) -> Result<(), String> {
    use tauri::Manager;
    
    // Create new window
    let new_window = tauri::WindowBuilder::new(
        &app,
        format!("docura-{}", uuid::Uuid::new_v4()),
        tauri::WindowUrl::App("index.html".into())
    )
    .title("Docura")
    .build()
    .map_err(|e| e.to_string())?;
    
    // Pass folder path to new window
    new_window.emit("open-folder", folder_path)
        .map_err(|e| e.to_string())?;
    
    Ok(())
}
```

#### 2.3: Folder Switch Dialog Component
```javascript
const FolderSwitchDialog = ({ isOpen, onChoice }) => {
  if (!isOpen) return null
  
  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h2>Open New Folder?</h2>
        <p>You already have a folder open. How would you like to proceed?</p>
        
        <div className="dialog-options">
          <button onClick={() => onChoice('new-window')}>
            🪟 Open in New Window
            <span className="hint">Keep both folders open</span>
          </button>
          
          <button onClick={() => onChoice('replace')}>
            🔄 Replace This Folder
            <span className="hint">Close current folder</span>
          </button>
          
          <button onClick={() => onChoice('cancel')}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

### Phase 3: CLI Arguments (Priority 3)

#### 3.1: Rust CLI Handler
```rust
// In src-tauri/src/lib.rs

use tauri::Manager;
use std::env;
use std::path::Path;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Get CLI arguments
    let args: Vec<String> = env::args().collect();
    
    tauri::Builder::default()
        // ... existing setup
        .setup(move |app| {
            // Handle CLI arguments
            if args.len() > 1 {
                let arg = &args[1];
                let path = Path::new(arg);
                
                if path.exists() {
                    if path.is_dir() {
                        // Open folder
                        app.get_window("main")
                            .unwrap()
                            .emit("cli-open-folder", arg)
                            .unwrap();
                    } else if path.is_file() {
                        // Open file
                        app.get_window("main")
                            .unwrap()
                            .emit("cli-open-file", arg)
                            .unwrap();
                    }
                }
            }
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

#### 3.2: Frontend CLI Listener
```javascript
useEffect(() => {
  // Listen for CLI events
  const unlistenFolder = listen('cli-open-folder', (event) => {
    const folderPath = event.payload
    setCurrentFolder(folderPath)
    // Load folder files
    loadFolderFiles(folderPath)
  })
  
  const unlistenFile = listen('cli-open-file', (event) => {
    const filePath = event.payload
    // Open file
    openFileFromPath(filePath)
  })
  
  return () => {
    unlistenFolder.then(fn => fn())
    unlistenFile.then(fn => fn())
  }
}, [])
```

#### 3.3: Desktop Entry / Shell Alias
```bash
# ~/.local/share/applications/docura.desktop
[Desktop Entry]
Name=Docura
Exec=/usr/bin/docura %F
Terminal=false
Type=Application
MimeType=text/markdown;text/plain;

# Shell aliases
alias md='docura'
alias docura-here='docura .'
```

---

## 🎯 User Experience Improvements

### Before (Current):
```
User opens folder → Files show
User opens file → Files still show (confusing!)
User creates new file → No sidebar entry (where is it?)
User wants two folders → Can't! Must close one
User in terminal → Must open app, then open file (slow!)
```

### After (Improved):
```
User opens folder → Files show
User opens file → Sidebar shows just this file (clear!)
User creates new file → "📄 My Document Na..." shows (smart!)
User wants two folders → New window opens! (powerful!)
User in terminal → "docura readme.md" (instant!)
```

---

## 💎 The Ghormeh Sabzi Principle in Action

### Round 5: Even More Refinement!

**What we're doing:**
- 🎯 Better state management
- 🧠 Smart filename preview
- 🪟 Multi-window support
- 💻 CLI arguments
- ✨ Professional UX

**Why it matters:**
- Each iteration makes it better
- Like ghormeh sabzi simmering longer
- Like a Persian carpet gaining character
- Software that respects users!

---

## 📊 Priority & Complexity

| Feature | Priority | Complexity | Impact | Time |
|---------|----------|------------|--------|------|
| Smart filename preview | HIGH | Low | High | 30 min |
| Folder→File transition | HIGH | Low | High | 20 min |
| New file in sidebar | HIGH | Low | High | 15 min |
| Multi-window support | MEDIUM | High | Medium | 2 hours |
| CLI arguments | MEDIUM | Medium | High | 1 hour |

**Total for Phase 1:** ~1 hour (high impact!)  
**Total for all:** ~4 hours (professional polish!)

---

## 🚀 Implementation Order

### Tonight (High Priority):
1. ✅ Smart filename preview (30 min)
2. ✅ New file in sidebar (15 min)
3. ✅ Folder→File state management (20 min)

**Result:** Much better UX in ~1 hour!

### Tomorrow (Medium Priority):
4. ⏳ Multi-window support (2 hours)
5. ⏳ CLI arguments (1 hour)

**Result:** Professional-grade features!

---

## 🎨 Design Mockups

### Sidebar with New File:
```
Sidebar
├─ 📄 My Project Plan *    ← Active, unsaved (*)
└─ (empty)
```

### Sidebar with Smart Preview:
```
User types: "# Meeting Notes"
Sidebar updates live:
├─ 📄 Meeting Notes *
```

### Folder Switch Dialog:
```
╔══════════════════════════════════╗
║  Open New Folder?                ║
╠══════════════════════════════════╣
║                                  ║
║  You already have "ProjectA"     ║
║  open. How would you like to     ║
║  proceed?                        ║
║                                  ║
║  ┌────────────────────────────┐ ║
║  │ 🪟 Open in New Window      │ ║
║  │    Keep both folders open  │ ║
║  └────────────────────────────┘ ║
║                                  ║
║  ┌────────────────────────────┐ ║
║  │ 🔄 Replace This Folder     │ ║
║  │    Close current folder    │ ║
║  └────────────────────────────┘ ║
║                                  ║
║  [Cancel]                        ║
╚══════════════════════════════════╝
```

---

## 💬 User Feedback We Expect

### Before Implementation:
> "Why is the folder list still showing when I open a file?"  
> "Where's my new file in the sidebar?"  
> "Can I have two Docura windows open?"  
> "How do I open a file from terminal?"

### After Implementation:
> "Wow! The sidebar is so smart!"  
> "It shows my document title even before I save!"  
> "I can have multiple windows! Just like VS Code!"  
> "I just type 'docura .' in terminal and it works!"

---

## 🏆 The Result

### Docura will be:
- ✅ Smarter (live filename preview)
- ✅ Clearer (better state management)
- ✅ More powerful (multi-window)
- ✅ More professional (CLI support)
- ✅ More like "the big apps" (VS Code, Sublime)

### But still:
- ✅ Lightweight (2.4 MB!)
- ✅ Fast (Rust + Tauri)
- ✅ Beautiful (modern UI)
- ✅ Open source (MIT license)

---

## 🎉 Quote of the Evening

> "It becomes a better carpet!"

**Exactly!** 🧵✨

Each feature we add:
- Adds character
- Adds value
- Adds polish
- Makes users happier

**This is the ghormeh sabzi principle!**  
**This is the Persian carpet principle!**  
**This is SOFTWARE CRAFTSMANSHIP!** 💎

---

## 📝 Checklist for Tonight

- [ ] Implement smart filename preview
- [ ] Add new file to sidebar
- [ ] Fix folder→file state management
- [ ] Test all scenarios
- [ ] Update documentation
- [ ] Celebrate! 🎉

---

**The carpet gets better with each thread we weave!** 🧵✨

**Let's implement Phase 1 tonight!** 🚀

