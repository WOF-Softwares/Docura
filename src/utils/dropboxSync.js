import { invoke } from '@tauri-apps/api/core';

/**
 * Dropbox Sync Utilities
 * Helper functions for Dropbox integration
 */

/**
 * Get Dropbox OAuth authorization URL
 * @returns {Promise<string>} OAuth URL
 */
export async function getDropboxAuthUrl() {
  try {
    return await invoke('dropbox_get_auth_url');
  } catch (error) {
    console.error('Failed to get Dropbox auth URL:', error);
    throw error;
  }
}

/**
 * Exchange authorization code for access token
 * @param {string} code - Authorization code from Dropbox
 */
export async function exchangeDropboxCode(code) {
  try {
    await invoke('dropbox_exchange_code', { code });
  } catch (error) {
    console.error('Failed to exchange Dropbox code:', error);
    throw error;
  }
}

/**
 * Disconnect Dropbox account
 */
export async function disconnectDropbox() {
  try {
    await invoke('dropbox_disconnect');
  } catch (error) {
    console.error('Failed to disconnect Dropbox:', error);
    throw error;
  }
}

/**
 * Get Dropbox connection status
 * @returns {Promise<{connected: boolean, email?: string, targetFolder?: string}>}
 */
export async function getDropboxStatus() {
  try {
    return await invoke('dropbox_get_status');
  } catch (error) {
    console.error('Failed to get Dropbox status:', error);
    return { connected: false };
  }
}

/**
 * Set target folder in Dropbox
 * @param {string} folderName - Name of target folder
 */
export async function setDropboxTargetFolder(folderName) {
  try {
    await invoke('dropbox_set_target_folder', { folderName });
  } catch (error) {
    console.error('Failed to set Dropbox target folder:', error);
    throw error;
  }
}

/**
 * Add a local folder to sync with Dropbox
 * @param {string} localPath - Local folder path
 * @param {string} dropboxSubfolder - Subfolder name in Dropbox
 */
export async function addDropboxSyncFolder(localPath, dropboxSubfolder) {
  try {
    await invoke('dropbox_add_sync_folder', { 
      localPath, 
      dropboxSubfolder 
    });
  } catch (error) {
    console.error('Failed to add Dropbox sync folder:', error);
    throw error;
  }
}

/**
 * Remove a sync folder by index
 * @param {number} index - Index of folder to remove
 */
export async function removeDropboxSyncFolder(index) {
  try {
    await invoke('dropbox_remove_sync_folder', { index });
  } catch (error) {
    console.error('Failed to remove Dropbox sync folder:', error);
    throw error;
  }
}

/**
 * Get all sync folders
 * @returns {Promise<Array<{localPath: string, dropboxPath: string}>>}
 */
export async function getDropboxSyncFolders() {
  try {
    return await invoke('dropbox_get_sync_folders');
  } catch (error) {
    console.error('Failed to get Dropbox sync folders:', error);
    return [];
  }
}

/**
 * Toggle Dropbox auto-sync
 * @param {boolean} enabled - Enable or disable sync
 */
export async function toggleDropboxSync(enabled) {
  try {
    await invoke('dropbox_toggle_sync', { enabled });
  } catch (error) {
    console.error('Failed to toggle Dropbox sync:', error);
    throw error;
  }
}

/**
 * Sync a file to Dropbox
 * @param {string} localPath - Local file path
 * @param {string} content - File content
 */
export async function syncFileToDropbox(localPath, content) {
  try {
    console.log('📤 Syncing to Dropbox:', localPath);
    await invoke('dropbox_sync_file', { localPath, content });
    console.log('✅ Sync successful:', localPath);
  } catch (error) {
    console.error('❌ Failed to sync file to Dropbox:', error);
    throw error;
  }
}

/**
 * Start OAuth flow by opening browser
 * This will open the Dropbox authorization page
 */
export async function startDropboxOAuth() {
  const authUrl = await getDropboxAuthUrl();
  
  // Open URL in default browser
  // Note: In Tauri 2.0, we can use shell plugin
  // For now, user can copy-paste the URL
  return authUrl;
}

/**
 * Check if a file should be synced
 * @param {string} filePath - File path to check
 * @param {Array} syncFolders - List of sync folders
 * @returns {boolean}
 */
export function shouldSyncFile(filePath, syncFolders) {
  if (!filePath || !syncFolders || syncFolders.length === 0) {
    console.log('❌ Sync check failed:', { filePath, syncFolders: syncFolders?.length || 0 });
    return false;
  }
  
  console.log('🔍 Checking if should sync:', { 
    filePath, 
    syncFolders: syncFolders.map(f => ({ 
      localPath: f.localPath, 
      dropboxPath: f.dropboxPath 
    }))
  });
  
  const shouldSync = syncFolders.some(folder => {
    const matches = filePath.startsWith(folder.localPath);
    console.log(`  ${matches ? '✅' : '❌'} ${filePath} vs ${folder.localPath}`);
    return matches;
  });
  
  console.log(`${shouldSync ? '✅' : '❌'} Final decision: ${shouldSync ? 'SYNC' : 'NO SYNC'}`);
  return shouldSync;
}

/**
 * Get Dropbox path for a local file
 * @param {string} localPath - Local file path
 * @param {Array} syncFolders - List of sync folders
 * @returns {string|null} Dropbox path or null
 */
export function getDropboxPath(localPath, syncFolders) {
  const syncFolder = syncFolders.find(folder => 
    localPath.startsWith(folder.localPath)
  );
  
  if (!syncFolder) {
    return null;
  }
  
  const relativePath = localPath.substring(syncFolder.localPath.length);
  return `${syncFolder.dropboxPath}${relativePath}`;
}

