import React, { useState, useEffect, useRef } from 'react'
import { Search, File, Folder, Clock, X } from 'lucide-react'

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

    // Filter based on search query
    if (searchQuery.trim() === '') {
      setFilteredResults(items.slice(0, 15)) // Show first 15 when no query
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = items.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(query)
        const pathMatch = item.displayPath.toLowerCase().includes(query)
        return nameMatch || pathMatch
      })
      
      // Sort by relevance (name matches first, then path matches)
      filtered.sort((a, b) => {
        const aNameMatch = a.name.toLowerCase().startsWith(query)
        const bNameMatch = b.name.toLowerCase().startsWith(query)
        if (aNameMatch && !bNameMatch) return -1
        if (!aNameMatch && bNameMatch) return 1
        return a.name.localeCompare(b.name)
      })
      
      setFilteredResults(filtered.slice(0, 15)) // Limit to 15 results
    }
    
    setSelectedIndex(0)
  }, [searchQuery, files, recentItems, isOpen])

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
                  <div className="quick-open-item-name">{item.name}</div>
                  <div className="quick-open-item-path">{item.displayPath}</div>
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

