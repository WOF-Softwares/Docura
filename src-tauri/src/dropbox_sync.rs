use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DropboxAuthConfig {
    pub client_id: String,
    pub client_secret: String,
    pub redirect_uri: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DropboxTokens {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_at: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DropboxUserInfo {
    pub email: String,
    pub display_name: String,
    pub account_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SyncFolder {
    pub local_path: String,
    pub dropbox_path: String,
    pub enabled: bool,
}

// Dropbox App credentials (you'll need to create a Dropbox app and get these)
// For security, these should be stored in environment variables or secure config
impl Default for DropboxAuthConfig {
    fn default() -> Self {
        Self {
            // Use compile-time env vars (set during build) with fallback to runtime
            client_id: option_env!("DROPBOX_CLIENT_ID")
                .map(|s| s.to_string())
                .or_else(|| std::env::var("DROPBOX_CLIENT_ID").ok())
                .unwrap_or_else(|| "YOUR_CLIENT_ID".to_string()),
            client_secret: option_env!("DROPBOX_CLIENT_SECRET")
                .map(|s| s.to_string())
                .or_else(|| std::env::var("DROPBOX_CLIENT_SECRET").ok())
                .unwrap_or_else(|| "YOUR_CLIENT_SECRET".to_string()),
            redirect_uri: option_env!("DROPBOX_REDIRECT_URI")
                .map(|s| s.to_string())
                .or_else(|| std::env::var("DROPBOX_REDIRECT_URI").ok())
                .unwrap_or_else(|| "https://wof-softwares.github.io/Docura/oauth-redirect.html".to_string()),
        }
    }
}

/// Generate the OAuth authorization URL
/// Uses App Folder access for better security and privacy
pub fn get_auth_url() -> String {
    let config = DropboxAuthConfig::default();
    format!(
        "https://www.dropbox.com/oauth2/authorize?client_id={}&response_type=code&redirect_uri={}&token_access_type=offline&scope=account_info.read files.content.write files.content.read",
        config.client_id,
        urlencoding::encode(&config.redirect_uri)
    )
}

/// Exchange authorization code for access token
pub async fn exchange_code_for_token(code: &str) -> Result<DropboxTokens, String> {
    let config = DropboxAuthConfig::default();
    
    let client = reqwest::Client::new();
    
    let mut params = HashMap::new();
    params.insert("code", code);
    params.insert("grant_type", "authorization_code");
    params.insert("client_id", &config.client_id);
    params.insert("client_secret", &config.client_secret);
    params.insert("redirect_uri", &config.redirect_uri);
    
    let response = client
        .post("https://api.dropboxapi.com/oauth2/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("Failed to exchange code: {}", e))?;
    
    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("Dropbox OAuth error: {}", error_text));
    }
    
    let token_response: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse token response: {}", e))?;
    
    Ok(DropboxTokens {
        access_token: token_response["access_token"]
            .as_str()
            .ok_or("Missing access_token")?
            .to_string(),
        refresh_token: token_response["refresh_token"]
            .as_str()
            .map(|s| s.to_string()),
        expires_at: token_response["expires_in"]
            .as_i64()
            .map(|exp| chrono::Utc::now().timestamp() + exp),
    })
}

/// Refresh the access token using refresh token
pub async fn refresh_access_token(refresh_token: &str) -> Result<DropboxTokens, String> {
    let config = DropboxAuthConfig::default();
    
    let client = reqwest::Client::new();
    
    let mut params = HashMap::new();
    params.insert("grant_type", "refresh_token");
    params.insert("refresh_token", refresh_token);
    params.insert("client_id", &config.client_id);
    params.insert("client_secret", &config.client_secret);
    
    let response = client
        .post("https://api.dropboxapi.com/oauth2/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("Failed to refresh token: {}", e))?;
    
    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("Dropbox token refresh error: {}", error_text));
    }
    
    let token_response: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse token response: {}", e))?;
    
    Ok(DropboxTokens {
        access_token: token_response["access_token"]
            .as_str()
            .ok_or("Missing access_token")?
            .to_string(),
        refresh_token: Some(refresh_token.to_string()),
        expires_at: token_response["expires_in"]
            .as_i64()
            .map(|exp| chrono::Utc::now().timestamp() + exp),
    })
}

/// Get current user information
pub async fn get_user_info(access_token: &str) -> Result<DropboxUserInfo, String> {
    let client = reqwest::Client::new();
    
    let response = client
        .post("https://api.dropboxapi.com/2/users/get_current_account")
        .header("Authorization", format!("Bearer {}", access_token))
        .send()
        .await
        .map_err(|e| format!("Failed to get user info: {}", e))?;
    
    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("Dropbox API error: {}", error_text));
    }
    
    let user_data: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse user info: {}", e))?;
    
    Ok(DropboxUserInfo {
        email: user_data["email"]
            .as_str()
            .ok_or("Missing email")?
            .to_string(),
        display_name: user_data["name"]["display_name"]
            .as_str()
            .ok_or("Missing display_name")?
            .to_string(),
        account_id: user_data["account_id"]
            .as_str()
            .ok_or("Missing account_id")?
            .to_string(),
    })
}

/// Upload a file to Dropbox
pub async fn upload_file(
    access_token: &str,
    local_path: &str,
    dropbox_path: &str,
    content: Vec<u8>,
) -> Result<(), String> {
    let client = reqwest::Client::new();
    
    let upload_arg = serde_json::json!({
        "path": dropbox_path,
        "mode": "overwrite",
        "autorename": false,
        "mute": false
    });
    
    let response = client
        .post("https://content.dropboxapi.com/2/files/upload")
        .header("Authorization", format!("Bearer {}", access_token))
        .header("Dropbox-API-Arg", upload_arg.to_string())
        .header("Content-Type", "application/octet-stream")
        .body(content)
        .send()
        .await
        .map_err(|e| format!("Failed to upload file: {}", e))?;
    
    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("Dropbox upload error: {}", error_text));
    }
    
    Ok(())
}

/// Download a file from Dropbox
pub async fn download_file(
    access_token: &str,
    dropbox_path: &str,
) -> Result<Vec<u8>, String> {
    let client = reqwest::Client::new();
    
    let download_arg = serde_json::json!({
        "path": dropbox_path
    });
    
    let response = client
        .post("https://content.dropboxapi.com/2/files/download")
        .header("Authorization", format!("Bearer {}", access_token))
        .header("Dropbox-API-Arg", download_arg.to_string())
        .send()
        .await
        .map_err(|e| format!("Failed to download file: {}", e))?;
    
    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("Dropbox download error: {}", error_text));
    }
    
    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;
    
    Ok(bytes.to_vec())
}

/// List files in a Dropbox folder
pub async fn list_folder(
    access_token: &str,
    folder_path: &str,
) -> Result<Vec<String>, String> {
    let client = reqwest::Client::new();
    
    let list_arg = serde_json::json!({
        "path": folder_path,
        "recursive": false
    });
    
    let response = client
        .post("https://api.dropboxapi.com/2/files/list_folder")
        .header("Authorization", format!("Bearer {}", access_token))
        .header("Content-Type", "application/json")
        .json(&list_arg)
        .send()
        .await
        .map_err(|e| format!("Failed to list folder: {}", e))?;
    
    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("Dropbox list folder error: {}", error_text));
    }
    
    let list_data: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse list response: {}", e))?;
    
    let entries = list_data["entries"]
        .as_array()
        .ok_or("Missing entries in response")?;
    
    let files: Vec<String> = entries
        .iter()
        .filter_map(|entry| {
            entry["path_display"].as_str().map(|s| s.to_string())
        })
        .collect();
    
    Ok(files)
}

/// Create a folder in Dropbox
pub async fn create_folder(
    access_token: &str,
    folder_path: &str,
) -> Result<(), String> {
    let client = reqwest::Client::new();
    
    let create_arg = serde_json::json!({
        "path": folder_path,
        "autorename": false
    });
    
    let response = client
        .post("https://api.dropboxapi.com/2/files/create_folder_v2")
        .header("Authorization", format!("Bearer {}", access_token))
        .header("Content-Type", "application/json")
        .json(&create_arg)
        .send()
        .await
        .map_err(|e| format!("Failed to create folder: {}", e))?;
    
    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        // Ignore "folder already exists" errors
        if !error_text.contains("path/conflict/folder") {
            return Err(format!("Dropbox create folder error: {}", error_text));
        }
    }
    
    Ok(())
}

