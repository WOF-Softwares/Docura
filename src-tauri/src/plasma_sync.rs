// KDE Plasma Theme Sync Module
// Supports Plasma 5 & 6 color scheme detection

use std::path::{Path, PathBuf};
use std::fs;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlasmaColorScheme {
    pub name: String,
    pub colors: PlasmaColors,
    pub is_dark: bool,
    pub mapped_theme: String, // Mapped to Docura theme
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlasmaColors {
    pub background: String,
    pub foreground: String,
    pub selection_background: String,
    pub selection_foreground: String,
}

pub struct PlasmaThemeDetector;

impl PlasmaThemeDetector {
    pub fn new() -> Self {
        Self
    }

    /// Check if running under KDE Plasma
    pub fn is_plasma_available() -> bool {
        // Check XDG_CURRENT_DESKTOP or XDG_SESSION_DESKTOP
        if let Ok(desktop) = std::env::var("XDG_CURRENT_DESKTOP") {
            if desktop.to_lowercase().contains("kde") {
                return true;
            }
        }
        if let Ok(session) = std::env::var("XDG_SESSION_DESKTOP") {
            if session.to_lowercase().contains("plasma") || session.to_lowercase().contains("kde") {
                return true;
            }
        }
        
        // Check if kdeglobals exists
        if let Ok(home) = std::env::var("HOME") {
            let kdeglobals = PathBuf::from(home).join(".config/kdeglobals");
            return kdeglobals.exists();
        }
        
        false
    }

    /// Detect current Plasma color scheme
    pub fn detect_current_scheme() -> Result<PlasmaColorScheme, String> {
        let scheme_name = Self::get_current_scheme_name()?;
        let scheme_path = Self::find_scheme_file(&scheme_name)?;
        let colors = Self::parse_color_scheme(&scheme_path)?;
        let is_dark = Self::is_dark_theme(&colors);
        let mapped_theme = Self::map_to_docura_theme(&scheme_name, is_dark);
        
        Ok(PlasmaColorScheme {
            name: scheme_name,
            colors,
            is_dark,
            mapped_theme,
        })
    }

    /// Get current scheme name from kdeglobals
    fn get_current_scheme_name() -> Result<String, String> {
        let home = std::env::var("HOME").map_err(|_| "HOME not set".to_string())?;
        let kdeglobals = PathBuf::from(&home).join(".config/kdeglobals");
        
        if !kdeglobals.exists() {
            return Err("kdeglobals not found".to_string());
        }
        
        let content = fs::read_to_string(&kdeglobals)
            .map_err(|e| format!("Failed to read kdeglobals: {}", e))?;
        
        // Parse ColorScheme from [General] section
        let mut in_general = false;
        for line in content.lines() {
            let line = line.trim();
            
            if line.starts_with('[') {
                in_general = line == "[General]";
                continue;
            }
            
            if in_general && line.starts_with("ColorScheme=") {
                let scheme = line.strip_prefix("ColorScheme=")
                    .unwrap_or("")
                    .trim()
                    .to_string();
                if !scheme.is_empty() {
                    return Ok(scheme);
                }
            }
        }
        
        Err("ColorScheme not found in kdeglobals".to_string())
    }

    /// Find the .colors file for the scheme
    fn find_scheme_file(scheme_name: &str) -> Result<PathBuf, String> {
        let home = std::env::var("HOME").map_err(|_| "HOME not set".to_string())?;
        
        let search_paths = vec![
            // Plasma 5 user
            PathBuf::from(&home).join(".local/share/color-schemes"),
            // Plasma 5 system
            PathBuf::from("/usr/share/color-schemes"),
            // Plasma 6 user
            PathBuf::from(&home).join(".local/share/plasma/look-and-feel"),
            // Plasma 6 system
            PathBuf::from("/usr/share/plasma/look-and-feel"),
        ];
        
        let filename = format!("{}.colors", scheme_name);
        
        for search_path in search_paths.iter() {
            if !search_path.exists() {
                continue;
            }
            
            // Direct file check
            let direct_path = search_path.join(&filename);
            if direct_path.exists() {
                return Ok(direct_path);
            }
            
            // Recursive search in subdirectories (for Plasma 6 look-and-feel)
            if let Ok(entries) = fs::read_dir(search_path) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    
                    // Check if it's the file we're looking for
                    if path.file_name()
                        .and_then(|s| s.to_str())
                        .map(|s| s.eq_ignore_ascii_case(&filename))
                        .unwrap_or(false) {
                        return Ok(path);
                    }
                    
                    // Check subdirectories (Plasma 6 structure)
                    if path.is_dir() {
                        let colors_path = path.join("colors");
                        if colors_path.exists() {
                            return Ok(colors_path);
                        }
                    }
                }
            }
        }
        
        Err(format!("Color scheme file not found: {}", scheme_name))
    }

    /// Parse the .colors file
    fn parse_color_scheme(path: &Path) -> Result<PlasmaColors, String> {
        let content = fs::read_to_string(path)
            .map_err(|e| format!("Failed to read color scheme: {}", e))?;
        
        let mut colors = PlasmaColors {
            background: "#1e1e1e".to_string(),
            foreground: "#ffffff".to_string(),
            selection_background: "#6366f1".to_string(),
            selection_foreground: "#ffffff".to_string(),
        };
        
        let mut current_section = String::new();
        
        for line in content.lines() {
            let line = line.trim();
            
            if line.starts_with('[') && line.ends_with(']') {
                current_section = line[1..line.len()-1].to_string();
                continue;
            }
            
            if line.contains('=') {
                let parts: Vec<&str> = line.splitn(2, '=').collect();
                if parts.len() != 2 {
                    continue;
                }
                
                let key = parts[0].trim();
                let value = parts[1].trim();
                
                match current_section.as_str() {
                    "Colors:Window" => {
                        if key == "BackgroundNormal" {
                            colors.background = Self::parse_kde_color(value);
                        } else if key == "ForegroundNormal" {
                            colors.foreground = Self::parse_kde_color(value);
                        }
                    }
                    "Colors:Selection" => {
                        if key == "BackgroundNormal" {
                            colors.selection_background = Self::parse_kde_color(value);
                        } else if key == "ForegroundNormal" {
                            colors.selection_foreground = Self::parse_kde_color(value);
                        }
                    }
                    _ => {}
                }
            }
        }
        
        Ok(colors)
    }

    /// Parse KDE color format (R,G,B or R,G,B,A)
    fn parse_kde_color(color_str: &str) -> String {
        let parts: Vec<&str> = color_str.split(',').collect();
        
        if parts.len() >= 3 {
            if let (Ok(r), Ok(g), Ok(b)) = (
                parts[0].trim().parse::<u8>(),
                parts[1].trim().parse::<u8>(),
                parts[2].trim().parse::<u8>(),
            ) {
                return format!("#{:02x}{:02x}{:02x}", r, g, b);
            }
        }
        
        // Fallback
        color_str.to_string()
    }

    /// Determine if theme is dark based on background brightness
    fn is_dark_theme(colors: &PlasmaColors) -> bool {
        // Parse background color
        if let Some(hex) = colors.background.strip_prefix('#') {
            if hex.len() == 6 {
                if let (Ok(r), Ok(g), Ok(b)) = (
                    u8::from_str_radix(&hex[0..2], 16),
                    u8::from_str_radix(&hex[2..4], 16),
                    u8::from_str_radix(&hex[4..6], 16),
                ) {
                    // Calculate perceived brightness
                    let brightness = (0.299 * r as f32 + 0.587 * g as f32 + 0.114 * b as f32) / 255.0;
                    return brightness < 0.5;
                }
            }
        }
        
        // Default to dark
        true
    }

    /// Map Plasma color scheme to Docura theme
    fn map_to_docura_theme(scheme_name: &str, is_dark: bool) -> String {
        let name_lower = scheme_name.to_lowercase();
        
        // Specific mappings
        if name_lower.contains("breeze") && name_lower.contains("dark") {
            return "nord-dark".to_string();
        }
        if name_lower.contains("breeze") && name_lower.contains("light") {
            return "nord-light".to_string();
        }
        if name_lower.contains("breeze") {
            return if is_dark { "nord-dark" } else { "nord-light" }.to_string();
        }
        
        if name_lower.contains("oxygen") {
            return if is_dark { "solarized-dark" } else { "solarized-light" }.to_string();
        }
        
        if name_lower.contains("arc") {
            return if is_dark { "github-dark" } else { "github-light" }.to_string();
        }
        
        if name_lower.contains("nord") {
            return if is_dark { "nord-dark" } else { "nord-light" }.to_string();
        }
        
        if name_lower.contains("dracula") {
            return "dracula-dark".to_string();
        }
        
        if name_lower.contains("monokai") {
            return if is_dark { "monokai-dark" } else { "monokai-light" }.to_string();
        }
        
        if name_lower.contains("solarized") {
            return if is_dark { "solarized-dark" } else { "solarized-light" }.to_string();
        }
        
        if name_lower.contains("gruvbox") {
            return "gruvbox-dark".to_string();
        }
        
        // Default based on brightness
        if is_dark {
            "dracula-dark".to_string()
        } else {
            "github-light".to_string()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_kde_color() {
        assert_eq!(PlasmaThemeDetector::parse_kde_color("30,30,30"), "#1e1e1e");
        assert_eq!(PlasmaThemeDetector::parse_kde_color("255,255,255"), "#ffffff");
    }

    #[test]
    fn test_is_dark_theme() {
        let dark_colors = PlasmaColors {
            background: "#1e1e1e".to_string(),
            foreground: "#ffffff".to_string(),
            selection_background: "#6366f1".to_string(),
            selection_foreground: "#ffffff".to_string(),
        };
        assert!(PlasmaThemeDetector::is_dark_theme(&dark_colors));
        
        let light_colors = PlasmaColors {
            background: "#ffffff".to_string(),
            foreground: "#000000".to_string(),
            selection_background: "#6366f1".to_string(),
            selection_foreground: "#ffffff".to_string(),
        };
        assert!(!PlasmaThemeDetector::is_dark_theme(&light_colors));
    }
}

