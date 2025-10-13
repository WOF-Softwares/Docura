import React, { useState } from 'react'
import { 
  FolderIcon, 
  FileIcon, 
  RefreshCw, 
  ChevronRight, 
  ChevronDown,
  Hash,
  Circle,
  Cloud,
  CloudOff,
  FolderPlus,
  Check
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
  hasUnsavedChanges,
  // Dropbox props
  dropboxSyncEnabled,
  syncFolders,
  onSyncCurrentFolder,
  onAddCurrentFolderToSync,
  currentFolderSyncStatus
}) => {
  const [activeTab, setActiveTab] = useState('files')
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [contextMenu, setContextMenu] = useState(null)
  const [syncingFolder, setSyncingFolder] = useState(false)
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

  // Check if current folder is in sync list
  const isCurrentFolderSynced = () => {
    if (!currentFolder || !syncFolders) return false
    return syncFolders.some(folder => folder.localPath === currentFolder)
  }

  // Check if a file is in a synced folder
  const isFileSynced = (filePath) => {
    if (!filePath || !syncFolders) return false
    return syncFolders.some(folder => filePath.startsWith(folder.localPath))
  }

  // Handle sync current folder
  const handleSyncFolder = async () => {
    if (!currentFolder || !onSyncCurrentFolder) return
    
    setSyncingFolder(true)
    try {
      await onSyncCurrentFolder()
    } finally {
      setSyncingFolder(false)
    }
  }

  // Handle right-click context menu
  const handleContextMenu = (e, item) => {
    e.preventDefault()
    e.stopPropagation()
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item: item
    })
  }

  // Close context menu on click outside
  React.useEffect(() => {
    const handleClick = () => setContextMenu(null)
    if (contextMenu) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [contextMenu])

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
            onContextMenu={(e) => !isFolder && handleContextMenu(e, item)}
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
            {!isFolder && dropboxSyncEnabled && isFileSynced(item.path) && (
              <span className="sync-indicator" title="Synced to Dropbox">
                <Cloud size={12} />
              </span>
            )}
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
                {currentFolder && dropboxSyncEnabled && isCurrentFolderSynced() && (
                  <span className="folder-sync-badge" title="Folder is synced to Dropbox">
                    <Cloud size={12} />
                  </span>
                )}
              </span>
              {currentFolder && (
                <div className="panel-actions">
                  {dropboxSyncEnabled && isCurrentFolderSynced() && (
                    <button
                      className="panel-action-button"
                      onClick={handleSyncFolder}
                      disabled={syncingFolder}
                      title="Sync to Dropbox now"
                    >
                      <Cloud size={14} className={syncingFolder ? 'spin' : ''} />
                    </button>
                  )}
                  {dropboxSyncEnabled && !isCurrentFolderSynced() && onAddCurrentFolderToSync && (
                    <button
                      className="panel-action-button add-sync"
                      onClick={() => onAddCurrentFolderToSync()}
                      title="Add folder to Dropbox sync"
                    >
                      <FolderPlus size={14} />
                    </button>
                  )}
                  <button
                    className="panel-action-button"
                    onClick={onRefreshFiles}
                    title="Refresh"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
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

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="sidebar-context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 10000
          }}
        >
          {dropboxSyncEnabled && (
            isFileSynced(contextMenu.item.path) ? (
              <div className="context-menu-item disabled">
                <Cloud size={14} />
                <span>Already synced</span>
              </div>
            ) : (
              <div 
                className="context-menu-item"
                onClick={() => {
                  // This file's folder should be added to sync
                  const filePath = contextMenu.item.path
                  const lastSlash = filePath.lastIndexOf('/')
                  
                  if (lastSlash > 0) {
                    const folderPath = filePath.substring(0, lastSlash)
                    if (onAddCurrentFolderToSync) {
                      onAddCurrentFolderToSync(folderPath)
                    }
                  }
                  setContextMenu(null)
                }}
              >
                <FolderPlus size={14} />
                <span>Add folder to sync</span>
              </div>
            )
          )}
          {!dropboxSyncEnabled && (
            <div className="context-menu-item disabled">
              <CloudOff size={14} />
              <span>Dropbox sync disabled</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Sidebar