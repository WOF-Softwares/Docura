import React, { useState } from 'react'
import { 
  FolderIcon, 
  FileIcon, 
  RefreshCw, 
  ChevronRight, 
  ChevronDown,
  Hash,
  Circle
} from 'lucide-react'
import ScrollableContainer from './ScrollableContainer'

const Sidebar = ({
  currentFolder,
  files,
  outlineHeaders,
  onSelectFile,
  onRefreshFiles,
  onHeaderClick,
  currentFile,
  hasUnsavedChanges
}) => {
  const [activeTab, setActiveTab] = useState('files')
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const fileTreeScrollRef = React.useRef(null)
  const outlineScrollRef = React.useRef(null)

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath)
    } else {
      newExpanded.add(folderPath)
    }
    setExpandedFolders(newExpanded)
  }

  const isMarkdownFile = (filename) => {
    const markdownExtensions = ['.md', '.markdown', '.mdown', '.mkdn', '.mdx']
    return markdownExtensions.some(ext => 
      filename.toLowerCase().endsWith(ext)
    )
  }

  const renderFileTree = (items, depth = 0) => {
    if (!items || !Array.isArray(items)) return null

    return items.map((item, index) => {
      const isFolder = item.type === 'folder'
      const isExpanded = expandedFolders.has(item.path)
      const isCurrentFile = !isFolder && currentFile === item.path
      const paddingLeft = depth * 20 + 8

      // Only render markdown files and folders
      if (!isFolder && !isMarkdownFile(item.name)) {
        return null
      }

      return (
        <div key={`${item.path}-${index}`} className="file-tree-item">
          <div
            className={`file-tree-node ${isFolder ? 'folder' : 'file'} ${
              !isFolder && isMarkdownFile(item.name) ? 'markdown' : ''
            } ${isCurrentFile ? 'active' : ''}`}
            style={{ paddingLeft }}
            onClick={() => {
              if (isFolder) {
                toggleFolder(item.path)
              } else {
                onSelectFile(item.path)
              }
            }}
          >
            {isFolder && (
              <span className="folder-icon">
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </span>
            )}
            {!isFolder && isCurrentFile && hasUnsavedChanges && (
              <span className="unsaved-indicator">
                <Circle size={8} fill="currentColor" />
              </span>
            )}
            <span className="file-icon">
              {isFolder ? <FolderIcon size={14} /> : <FileIcon size={14} />}
            </span>
            <span className="file-name">{item.name}</span>
          </div>

          {isFolder && isExpanded && item.children && (
            <div className="folder-contents">
              {renderFileTree(item.children, depth + 1)}
            </div>
          )}
        </div>
      )
    }).filter(Boolean) // Remove null items from filtered files
  }

  const renderOutline = () => {
    return outlineHeaders.map((header, index) => (
      <div
        key={index}
        className="outline-item"
        style={{ paddingLeft: (header.level - 1) * 16 + 8 }}
        onClick={() => {
          if (onHeaderClick) {
            onHeaderClick(header)
          }
        }}
      >
        <Hash size={12} />
        <span className="outline-text">{header.text}</span>
      </div>
    ))
  }

  return (
    <div className="sidebar">
      <div className="sidebar-tabs">
        <button
          className={`tab ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          Files
        </button>
        <button
          className={`tab ${activeTab === 'outline' ? 'active' : ''}`}
          onClick={() => setActiveTab('outline')}
        >
          Outline
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === 'files' && (
          <div className="files-panel">
            <div className="panel-header">
              <span className="panel-title">
                {currentFolder ? 'Files' : files.length > 0 ? 'Open Files' : 'No folder selected'}
              </span>
              {currentFolder && (
                <button
                  className="refresh-button"
                  onClick={onRefreshFiles}
                  title="Refresh"
                >
                  <RefreshCw size={14} />
                </button>
              )}
            </div>
            
            {(currentFolder || files.length > 0) ? (
              <ScrollableContainer 
                ref={fileTreeScrollRef}
                className="file-tree-container"
                thumbColor="var(--border-color)"
                thumbHoverColor="var(--accent-color)"
                scrollbarWidth={6}
                autoHide={true}
                smoothScroll={true}
              >
                <div className="file-tree">
                  {files.length > 0 ? (
                    renderFileTree(files)
                  ) : (
                    <div className="empty-state">No files found</div>
                  )}
                </div>
              </ScrollableContainer>
            ) : (
              <div className="empty-state">
                Open a folder to see files
              </div>
            )}
          </div>
        )}

        {activeTab === 'outline' && (
          <div className="outline-panel">
            <div className="panel-header">
              <span className="panel-title">Document Outline</span>
            </div>
            
            {outlineHeaders.length > 0 ? (
              <ScrollableContainer 
                ref={outlineScrollRef}
                className="outline-tree-container"
                thumbColor="var(--border-color)"
                thumbHoverColor="var(--accent-color)"
                scrollbarWidth={6}
                autoHide={true}
                smoothScroll={true}
              >
                <div className="outline-tree">
                  {renderOutline()}
                </div>
              </ScrollableContainer>
            ) : (
              <div className="empty-state">
                No headers found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar