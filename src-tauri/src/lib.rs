use std::path::Path;
use serde::{Deserialize, Serialize};
use tauri::command;
use walkdir::WalkDir;

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
async fn export_to_pdf(content: String, filename: String) -> Result<String, String> {
    // For now, return a placeholder message
    // In a real implementation, you would use a library like wkhtmltopdf or headless Chrome
    log::info!("Export to PDF requested for: {}", filename);
    Ok("PDF export feature coming soon!".to_string())
}

#[command]
async fn print_document(content: String) -> Result<String, String> {
    // For now, return a placeholder message
    // In a real implementation, you would integrate with the system print dialog
    log::info!("Print document requested");
    Ok("Print feature coming soon!".to_string())
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
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_folder_files,
            export_to_pdf,
            print_document
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
