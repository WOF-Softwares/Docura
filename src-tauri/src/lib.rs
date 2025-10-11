use std::path::{Path, PathBuf};
use std::fs;
use std::env;
use serde::{Deserialize, Serialize};
use serde_json;
use tauri::{command, Manager};

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
    files.sort_by(|a, b| {
        match (a.file_type.as_str(), b.file_type.as_str()) {
            ("folder", "file") => std::cmp::Ordering::Less,
            ("file", "folder") => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
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
    contents.sort_by(|a, b| {
        match (a.file_type.as_str(), b.file_type.as_str()) {
            ("folder", "file") => std::cmp::Ordering::Less,
            ("file", "folder") => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });
    
    Ok(contents)
}

#[command]
async fn export_to_pdf(_content: String, filename: String) -> Result<String, String> {
    // For now, return a placeholder message
    // In a real implementation, you would use a library like wkhtmltopdf or headless Chrome
    log::info!("Export to PDF requested for: {}", filename);
    Ok("PDF export feature coming soon!".to_string())
}

#[command]
async fn print_document(_content: String) -> Result<String, String> {
    // For now, return a placeholder message
    // In a real implementation, you would integrate with the system print dialog
    log::info!("Print document requested");
    Ok("Print feature coming soon!".to_string())
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    theme: String,
    #[serde(default)]
    recent_files: Vec<String>,
}

impl Default for AppConfig {
    fn default() -> Self {
        AppConfig {
            theme: "dracula-dark".to_string(),
            recent_files: Vec::new(),
        }
    }
}

fn get_config_dir() -> Result<PathBuf, String> {
    let home_dir = std::env::var("HOME")
        .map_err(|_| "Could not find HOME directory".to_string())?;
    
    let config_dir = PathBuf::from(home_dir)
        .join(".local")
        .join("share")
        .join("dacura");
    
    // Create directory if it doesn't exist
    if !config_dir.exists() {
        fs::create_dir_all(&config_dir)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }
    
    Ok(config_dir)
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
    
    let config: AppConfig = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse config: {}", e))?;
    
    Ok(config)
}

#[command]
async fn save_config(config: AppConfig) -> Result<(), String> {
    let config_dir = get_config_dir()?;
    let config_file = config_dir.join("config.json");
    
    let json = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;
    
    fs::write(&config_file, json)
        .map_err(|e| format!("Failed to write config file: {}", e))?;
    
    log::info!("Config saved successfully");
    Ok(())
}

/// Detects if running in a tiling window manager
fn detect_tiling_wm() -> bool {
    // List of known tiling window managers
    let tiling_wms = [
        "i3", "sway", "bspwm", "dwm", "xmonad", "awesome", 
        "qtile", "herbstluftwm", "spectrwm", "leftwm", 
        "river", "hyprland", "wmii", "ratpoison"
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
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
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_folder_files,
            export_to_pdf,
            print_document,
            load_config,
            save_config,
            is_tiling_wm
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
