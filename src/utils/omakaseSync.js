/**
 * Omakase Theme Sync Utility
 * Syncs Docura themes with Omakase (DHH's setup)
 */

import { invoke } from '@tauri-apps/api/core'

/**
 * Map Omarchy themes to Docura themes
 * 🎉 DHH Approved - Exact theme matching!
 */
const OMAKASE_THEME_MAP = {
  // Exact matches with Omarchy themes
  'dracula': 'dracula-dark',
  'catppuccin': 'cappuccino-dark',
  'catppuccin-latte': 'cappuccino-light',
  'nord': 'nord-dark',
  'everforest': 'everforest-dark', // 🆕 Exact Omarchy match!
  'gruvbox': 'gruvbox-dark', // 🆕 Exact Omarchy match!
  'kanagawa': 'kanagawa', // 🆕 Exact Omarchy match!
  'matte-black': 'github-dark',
  'osaka-jade': 'nord-light',
  'ristretto': 'cappuccino-dark',
  'rose-pine': 'rose-pine', // 🆕 Exact Omarchy match!
  'tokyo-night': 'tokyo-night', // 🆕 Exact Omarchy match!
}

/**
 * Check if we're running in Omakase environment
 * @returns {Promise<boolean>}
 */
export async function isOmakaseEnvironment() {
  try {
    const result = await invoke('check_omakase_command')
    return result === true
  } catch (error) {
    console.log('Not in Omakase environment:', error)
    return false
  }
}

/**
 * Get current Omakase theme
 * @returns {Promise<string|null>} - Theme name or null
 */
export async function getOmakaseTheme() {
  try {
    const theme = await invoke('get_omakase_theme')
    return theme ? theme.trim().toLowerCase() : null
  } catch (error) {
    console.error('Error getting Omakase theme:', error)
    return null
  }
}

/**
 * Get current Omakase font
 * @returns {Promise<string|null>} - Font name or null
 */
export async function getOmakaseFont() {
  try {
    const font = await invoke('get_omakase_font')
    return font ? font.trim() : null
  } catch (error) {
    console.error('Error getting Omakase font:', error)
    return null
  }
}

/**
 * Map Omakase theme to Docura theme
 * @param {string} omakaseTheme - Omakase theme name
 * @returns {string} - Docura theme name
 */
export function mapOmakaseTheme(omakaseTheme) {
  if (!omakaseTheme) return 'dracula-dark'
  
  const theme = omakaseTheme.toLowerCase().trim()
  return OMAKASE_THEME_MAP[theme] || 'dracula-dark'
}

/**
 * Sync with Omakase theme
 * @param {function} onThemeChange - Callback when theme should change
 * @returns {Promise<boolean>} - Success status
 */
export async function syncWithOmakase(onThemeChange) {
  try {
    const isOmakase = await isOmakaseEnvironment()
    if (!isOmakase) {
      console.log('Not in Omakase environment')
      return false
    }

    const omakaseTheme = await getOmakaseTheme()
    if (!omakaseTheme) {
      console.log('Could not get Omakase theme')
      return false
    }

    const docuraTheme = mapOmakaseTheme(omakaseTheme)
    console.log(`Syncing: Omakase "${omakaseTheme}" → Docura "${docuraTheme}"`)
    
    if (onThemeChange) {
      onThemeChange(docuraTheme)
    }

    return true
  } catch (error) {
    console.error('Error syncing with Omakase:', error)
    return false
  }
}

/**
 * Get Omakase status info
 * @returns {Promise<object>} - Status information
 */
export async function getOmakaseStatus() {
  const isOmakase = await isOmakaseEnvironment()
  
  if (!isOmakase) {
    return {
      available: false,
      theme: null,
      font: null,
      mappedTheme: null
    }
  }

  const theme = await getOmakaseTheme()
  const font = await getOmakaseFont()
  const mappedTheme = mapOmakaseTheme(theme)

  return {
    available: true,
    theme,
    font,
    mappedTheme
  }
}

