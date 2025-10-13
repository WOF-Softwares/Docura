# Fixing the CLI Timing Race Condition Bug: A Real-World Debugging Journey

*October 14, 2025 • 12 min read*

Sometimes the most educational bugs are the ones that work perfectly in your head but fail mysteriously in reality. Today, I want to share the story of a CLI bug in Docura that taught us valuable lessons about timing, event systems, and the subtle complexities of modern app architectures.

## The Problem: "It Should Work, But It Doesn't"

Users reported that Docura's CLI functionality wasn't working. Commands like:
- `docura file.md` (open a specific file)
- `docura ./documents` (open a folder) 
- `docura .` (open current directory)

Should have opened the files/folders automatically, but instead, the app would just start with a blank welcome screen.

The frustrating part? The code looked absolutely correct.

## The Original Implementation: Event-Driven Architecture

Here's how we initially implemented the CLI functionality:

### Backend (Rust/Tauri)
```rust
pub fn run() {
    // Get CLI arguments
    let args: Vec<String> = env::args().collect();
    let cli_arg = if args.len() > 1 {
        Some(args[1].clone())
    } else {
        None
    };

    tauri::Builder::default()
        .setup(move |app| {
            // Handle CLI arguments
            if let Some(arg) = cli_arg {
                let path = Path::new(&arg);

                if path.exists() {
                    if path.is_dir() {
                        log::info!("CLI: Opening folder: {}", arg);
                        let _ = app.emit_to("main", "cli-open-folder", arg);
                    } else if path.is_file() {
                        log::info!("CLI: Opening file: {}", arg);
                        let _ = app.emit_to("main", "cli-open-file", arg);
                    }
                }
            }
            Ok(())
        })
        // ... rest of setup
}
```

### Frontend (React/JavaScript)
```javascript
useEffect(() => {
    const currentWindow = getCurrentWindow();
    
    // Listen for CLI events
    currentWindow.listen("cli-open-file", async (event) => {
        const filePath = event.payload;
        console.log("📄 CLI: Opening file:", filePath);
        
        // Open the file...
        const content = await readTextFile(filePath);
        setCurrentFile(filePath);
        setFileContent(content);
        // ... etc
    });

    currentWindow.listen("cli-open-folder", async (event) => {
        const folderPath = event.payload;
        console.log("📁 CLI: Opening folder:", folderPath);
        
        // Open the folder...
        const folderFiles = await invoke("get_folder_files", { folderPath });
        setCurrentFolder(folderPath);
        setFiles(folderFiles);
        // ... etc
    });
}, []);
```

## The Debugging Process: When Logs Tell the Truth

When we ran `RUST_LOG=info ./docura ./test.md`, we could see the backend logs:

```
[2025-10-13][23:27:07] CLI: Opening file: ./test.md
```

The backend was correctly detecting the CLI argument and emitting the event. But the frontend never received it.

This led us to the crucial realization: **it was a timing issue.**

## The Root Cause: Race Condition in App Initialization

The problem was subtle but fundamental:

1. **Backend Setup Phase**: Tauri runs the `setup` function immediately during app initialization
2. **CLI Event Emission**: Events were being emitted during this early setup phase  
3. **Frontend Loading**: The React app needed time to:
   - Load and parse JavaScript bundles
   - Mount React components
   - Execute the `useEffect` that registers event listeners
4. **The Race**: Events were being emitted before the frontend was ready to listen

In essence, we were broadcasting to an empty room.

## The Solution: Pull Instead of Push

Instead of pushing events from backend to frontend, we implemented a pull-based approach where the frontend requests CLI arguments when it's ready:

### New Backend Implementation
```rust
#[command]
async fn get_cli_args() -> Result<Option<String>, String> {
    let args: Vec<String> = env::args().collect();
    if args.len() > 1 {
        let arg = &args[1];
        let path = Path::new(arg);

        if path.exists() {
            Ok(Some(arg.clone()))
        } else {
            log::warn!("CLI: Path does not exist: {}", arg);
            Ok(None)
        }
    } else {
        Ok(None)
    }
}

pub fn run() {
    tauri::Builder::default()
        .setup(move |app| {
            // Removed CLI event emission from setup
            // Now handled by frontend request
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // ... other handlers
            get_cli_args  // Added new command
        ])
}
```

### New Frontend Implementation
```javascript
useEffect(() => {
    const checkCliArgs = async () => {
        try {
            console.log("🎧 Checking for CLI arguments...");
            const cliArg = await invoke("get_cli_args");

            if (cliArg) {
                console.log("📄 CLI: Found argument:", cliArg);
                const path = cliArg;

                // Grant file scope first
                await invoke("grant_file_scope", { filePath: path });

                // Try to open as folder first
                try {
                    const folderFiles = await invoke("get_folder_files", {
                        folderPath: path,
                    });
                    console.log("📁 CLI: Opening folder:", path);
                    
                    setCurrentFolder(path);
                    setFiles(folderFiles);
                    toast.success(`Opened folder: ${path.split("/").pop()}`);
                } catch (folderError) {
                    // Not a folder, try as file
                    console.log("📄 CLI: Opening file:", path);
                    const content = await readTextFile(path);
                    setCurrentFile(path);
                    setFileContent(content);
                    setOriginalContent(content);
                    setIsEditing(true);
                    extractHeaders(content);
                    setCurrentFolder(null);
                    const fileName = path.split("/").pop();
                    setFiles([{ name: fileName, path: path, type: "file" }]);
                    setActiveTab("code");
                    toast.success(`Opened: ${fileName}`);
                }
            } else {
                console.log("📄 CLI: No arguments found");
            }
        } catch (error) {
            console.error("Error checking CLI args:", error);
        }
    };

    checkCliArgs();
}, []);
```

## Key Improvements in the New Approach

### 1. **Timing Control**
The frontend now controls when to check for CLI arguments, ensuring it only happens after React has mounted and is ready to handle the results.

### 2. **Simplified Logic**
Instead of separate events for files vs folders, we use a single command that returns the CLI argument, then let the frontend determine the type by trying folder operations first.

### 3. **Better Error Handling**
The new approach has more robust error handling and user feedback through console logs and toast notifications.

### 4. **No Event System Complexity**
We eliminated the need for event listeners and cleanup, reducing potential memory leaks and simplifying the codebase.

## Testing the Fix

After implementing the changes, all CLI functionality worked perfectly:

```bash
# Test file opening
./docura ./test.md
# ✅ Opens file in editor

# Test folder opening  
./docura ./documents
# ✅ Opens folder browser

# Test current directory
./docura .
# ✅ Opens current directory
```

The logs now show the proper sequence:
```
[2025-10-13][23:28:40] Tiling WM detected, hiding decorations
[2025-10-13][23:28:41] Loaded 0 temp files
🎧 Checking for CLI arguments...
📄 CLI: Found argument: ./test.md
📄 CLI: Opening file: ./test.md
✅ Opened: test.md
```

## Lessons Learned

### 1. **Timing Matters in Modern Apps**
Even though we're not dealing with network requests or heavy computations, the initialization sequence of modern apps (bundle loading, React mounting, effect execution) creates timing dependencies that must be considered.

### 2. **Pull > Push for Initialization Data**
For data needed during app startup, having the frontend request it when ready is often more reliable than pushing it from the backend during early initialization.

### 3. **Race Conditions Aren't Just About Threads**
Race conditions can occur in single-threaded environments when dealing with asynchronous initialization sequences.

### 4. **Debugging with Logs is Crucial**
The backend logs clearly showed events were being emitted, which helped us realize the issue wasn't in event emission but in event reception timing.

### 5. **Simplicity Wins**
The final solution is actually simpler than the original - no event listeners to manage, no cleanup required, and clearer control flow.

## The Broader Implications

This bug highlights a common pattern in modern desktop applications built with web technologies:

- **Backend services** start immediately and are ready quickly
- **Frontend applications** have complex initialization sequences
- **Integration points** between them need to account for these timing differences

This is particularly relevant for Tauri, Electron, and other hybrid applications where Rust/Node.js backends need to coordinate with JavaScript frontends.

## Conclusion: Small Bugs, Big Lessons

What started as a "simple CLI bug" turned into a valuable lesson about application architecture, timing, and the subtle complexities of modern development stacks.

The fix was ultimately straightforward, but getting there required:
- Careful debugging with proper logging
- Understanding the initialization sequence of both backend and frontend
- Recognizing the race condition pattern
- Choosing a simpler, more reliable architecture

For other developers building similar applications, remember: when event-driven approaches have timing issues, consider pull-based alternatives. Sometimes the best solution is the one that gives you explicit control over when things happen.

---

*This is part of our ongoing series about real-world debugging and development challenges. Follow along as we continue building Docura and sharing what we learn along the way.*

**What timing-related bugs have you encountered in your projects? Share your experiences in the comments below!**