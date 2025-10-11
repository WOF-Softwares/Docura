import { convertFileSrc } from '@tauri-apps/api/core'
import { dirname, resolve as resolvePath } from '@tauri-apps/api/path'

/**
 * Converts local image paths in markdown to Tauri asset protocol URLs
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
      
      // Skip if it's already a URL (http://, https://, data:, asset://)
      if (markdownPath && !markdownPath.match(/^(https?:|data:|asset:)/i)) {
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
        } catch (err) {
          console.warn(`Failed to convert image path: ${markdownPath}`, err)
          // Keep original path if conversion fails
        }
      }
    }
    
    return convertedMarkdown
  } catch (error) {
    console.error('Error converting markdown image paths:', error)
    return markdown // Return original on error
  }
}

/**
 * Converts a single file path to Tauri asset protocol URL
 * @param {string} filePath - The file path to convert
 * @param {string} basePath - Optional base path for relative paths
 * @returns {Promise<string>} - Converted asset URL
 */
export async function convertToAssetUrl(filePath, basePath = null) {
  try {
    // Skip if already a URL
    if (filePath.match(/^(https?:|data:|asset:)/i)) {
      return filePath
    }
    
    let absolutePath = filePath
    
    // Resolve relative paths if base path provided
    if (basePath && !filePath.startsWith('/')) {
      const dir = await dirname(basePath)
      absolutePath = await resolvePath(dir, filePath)
    }
    
    return convertFileSrc(absolutePath)
  } catch (error) {
    console.error('Error converting to asset URL:', error)
    return filePath
  }
}

