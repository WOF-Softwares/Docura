use serde::{Deserialize, Serialize};
use serde_json;
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use tauri::{command, Emitter, Manager};
use tauri_plugin_fs::FsExt;

// KDE Plasma theme sync module
mod plasma_sync;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileItem {
    name: String,
    path: String,
    #[serde(rename = "type")]
    file_type: String,
    children: Option<Vec<FileItem>>,
}

#[command]
async fn get_folder_files(folder_path: String) -> Result<Vec<FileItem>, String> {
    let path = Path::new(&folder_path);

    if !path.exists() {
        return Err("Folder does not exist".to_string());
    }

    if !path.is_dir() {
        return Err("Path is not a directory".to_string());
    }

    let mut files = Vec::new();

    // Read directory entries
    match std::fs::read_dir(path) {
        Ok(entries) => {
            for entry in entries {
                match entry {
                    Ok(entry) => {
                        let file_path = entry.path();
                        let file_name = file_path
                            .file_name()
                            .and_then(|n| n.to_str())
                            .unwrap_or("Unknown")
                            .to_string();

                        // Skip hidden files
                        if file_name.starts_with('.') {
                            continue;
                        }

                        let file_path_str = file_path.to_string_lossy().to_string();

                        if file_path.is_dir() {
                            // For directories, recursively get children
                            let children = get_directory_contents(&file_path)?;
                            files.push(FileItem {
                                name: file_name,
                                path: file_path_str,
                                file_type: "folder".to_string(),
                                children: Some(children),
                            });
                        } else {
                            files.push(FileItem {
                                name: file_name,
                                path: file_path_str,
                                file_type: "file".to_string(),
                                children: None,
                            });
                        }
                    }
                    Err(e) => {
                        log::warn!("Error reading directory entry: {}", e);
                    }
                }
            }
        }
        Err(e) => {
            return Err(format!("Error reading directory: {}", e));
        }
    }

    // Sort files: directories first, then files, both alphabetically
    files.sort_by(|a, b| match (a.file_type.as_str(), b.file_type.as_str()) {
        ("folder", "file") => std::cmp::Ordering::Less,
        ("file", "folder") => std::cmp::Ordering::Greater,
        _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
    });

    Ok(files)
}

fn get_directory_contents(dir_path: &Path) -> Result<Vec<FileItem>, String> {
    let mut contents = Vec::new();

    match std::fs::read_dir(dir_path) {
        Ok(entries) => {
            for entry in entries {
                match entry {
                    Ok(entry) => {
                        let file_path = entry.path();
                        let file_name = file_path
                            .file_name()
                            .and_then(|n| n.to_str())
                            .unwrap_or("Unknown")
                            .to_string();

                        // Skip hidden files
                        if file_name.starts_with('.') {
                            continue;
                        }

                        let file_path_str = file_path.to_string_lossy().to_string();

                        if file_path.is_dir() {
                            let children = get_directory_contents(&file_path)?;
                            contents.push(FileItem {
                                name: file_name,
                                path: file_path_str,
                                file_type: "folder".to_string(),
                                children: Some(children),
                            });
                        } else {
                            contents.push(FileItem {
                                name: file_name,
                                path: file_path_str,
                                file_type: "file".to_string(),
                                children: None,
                            });
                        }
                    }
                    Err(e) => {
                        log::warn!("Error reading directory entry: {}", e);
                    }
                }
            }
        }
        Err(_) => {
            // Ignore errors for subdirectories we can't read
        }
    }

    // Sort contents
    contents.sort_by(|a, b| match (a.file_type.as_str(), b.file_type.as_str()) {
        ("folder", "file") => std::cmp::Ordering::Less,
        ("file", "folder") => std::cmp::Ordering::Greater,
        _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
    });

    Ok(contents)
}

#[command]
async fn read_file_content(file_path: String) -> Result<String, String> {
    let path = Path::new(&file_path);

    if !path.exists() {
        return Err("File does not exist".to_string());
    }

    if !path.is_file() {
        return Err("Path is not a file".to_string());
    }

    // Only read text files (markdown, txt, etc.)
    if let Some(extension) = path.extension() {
        let ext = extension.to_string_lossy().to_lowercase();
        let allowed_extensions = ["md", "markdown", "txt", "mdown", "mkdn", "mdx"];

        if !allowed_extensions.contains(&ext.as_str()) {
            return Err("File type not supported for content search".to_string());
        }
    }

    match fs::read_to_string(path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("Failed to read file: {}", e)),
    }
}

#[command]
async fn export_to_pdf(_content: String, filename: String) -> Result<String, String> {
    // For now, return a placeholder message
    // In a real implementation, you would use a library like wkhtmltopdf or headless Chrome
    log::info!("Export to PDF requested for: {}", filename);
    Ok("PDF export feature coming soon!".to_string())
}

#[tauri::command]
async fn export_to_html(content: String, filename: String) -> Result<String, String> {
    use std::fs;

    let html_content = format!(
        r#"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }}
        h1, h2, h3, h4, h5, h6 {{ color: #333; }}
        pre {{ background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; }}
        code {{ background: #f4f4f4; padding: 2px 4px; border-radius: 2px; }}
        blockquote {{ border-left: 4px solid #ddd; margin-left: 0; padding-left: 20px; color: #666; }}
    </style>
</head>
<body>
{}
</body>
</html>"#,
        filename.replace(".html", ""),
        content
    );

    match fs::write(&filename, html_content) {
        Ok(_) => {
            log::info!("HTML exported successfully to: {}", filename);
            Ok(format!("HTML exported to {}", filename))
        }
        Err(e) => {
            log::error!("Failed to export HTML: {}", e);
            Err(format!("Failed to export HTML: {}", e))
        }
    }
}

#[tauri::command]
async fn export_to_html_plain(content: String, filename: String) -> Result<String, String> {
    use std::fs;

    let html_content = format!(
        r#"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{}</title>
</head>
<body>
{}
</body>
</html>"#,
        filename.replace(".html", ""),
        content
    );

    match fs::write(&filename, html_content) {
        Ok(_) => {
            log::info!("Plain HTML exported successfully to: {}", filename);
            Ok(format!("Plain HTML exported to {}", filename))
        }
        Err(e) => {
            log::error!("Failed to export plain HTML: {}", e);
            Err(format!("Failed to export plain HTML: {}", e))
        }
    }
}

#[tauri::command]
async fn export_to_html_tailwind(content: String, filename: String) -> Result<String, String> {
    use std::fs;

    let html_content = format!(
        r#"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 text-gray-900">
    <div class="max-w-4xl mx-auto px-6 py-8">
        <div class="prose prose-gray max-w-none">
            {}
        </div>
    </div>
</body>
</html>"#,
        filename.replace(".html", ""),
        content
    );

    match fs::write(&filename, html_content) {
        Ok(_) => {
            log::info!("HTML with Tailwind exported successfully to: {}", filename);
            Ok(format!("HTML with Tailwind CSS exported to {}", filename))
        }
        Err(e) => {
            log::error!("Failed to export HTML with Tailwind: {}", e);
            Err(format!("Failed to export HTML with Tailwind: {}", e))
        }
    }
}

#[tauri::command]
async fn export_to_html_bootstrap(content: String, filename: String) -> Result<String, String> {
    use std::fs;

    let html_content = format!(
        r#"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container my-5">
        <div class="row justify-content-center">
            <div class="col-lg-8">
                {}
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>"#,
        filename.replace(".html", ""),
        content
    );

    match fs::write(&filename, html_content) {
        Ok(_) => {
            log::info!("HTML with Bootstrap exported successfully to: {}", filename);
            Ok(format!("HTML with Bootstrap exported to {}", filename))
        }
        Err(e) => {
            log::error!("Failed to export HTML with Bootstrap: {}", e);
            Err(format!("Failed to export HTML with Bootstrap: {}", e))
        }
    }
}

#[tauri::command]
async fn export_to_json(content: String, filename: String) -> Result<String, String> {
    use serde_json::json;
    use std::fs;

    let json_data = json!({
        "title": filename.replace(".json", ""),
        "content": content,
        "exported_at": chrono::Utc::now().to_rfc3339(),
        "format": "markdown"
    });

    match fs::write(&filename, serde_json::to_string_pretty(&json_data).unwrap()) {
        Ok(_) => {
            log::info!("JSON exported successfully to: {}", filename);
            Ok(format!("JSON exported to {}", filename))
        }
        Err(e) => {
            log::error!("Failed to export JSON: {}", e);
            Err(format!("Failed to export JSON: {}", e))
        }
    }
}

#[tauri::command]
async fn export_to_rtf(content: String, filename: String) -> Result<String, String> {
    use std::fs;

    // Convert basic Markdown to RTF
    let rtf_content = content
        .replace("**", "\\b ")
        .replace("*", "\\i ")
        .replace("#", "\\fs28\\b ")
        .replace("\n", "\\par\n");

    let rtf_document = format!(
        r#"{{\rtf1\ansi\deff0 {{\fonttbl {{\f0 Times New Roman;}}}}
\f0\fs24 {}
}}"#,
        rtf_content
    );

    match fs::write(&filename, rtf_document) {
        Ok(_) => {
            log::info!("RTF exported successfully to: {}", filename);
            Ok(format!("RTF exported to {}", filename))
        }
        Err(e) => {
            log::error!("Failed to export RTF: {}", e);
            Err(format!("Failed to export RTF: {}", e))
        }
    }
}

#[tauri::command]
async fn export_to_mediawiki(content: String, filename: String) -> Result<String, String> {
    use std::fs;

    // Convert Markdown to MediaWiki format
    let mediawiki_content = content
        .replace("# ", "= ")
        .replace("## ", "== ")
        .replace("### ", "=== ")
        .replace("#### ", "==== ")
        .replace("##### ", "===== ")
        .replace("###### ", "====== ")
        .replace("**", "'''")
        .replace("*", "''")
        .replace("[", "[[")
        .replace("](", "|")
        .replace(")", "]]");

    match fs::write(&filename, mediawiki_content) {
        Ok(_) => {
            log::info!("MediaWiki exported successfully to: {}", filename);
            Ok(format!("MediaWiki format exported to {}", filename))
        }
        Err(e) => {
            log::error!("Failed to export MediaWiki: {}", e);
            Err(format!("Failed to export MediaWiki: {}", e))
        }
    }
}

#[command]
async fn print_document(_content: String) -> Result<String, String> {
    // For now, return a placeholder message
    // In a real implementation, you would integrate with the system print dialog
    log::info!("Print document requested");
    Ok("Print feature coming soon!".to_string())
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RecentItem {
    path: String,
    #[serde(rename = "type")]
    item_type: String, // "file" or "folder"
    name: String,
    timestamp: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TempFile {
    id: String,
    content: String,
    timestamp: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    theme: String,
    #[serde(default)]
    recent_items: Vec<RecentItem>,
    #[serde(default)]
    omakase_sync: bool,
    #[serde(default)]
    plasma_sync: bool,
    #[serde(default)]
    auto_save: bool,
    #[serde(default = "default_live_editor_type")]
    live_editor_type: String,
}

fn default_live_editor_type() -> String {
    "modern".to_string()
}

impl Default for AppConfig {
    fn default() -> Self {
        AppConfig {
            theme: "dracula-dark".to_string(),
            recent_items: Vec::new(),
            omakase_sync: false,
            plasma_sync: false,
            auto_save: true, // Default to enabled
            live_editor_type: "modern".to_string(),
        }
    }
}

fn get_config_dir() -> Result<PathBuf, String> {
    let home_dir =
        std::env::var("HOME").map_err(|_| "Could not find HOME directory".to_string())?;

    let config_dir = PathBuf::from(home_dir)
        .join(".local")
        .join("share")
        .join("docura");

    // Create directory if it doesn't exist
    if !config_dir.exists() {
        fs::create_dir_all(&config_dir)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }

    Ok(config_dir)
}

fn get_temp_dir() -> Result<PathBuf, String> {
    let config_dir = get_config_dir()?;
    let temp_dir = config_dir.join("temp");

    // Create temp directory if it doesn't exist
    if !temp_dir.exists() {
        fs::create_dir_all(&temp_dir)
            .map_err(|e| format!("Failed to create temp directory: {}", e))?;
    }

    Ok(temp_dir)
}

#[command]
async fn load_config() -> Result<AppConfig, String> {
    let config_dir = get_config_dir()?;
    let config_file = config_dir.join("config.json");

    if !config_file.exists() {
        // Return default config if file doesn't exist
        return Ok(AppConfig::default());
    }

    let content = fs::read_to_string(&config_file)
        .map_err(|e| format!("Failed to read config file: {}", e))?;

    let config: AppConfig =
        serde_json::from_str(&content).map_err(|e| format!("Failed to parse config: {}", e))?;

    Ok(config)
}

#[command]
async fn save_config(config: AppConfig) -> Result<(), String> {
    let config_dir = get_config_dir()?;
    let config_file = config_dir.join("config.json");

    let json = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;

    fs::write(&config_file, json).map_err(|e| format!("Failed to write config file: {}", e))?;

    log::info!("Config saved successfully");
    Ok(())
}

#[command]
async fn add_recent_item(path: String, item_type: String) -> Result<(), String> {
    let mut config = load_config().await?;

    // Get name from path
    let path_obj = Path::new(&path);
    let name = path_obj
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("Unknown")
        .to_string();

    // Get current timestamp
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);

    // Remove existing entry with same path if exists
    config.recent_items.retain(|item| item.path != path);

    // Add new item at the beginning
    config.recent_items.insert(
        0,
        RecentItem {
            path: path.clone(),
            item_type,
            name,
            timestamp,
        },
    );

    // Keep only last 15 items
    if config.recent_items.len() > 15 {
        config.recent_items.truncate(15);
    }

    save_config(config).await?;
    log::info!("Added recent item: {}", path);
    Ok(())
}

#[command]
async fn get_recent_items() -> Result<Vec<RecentItem>, String> {
    let config = load_config().await?;
    Ok(config.recent_items)
}

#[command]
async fn clear_recent_items() -> Result<(), String> {
    let mut config = load_config().await?;
    config.recent_items.clear();
    save_config(config).await?;
    log::info!("Cleared recent items");
    Ok(())
}

/// Detects if running in a tiling window manager
fn detect_tiling_wm() -> bool {
    // List of known tiling window managers
    let tiling_wms = [
        "i3",
        "sway",
        "bspwm",
        "dwm",
        "xmonad",
        "awesome",
        "qtile",
        "herbstluftwm",
        "spectrwm",
        "leftwm",
        "river",
        "hyprland",
        "wmii",
        "ratpoison",
    ];

    // Check XDG_CURRENT_DESKTOP
    if let Ok(desktop) = env::var("XDG_CURRENT_DESKTOP") {
        let desktop_lower = desktop.to_lowercase();
        for wm in &tiling_wms {
            if desktop_lower.contains(wm) {
                log::info!("Detected tiling WM via XDG_CURRENT_DESKTOP: {}", desktop);
                return true;
            }
        }
    }

    // Check XDG_SESSION_DESKTOP
    if let Ok(session) = env::var("XDG_SESSION_DESKTOP") {
        let session_lower = session.to_lowercase();
        for wm in &tiling_wms {
            if session_lower.contains(wm) {
                log::info!("Detected tiling WM via XDG_SESSION_DESKTOP: {}", session);
                return true;
            }
        }
    }

    // Check DESKTOP_SESSION (fallback for older systems)
    if let Ok(session) = env::var("DESKTOP_SESSION") {
        let session_lower = session.to_lowercase();
        for wm in &tiling_wms {
            if session_lower.contains(wm) {
                log::info!("Detected tiling WM via DESKTOP_SESSION: {}", session);
                return true;
            }
        }
    }

    false
}

#[command]
async fn is_tiling_wm() -> bool {
    detect_tiling_wm()
}

/// Check if Omakase/Omarchy commands are available
#[command]
async fn check_omakase_command() -> bool {
    use std::process::Command;

    // Check for omarchy-theme-current first (with 'r')
    let omarchy_whereis = Command::new("whereis")
        .arg("omarchy-theme-current")
        .output()
        .map(|output| {
            let stdout = String::from_utf8_lossy(&output.stdout);
            // whereis returns "command:" if not found, "command: /path/to/command" if found
            stdout.contains("/")
        })
        .unwrap_or(false);

    if omarchy_whereis {
        log::info!("✅ Omarchy detected via whereis (omarchy-theme-current)");
        return true;
    }

    // Check for omakase-theme-current (without 'r')
    let omakase_whereis = Command::new("whereis")
        .arg("omakase-theme-current")
        .output()
        .map(|output| {
            let stdout = String::from_utf8_lossy(&output.stdout);
            stdout.contains("/")
        })
        .unwrap_or(false);

    if omakase_whereis {
        log::info!("✅ Omakase detected via whereis (omakase-theme-current)");
        return true;
    }

    // Fallback: try which for omarchy
    let omarchy_which = Command::new("which")
        .arg("omarchy-theme-current")
        .output()
        .map(|output| output.status.success())
        .unwrap_or(false);

    if omarchy_which {
        log::info!("✅ Omarchy detected via which");
        return true;
    }

    // Fallback: try which for omakase
    let omakase_which = Command::new("which")
        .arg("omakase-theme-current")
        .output()
        .map(|output| output.status.success())
        .unwrap_or(false);

    if omakase_which {
        log::info!("✅ Omakase detected via which");
        return true;
    }

    log::info!("❌ Neither Omarchy nor Omakase detected");
    false
}

/// Get current Omakase/Omarchy theme
#[command]
async fn get_omakase_theme() -> Result<String, String> {
    use std::process::Command;

    // Try omarchy-theme-current first (with 'r')
    match Command::new("omarchy-theme-current").output() {
        Ok(output) => {
            if output.status.success() {
                let theme = String::from_utf8_lossy(&output.stdout).to_string();
                let theme_name = theme.trim().to_lowercase();
                log::info!("🎨 Got Omarchy theme: {}", theme_name);
                return Ok(theme_name);
            }
        }
        Err(_) => {
            log::debug!("omarchy-theme-current not found, trying omakase variant...");
        }
    }

    // Try omakase-theme-current (without 'r')
    match Command::new("omakase-theme-current").output() {
        Ok(output) => {
            if output.status.success() {
                let theme = String::from_utf8_lossy(&output.stdout).to_string();
                let theme_name = theme.trim().to_lowercase();
                log::info!("🎨 Got Omakase theme: {}", theme_name);
                return Ok(theme_name);
            }
        }
        Err(_) => {
            log::warn!("Neither omarchy-theme-current nor omakase-theme-current found");
        }
    }

    Err("Failed to get theme from Omarchy/Omakase".to_string())
}

/// Get current Omakase/Omarchy font
#[command]
async fn get_omakase_font() -> Result<String, String> {
    use std::process::Command;

    // Try omarchy-font-current first (with 'r')
    match Command::new("omarchy-font-current").output() {
        Ok(output) => {
            if output.status.success() {
                let font = String::from_utf8_lossy(&output.stdout).to_string();
                let font_name = font.trim().to_string();
                log::info!("🔤 Got Omarchy font: {}", font_name);
                return Ok(font_name);
            }
        }
        Err(_) => {
            log::debug!("omarchy-font-current not found, trying omakase variant...");
        }
    }

    // Try omakase-font-current (without 'r')
    match Command::new("omakase-font-current").output() {
        Ok(output) => {
            if output.status.success() {
                let font = String::from_utf8_lossy(&output.stdout).to_string();
                let font_name = font.trim().to_string();
                log::info!("🔤 Got Omakase font: {}", font_name);
                return Ok(font_name);
            }
        }
        Err(_) => {
            log::warn!("Neither omarchy-font-current nor omakase-font-current found");
        }
    }

    Err("Failed to get font from Omarchy/Omakase".to_string())
}

#[command]
async fn grant_file_scope(app: tauri::AppHandle, file_path: String) -> Result<(), String> {
    // Parse the file path
    let path = Path::new(&file_path);

    // Get the parent directory
    let dir_path = if path.is_dir() {
        path
    } else {
        path.parent().ok_or("Could not get parent directory")?
    };

    // Grant recursive read access to the directory
    let scope = app.fs_scope();
    scope
        .allow_directory(dir_path, true)
        .map_err(|e| format!("Failed to grant directory scope: {}", e))?;

    log::info!("Granted file system scope for: {:?}", dir_path);
    Ok(())
}

#[command]
async fn open_new_window(app: tauri::AppHandle, folder_path: Option<String>) -> Result<(), String> {
    // Generate unique window label
    let window_label = format!(
        "docura-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis()
    );

    // Detect tiling WM
    let is_tiling = detect_tiling_wm();

    // Create new window with appropriate decorations
    let _new_window = tauri::WebviewWindowBuilder::new(
        &app,
        &window_label,
        tauri::WebviewUrl::App("index.html".into()),
    )
    .title("Docura")
    .inner_size(1200.0, 800.0)
    .decorations(!is_tiling) // Hide decorations in tiling WM
    .build()
    .map_err(|e| e.to_string())?;

    log::info!(
        "New window created: {} (tiling WM: {})",
        window_label,
        is_tiling
    );

    // If folder_path provided, emit event to open it
    if let Some(path) = folder_path {
        // Wait for window to load and set up listeners
        log::info!("Waiting for new window to initialize...");
        tokio::time::sleep(tokio::time::Duration::from_millis(2000)).await;
        log::info!(
            "Emitting cli-open-folder event to new window: {}",
            window_label
        );

        // Use emit_to to send event to specific window only
        app.emit_to(&window_label, "cli-open-folder", path)
            .map_err(|e| e.to_string())?;
        log::info!("Event emitted successfully to window: {}", window_label);
    }

    Ok(())
}

// Temp file management commands
#[command]
async fn save_temp_file(content: String, temp_id: Option<String>) -> Result<String, String> {
    let temp_dir = get_temp_dir()?;

    // Use existing ID or generate new one
    let id = temp_id.unwrap_or_else(|| {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis()
            .to_string()
    });

    let temp_file_path = temp_dir.join(format!("temp-{}.md", id));

    fs::write(&temp_file_path, content).map_err(|e| format!("Failed to save temp file: {}", e))?;

    log::info!("Saved temp file: {:?}", temp_file_path);
    Ok(id)
}

#[command]
async fn load_temp_files() -> Result<Vec<TempFile>, String> {
    let temp_dir = get_temp_dir()?;
    let mut temp_files = Vec::new();

    if !temp_dir.exists() {
        return Ok(temp_files);
    }

    let entries =
        fs::read_dir(&temp_dir).map_err(|e| format!("Failed to read temp directory: {}", e))?;

    for entry in entries {
        if let Ok(entry) = entry {
            let path = entry.path();
            if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("md") {
                if let Some(file_name) = path.file_stem().and_then(|s| s.to_str()) {
                    // Extract ID from filename (temp-{id}.md)
                    if let Some(id) = file_name.strip_prefix("temp-") {
                        let content = fs::read_to_string(&path).unwrap_or_default();

                        let metadata = fs::metadata(&path).ok();
                        let timestamp = metadata
                            .and_then(|m| m.modified().ok())
                            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                            .map(|d| d.as_secs() as i64)
                            .unwrap_or(0);

                        temp_files.push(TempFile {
                            id: id.to_string(),
                            content,
                            timestamp,
                        });
                    }
                }
            }
        }
    }

    // Sort by timestamp (newest first)
    temp_files.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

    log::info!("Loaded {} temp files", temp_files.len());
    Ok(temp_files)
}

#[command]
async fn delete_temp_file(temp_id: String) -> Result<(), String> {
    let temp_dir = get_temp_dir()?;
    let temp_file_path = temp_dir.join(format!("temp-{}.md", temp_id));

    if temp_file_path.exists() {
        fs::remove_file(&temp_file_path)
            .map_err(|e| format!("Failed to delete temp file: {}", e))?;
        log::info!("Deleted temp file: {:?}", temp_file_path);
    }

    Ok(())
}

#[command]
async fn clear_all_temp_files() -> Result<(), String> {
    let temp_dir = get_temp_dir()?;

    if temp_dir.exists() {
        fs::remove_dir_all(&temp_dir)
            .map_err(|e| format!("Failed to clear temp directory: {}", e))?;
        // Recreate the directory
        fs::create_dir(&temp_dir)
            .map_err(|e| format!("Failed to recreate temp directory: {}", e))?;
        log::info!("Cleared all temp files");
    }

    Ok(())
}

#[command]
async fn save_clipboard_image(
    file_path: String,
    image_data: String, // Base64 encoded image data
    image_name: String,
) -> Result<String, String> {
    use base64::{engine::general_purpose, Engine as _};

    // Get the directory of the markdown file
    let file_path_obj = Path::new(&file_path);
    let dir = file_path_obj
        .parent()
        .ok_or("Could not get parent directory")?;

    // Create assets folder next to the markdown file
    let assets_dir = dir.join("assets");
    if !assets_dir.exists() {
        fs::create_dir_all(&assets_dir)
            .map_err(|e| format!("Failed to create assets directory: {}", e))?;
    }

    // Generate unique filename if file already exists
    let mut final_name = image_name.clone();
    let mut counter = 1;
    let name_without_ext = image_name
        .rsplit_once('.')
        .map(|(n, _)| n)
        .unwrap_or(&image_name);
    let ext = image_name.rsplit_once('.').map(|(_, e)| e).unwrap_or("png");

    while assets_dir.join(&final_name).exists() {
        final_name = format!("{}-{}.{}", name_without_ext, counter, ext);
        counter += 1;
    }

    let image_path = assets_dir.join(&final_name);

    // Decode base64 image data
    let image_bytes = general_purpose::STANDARD
        .decode(image_data)
        .map_err(|e| format!("Failed to decode image data: {}", e))?;

    // Save image to disk
    fs::write(&image_path, image_bytes).map_err(|e| format!("Failed to save image: {}", e))?;

    log::info!("Saved clipboard image to: {:?}", image_path);

    // Return relative path for markdown
    Ok(format!("assets/{}", final_name))
}

#[command]
async fn quit_app(app: tauri::AppHandle) -> Result<(), String> {
    log::info!("Quit command received, exiting application");
    app.exit(0);
    Ok(())
}

#[command]
async fn get_username() -> Result<String, String> {
    use std::process::Command;

    match Command::new("whoami").output() {
        Ok(output) => {
            if output.status.success() {
                let username = String::from_utf8_lossy(&output.stdout).trim().to_string();
                Ok(username)
            } else {
                // Fallback to USER env variable
                env::var("USER")
                    .or_else(|_| env::var("USERNAME"))
                    .map_err(|_| "Could not determine username".to_string())
            }
        }
        Err(_) => {
            // Fallback to USER env variable
            env::var("USER")
                .or_else(|_| env::var("USERNAME"))
                .map_err(|_| "Could not determine username".to_string())
        }
    }
}

// ============================================
// 🎨 KDE Plasma Theme Sync Commands
// ============================================

/// Check if running under KDE Plasma
#[command]
async fn is_plasma_available() -> bool {
    plasma_sync::PlasmaThemeDetector::is_plasma_available()
}

/// Get current Plasma color scheme
#[command]
async fn get_plasma_theme() -> Result<plasma_sync::PlasmaColorScheme, String> {
    plasma_sync::PlasmaThemeDetector::detect_current_scheme()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Get CLI arguments
    let args: Vec<String> = env::args().collect();
    let cli_arg = if args.len() > 1 {
        Some(args[1].clone())
    } else {
        None
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(move |app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Configure window based on tiling WM detection
            if let Some(window) = app.get_webview_window("main") {
                let is_tiling = detect_tiling_wm();
                if is_tiling {
                    log::info!("Tiling WM detected, hiding decorations");
                    let _ = window.set_decorations(false);
                } else {
                    log::info!("Standard WM detected, showing decorations");
                    let _ = window.set_decorations(true);
                }
            }

            // Handle CLI arguments
            if let Some(arg) = cli_arg {
                let path = Path::new(&arg);

                if path.exists() {
                    if path.is_dir() {
                        // Open folder - emit only to main window
                        log::info!("CLI: Opening folder: {}", arg);
                        let _ = app.emit_to("main", "cli-open-folder", arg);
                    } else if path.is_file() {
                        // Open file - emit only to main window
                        log::info!("CLI: Opening file: {}", arg);
                        let _ = app.emit_to("main", "cli-open-file", arg);
                    }
                } else {
                    log::warn!("CLI: Path does not exist: {}", arg);
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_folder_files,
            read_file_content,
            export_to_pdf,
            export_to_html,
            export_to_html_plain,
            export_to_html_tailwind,
            export_to_html_bootstrap,
            export_to_json,
            export_to_rtf,
            export_to_mediawiki,
            print_document,
            load_config,
            save_config,
            add_recent_item,
            get_recent_items,
            clear_recent_items,
            is_tiling_wm,
            grant_file_scope,
            check_omakase_command,
            get_omakase_theme,
            get_omakase_font,
            open_new_window,
            save_clipboard_image,
            save_temp_file,
            load_temp_files,
            delete_temp_file,
            clear_all_temp_files,
            quit_app,
            get_username,
            // Plasma theme sync
            is_plasma_available,
            get_plasma_theme
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
