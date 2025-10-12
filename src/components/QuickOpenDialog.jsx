import React, { useState, useEffect, useRef } from 'react'
import { Search, File, Folder, Clock, X } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'

const QuickOpenDialog = ({ 
  isOpen, 
  onClose, 
  files, 
  recentItems, 
  onSelectFile,
  currentFolder 
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filteredResults, setFilteredResults] = useState([])
  const inputRef = useRef(null)
  const resultsRef = useRef(null)

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setSearchQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Check if file is markdown
  const isMarkdownFile = (filename) => {
    const markdownExtensions = ['.md', '.markdown', '.mdown', '.mkdn', '.mdx']
    const lowerFilename = filename.toLowerCase()
    return markdownExtensions.some(ext => lowerFilename.endsWith(ext))
  }

  // Build searchable items from files and recent items
  useEffect(() => {
    if (!isOpen) return

    const items = []

    // Add files from current folder (flatten nested structure)
    const addFilesRecursively = (fileList, prefix = '') => {
      fileList.forEach(item => {
        if (item.type === 'file') {
          // Only add markdown files
          if (isMarkdownFile(item.name)) {
            items.push({
              name: item.name,
              path: item.path,
              type: 'file',
              source: 'folder',
              displayPath: prefix ? `${prefix}/${item.name}` : item.name
            })
          }
        } else if (item.type === 'folder' && item.children) {
          addFilesRecursively(item.children, prefix ? `${prefix}/${item.name}` : item.name)
        }
      })
    }

    if (files && files.length > 0) {
      addFilesRecursively(files)
    }

    // Add recent items (only markdown files)
    if (recentItems && recentItems.length > 0) {
      recentItems.forEach(item => {
        // Only add markdown files and avoid duplicates
        if (item.type === 'file' && isMarkdownFile(item.name) && !items.some(i => i.path === item.path)) {
          items.push({
            name: item.name,
            path: item.path,
            type: item.type,
            source: 'recent',
            displayPath: item.path
          })
        }
      })
    }

    // Filter and search based on query
    if (searchQuery.trim() === '') {
      setFilteredResults(items.slice(0, 15)) // Show first 15 when no query
    } else {
      searchFilesWithContent(items, searchQuery).then(filtered => {
        setFilteredResults(filtered.slice(0, 15)) // Limit to 15 results
      })
    }

    setSelectedIndex(0)
  }, [searchQuery, files, recentItems, isOpen])

  // Enhanced search function that searches in file content
  const searchFilesWithContent = async (items, query) => {
    const queryLower = query.toLowerCase()
    const results = []

    for (const item of items) {
      let relevanceScore = 0
      let matchType = 'none'
      const nameLower = item.name.toLowerCase()
      const pathLower = item.displayPath.toLowerCase()

      // Check filename matches (highest priority)
      if (nameLower.includes(queryLower)) {
        relevanceScore += 100
        if (nameLower.startsWith(queryLower)) {
          relevanceScore += 50 // Bonus for starts with
        }
        matchType = 'filename'
      }

      // Check path matches
      if (pathLower.includes(queryLower)) {
        relevanceScore += 10
        matchType = matchType === 'none' ? 'path' : matchType
      }

      // Search in file content (only for markdown files)
      if (isMarkdownFile(item.name)) {
        try {
          // Use Tauri's file reading API instead of fetch
          const content = await invoke('read_file_content', { filePath: item.path })
          if (content) {
            const contentMatches = searchInContent(content, queryLower)

            if (contentMatches.headings.length > 0 || contentMatches.body.length > 0) {
              // Headings matches (high priority - after filename)
              if (contentMatches.headings.length > 0) {
                relevanceScore += 75 // Higher than body content
                matchType = matchType === 'filename' ? 'filename' : 'headings'
              }

              // Body content matches (medium priority)
              if (contentMatches.body.length > 0) {
                relevanceScore += contentMatches.body.length * 5 // More matches = higher score
                if (matchType === 'none') {
                  matchType = 'content'
                }
              }

              // Store content matches for preview
              item.contentMatches = contentMatches
            }
          }
        } catch (error) {
          // If Tauri command doesn't exist, fallback to basic search
          console.warn(`Failed to read file ${item.path}:`, error)
        }
      }

      if (relevanceScore > 0) {
        results.push({
          ...item,
          relevanceScore,
          matchType
        })
      }
    }

    // Sort by relevance score (higher is better)
    results.sort((a, b) => {
      // First, sort by match type priority: filename > headings > content > path
      const typeOrder = { filename: 4, headings: 3, content: 2, path: 1 }
      const aTypeOrder = typeOrder[a.matchType] || 0
      const bTypeOrder = typeOrder[b.matchType] || 0

      if (aTypeOrder !== bTypeOrder) {
        return bTypeOrder - aTypeOrder
      }

      // Within same match type, sort by relevance score
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore
      }

      // For filename matches, prioritize exact matches and starts-with
      if (a.matchType === 'filename' && b.matchType === 'filename') {
        const queryLower = query.toLowerCase()
        const aName = a.name.toLowerCase()
        const bName = b.name.toLowerCase()
        
        // Exact match wins
        if (aName === queryLower + '.md' && bName !== queryLower + '.md') return -1
        if (bName === queryLower + '.md' && aName !== queryLower + '.md') return 1
        
        // Starts with query wins
        if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1
        if (bName.startsWith(queryLower) && !aName.startsWith(queryLower)) return 1
      }

      // Finally, sort alphabetically by name
      return a.name.localeCompare(b.name)
    })

    return results
  }

  // Search for query in markdown content
  const searchInContent = (content, queryLower) => {
    const lines = content.split('\n')
    const headings = []
    const body = []

    lines.forEach((line, index) => {
      const lineLower = line.toLowerCase()

      // Check for headings (lines starting with #)
      if (line.trim().match(/^#+\s/)) {
        if (lineLower.includes(queryLower)) {
          // Count how many times the query appears in this heading
          const matchCount = (lineLower.match(new RegExp(queryLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
          headings.push({
            line: index + 1,
            text: line.trim(),
            preview: line.trim().substring(0, 100) + (line.trim().length > 100 ? '...' : ''),
            matchCount
          })
        }
      } else if (line.trim().length > 0) {
        // Check for matches in body content (skip empty lines)
        if (lineLower.includes(queryLower)) {
          // Count how many times the query appears in this line
          const matchCount = (lineLower.match(new RegExp(queryLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
          
          // Create context around the match
          const matchIndex = lineLower.indexOf(queryLower)
          const contextStart = Math.max(0, matchIndex - 30)
          const contextEnd = Math.min(line.length, matchIndex + queryLower.length + 30)
          let preview = line.substring(contextStart, contextEnd)
          
          // Add ellipsis if we truncated
          if (contextStart > 0) preview = '...' + preview
          if (contextEnd < line.length) preview = preview + '...'
          
          body.push({
            line: index + 1,
            text: line.trim(),
            preview: preview,
            matchCount
          })
        }
      }
    })

    return { headings, body }
  }

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredResults.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredResults[selectedIndex]) {
          handleSelectFile(filteredResults[selectedIndex])
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredResults, selectedIndex])

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex]
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedIndex])

  const handleSelectFile = (item) => {
    if (item.type === 'file') {
      onSelectFile(item.path)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="quick-open-overlay" onClick={onClose}>
      <div className="quick-open-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="quick-open-header">
          <Search size={18} className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="quick-open-input"
            placeholder="Search files... (type to filter)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="quick-open-close" onClick={onClose} title="Close (Esc)">
            <X size={18} />
          </button>
        </div>

        <div className="quick-open-results" ref={resultsRef}>
          {filteredResults.length > 0 ? (
            filteredResults.map((item, index) => (
              <div
                key={index}
                className={`quick-open-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSelectFile(item)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="quick-open-item-icon">
                  {item.source === 'recent' ? (
                    <Clock size={16} />
                  ) : item.type === 'folder' ? (
                    <Folder size={16} />
                  ) : (
                    <File size={16} />
                  )}
                </div>
                <div className="quick-open-item-content">
                  <div className="quick-open-item-name">
                    {item.name}
                    {item.matchType && item.matchType !== 'filename' && (
                      <span className={`match-type-badge ${item.matchType}`}>
                        {item.matchType === 'headings' ? 'in heading' : 
                         item.matchType === 'content' ? 'in content' : 
                         item.matchType}
                      </span>
                    )}
                  </div>
                  <div className="quick-open-item-path">{item.displayPath}</div>
                  {item.contentMatches && (item.contentMatches.headings.length > 0 || item.contentMatches.body.length > 0) && (
                    <div className="content-preview">
                      {item.contentMatches.headings.length > 0 && (
                        <div className="heading-match">
                          📝 {item.contentMatches.headings[0].preview}
                        </div>
                      )}
                      {item.contentMatches.body.length > 0 && !item.contentMatches.headings.length && (
                        <div className="content-match">
                          💬 {item.contentMatches.body[0].preview}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {item.source === 'recent' && (
                  <div className="quick-open-item-badge">Recent</div>
                )}
              </div>
            ))
          ) : (
            <div className="quick-open-empty">
              <Search size={32} />
              <p>No files found</p>
              {searchQuery && <p className="hint">Try a different search term</p>}
            </div>
          )}
        </div>

        <div className="quick-open-footer">
          <div className="quick-open-hints">
            <span><kbd>↑↓</kbd> Navigate</span>
            <span><kbd>Enter</kbd> Open</span>
            <span><kbd>Esc</kbd> Close</span>
          </div>
          <div className="quick-open-count">
            {filteredResults.length > 0 && `${filteredResults.length} file${filteredResults.length !== 1 ? 's' : ''}`}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickOpenDialog

