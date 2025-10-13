// KDE Plasma Theme Sync Utility
import { invoke } from '@tauri-apps/api/core'

/**
 * Check if KDE Plasma is available
 * @returns {Promise<boolean>} True if Plasma is detected
 */
export async function isPlasmaEnvironment() {
  try {
    const available = await invoke('is_plasma_available')
    return available
  } catch (error) {
    console.warn('Error checking Plasma availability:', error)
    return false
  }
}

/**
 * Get Plasma status (theme, colors, mapping)
 * @returns {Promise<Object>} Plasma status
 */
export async function getPlasmaStatus() {
  try {
    const scheme = await invoke('get_plasma_theme')
    return {
      available: true,
      scheme: scheme.name,
      isDark: scheme.is_dark,
      theme: scheme.mapped_theme,
      colors: scheme.colors,
    }
  } catch (error) {
    console.log('Plasma not available:', error)
    return {
      available: false,
      scheme: null,
      isDark: null,
      theme: null,
      colors: null,
    }
  }
}

/**
 * Sync theme with Plasma
 * @param {Function} onThemeChange Callback when theme changes
 * @returns {Promise<boolean>} Success status
 */
export async function syncWithPlasma(onThemeChange) {
  try {
    const status = await getPlasmaStatus()
    
    if (!status.available) {
      console.log('Plasma not available for sync')
      return false
    }
    
    console.log('🎨 Plasma theme detected:', status.scheme)
    console.log('🎨 Mapped to Docura theme:', status.theme)
    console.log('🌗 Is dark:', status.isDark)
    
    // Apply theme
    if (onThemeChange && status.theme) {
      onThemeChange(status.theme)
      return true
    }
    
    return false
  } catch (error) {
    console.error('Error syncing with Plasma:', error)
    return false
  }
}

/**
 * Get current Plasma color scheme name
 * @returns {Promise<string|null>} Scheme name or null
 */
export async function getPlasmaScheme() {
  try {
    const scheme = await invoke('get_plasma_theme')
    return scheme.name
  } catch (error) {
    return null
  }
}

/**
 * Get Plasma colors
 * @returns {Promise<Object|null>} Color object or null
 */
export async function getPlasmaColors() {
  try {
    const scheme = await invoke('get_plasma_theme')
    return scheme.colors
  } catch (error) {
    return null
  }
}

