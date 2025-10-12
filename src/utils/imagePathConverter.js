import { convertFileSrc } from '@tauri-apps/api/core'
import { dirname, resolve as resolvePath } from '@tauri-apps/api/path'

/**
 * Check if a path is an external URL (internet resource)
 * @param {string} path - The path to check
 * @returns {boolean} - True if it's an external URL
 */
export function isExternalUrl(path) {
  if (!path) return false
  
  // Match various URL patterns:
  // - http://, https:// (standard web URLs)
  // - ftp://, ftps:// (file transfer)
  // - //example.com (protocol-relative URLs)
  // - data: (base64 images)
  // - asset: (Tauri asset protocol)
  // - blob: (blob URLs)
  const urlPattern = /^(https?:|ftps?:|\/\/|data:|asset:|blob:)/i
  return urlPattern.test(path)
}

/**
 * Converts local image paths in markdown to Tauri asset protocol URLs
 * Leaves internet URLs (http://, https://, etc.) untouched
 * @param {string} markdown - The markdown content
 * @param {string} currentFilePath - The path of the current markdown file
 * @returns {Promise<string>} - Markdown with converted image paths
 */
export async function convertMarkdownImagePaths(markdown, currentFilePath) {
  if (!markdown || !currentFilePath) {
    return markdown
  }

  try {
    // Get the directory of the current file
    const fileDir = await dirname(currentFilePath)
    
    // Match markdown image syntax: ![alt](path) and <img src="path">
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)|<img[^>]+src=["']([^"']+)["']/g
    
    let convertedMarkdown = markdown
    const matches = [...markdown.matchAll(imageRegex)]
    
    for (const match of matches) {
      const fullMatch = match[0]
      const markdownPath = match[2] || match[3] // Get path from either syntax
      
      // Skip if it's an external URL (internet resource)
      if (markdownPath && !isExternalUrl(markdownPath)) {
        try {
          let absolutePath
          
          // If path starts with /, it's absolute, otherwise resolve relative to file
          if (markdownPath.startsWith('/')) {
            absolutePath = markdownPath
          } else {
            // Resolve relative path
            absolutePath = await resolvePath(fileDir, markdownPath)
          }
          
          // Convert to Tauri asset URL
          const assetUrl = convertFileSrc(absolutePath)
          
          // Replace the path in the original match
          const updatedMatch = fullMatch.replace(markdownPath, assetUrl)
          convertedMarkdown = convertedMarkdown.replace(fullMatch, updatedMatch)
          
          console.log(`✅ Converted local image: ${markdownPath} → asset://`)
        } catch (err) {
          console.warn(`⚠️ Failed to convert image path: ${markdownPath}`, err)
          // Keep original path if conversion fails
        }
      } else if (markdownPath && isExternalUrl(markdownPath)) {
        console.log(`🌐 Keeping external URL: ${markdownPath.substring(0, 50)}...`)
      }
    }
    
    return convertedMarkdown
  } catch (error) {
    console.error('❌ Error converting markdown image paths:', error)
    return markdown // Return original on error
  }
}

/**
 * Converts a single file path to Tauri asset protocol URL
 * Leaves internet URLs untouched
 * @param {string} filePath - The file path to convert
 * @param {string} basePath - Optional base path for relative paths
 * @returns {Promise<string>} - Converted asset URL or original URL
 */
export async function convertToAssetUrl(filePath, basePath = null) {
  try {
    // Skip if it's an external URL (internet resource)
    if (isExternalUrl(filePath)) {
      console.log(`🌐 Keeping external URL in convertToAssetUrl: ${filePath.substring(0, 50)}...`)
      return filePath
    }
    
    let absolutePath = filePath
    
    // Resolve relative paths if base path provided
    if (basePath && !filePath.startsWith('/')) {
      const dir = await dirname(basePath)
      absolutePath = await resolvePath(dir, filePath)
    }
    
    const assetUrl = convertFileSrc(absolutePath)
    console.log(`✅ Converted to asset URL: ${filePath} → asset://`)
    return assetUrl
  } catch (error) {
    console.error('❌ Error converting to asset URL:', error)
    return filePath
  }
}

