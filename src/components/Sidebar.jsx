import React, { useState } from 'react'
import { 
  FolderIcon, 
  FileIcon, 
  RefreshCw, 
  ChevronRight, 
  ChevronDown,
  Hash
} from 'lucide-react'

const Sidebar = ({
  currentFolder,
  files,
  outlineHeaders,
  onSelectFile,
  onRefreshFiles
}) => {
  const [activeTab, setActiveTab] = useState('files')
  const [expandedFolders, setExpandedFolders] = useState(new Set())

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
      const paddingLeft = depth * 20 + 8

      return (
        <div key={`${item.path}-${index}`} className="file-tree-item">
          <div
            className={`file-tree-node ${isFolder ? 'folder' : 'file'} ${
              !isFolder && isMarkdownFile(item.name) ? 'markdown' : ''
            }`}
            style={{ paddingLeft }}
            onClick={() => {
              if (isFolder) {
                toggleFolder(item.path)
              } else if (isMarkdownFile(item.name)) {
                onSelectFile(item.path)
              }
            }}
          >
            {isFolder && (
              <span className="folder-icon">
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
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
    })
  }

  const renderOutline = () => {
    return outlineHeaders.map((header, index) => (
      <div
        key={index}
        className="outline-item"
        style={{ paddingLeft: (header.level - 1) * 16 + 8 }}
        onClick={() => {
          // Scroll to header in editor
          console.log(`Scroll to line ${header.line}`)
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
                {currentFolder ? 'Files' : 'No folder selected'}
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
            
            {currentFolder ? (
              <div className="file-tree">
                {files.length > 0 ? (
                  renderFileTree(files)
                ) : (
                  <div className="empty-state">No files found</div>
                )}
              </div>
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
              <div className="outline-tree">
                {renderOutline()}
              </div>
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