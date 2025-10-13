import React, { useState, useEffect } from 'react'
import { X, Download, File, Folder, RefreshCw, Search } from 'lucide-react'

const DropboxFilesDialog = ({ 
  isOpen, 
  onClose, 
  onDownloadFile,
  dropboxStatus 
}) => {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPath, setCurrentPath] = useState('/')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && dropboxStatus?.connected) {
      loadFiles()
    }
  }, [isOpen, currentPath])

  const loadFiles = async () => {
    setLoading(true)
    setError(null)
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const fileList = await invoke('dropbox_list_files', { 
        path: currentPath 
      })
      setFiles(fileList)
    } catch (err) {
      console.error('Failed to load Dropbox files:', err)
      setError(err.toString())
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadFile = async (file) => {
    if (file.isFolder) {
      // Navigate into folder
      setCurrentPath(file.path)
      return
    }

    try {
      setLoading(true)
      const { invoke } = await import('@tauri-apps/api/core')
      
      // Download file content from Dropbox
      const content = await invoke('dropbox_download_file', { 
        dropboxPath: file.path 
      })
      
      // Pass to parent to open in editor
      onDownloadFile(file.name, content)
      onClose()
    } catch (err) {
      console.error('Failed to download file:', err)
      setError('Failed to download file: ' + err)
    } finally {
      setLoading(false)
    }
  }

  const goToParent = () => {
    if (currentPath === '/') return
    const parts = currentPath.split('/').filter(p => p)
    parts.pop()
    setCurrentPath('/' + parts.join('/'))
  }

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="settings-header">
          <h2>📁 Open from Dropbox</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="settings-body" style={{ padding: 0 }}>
          {/* Search Bar */}
          <div style={{ 
            padding: '16px 24px', 
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Search size={18} style={{ color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                className="toolbar-button"
                onClick={loadFiles}
                disabled={loading}
                title="Refresh"
              >
                <RefreshCw size={16} className={loading ? 'spin' : ''} />
              </button>
            </div>

            {/* Breadcrumb */}
            <div style={{ 
              marginTop: '12px', 
              fontSize: '13px', 
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>📍</span>
              <span style={{ fontFamily: 'monospace' }}>
                {currentPath === '/' ? '/Apps/Docura Sync' : `/Apps/Docura Sync${currentPath}`}
              </span>
              {currentPath !== '/' && (
                <button
                  onClick={goToParent}
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)'
                  }}
                >
                  ← Back
                </button>
              )}
            </div>
          </div>

          {/* Files List */}
          <div style={{ 
            padding: '16px 24px', 
            maxHeight: '400px', 
            overflowY: 'auto',
            minHeight: '300px'
          }}>
            {error && (
              <div className="settings-info" style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                marginBottom: '16px'
              }}>
                <span>⚠️ {error}</span>
              </div>
            )}

            {loading && !error && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '60px 20px',
                color: 'var(--text-secondary)'
              }}>
                <RefreshCw size={32} className="spin" style={{ marginBottom: '16px' }} />
                <span>Loading files from Dropbox...</span>
              </div>
            )}

            {!loading && !error && filteredFiles.length === 0 && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '60px 20px',
                color: 'var(--text-secondary)'
              }}>
                <File size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p style={{ margin: '4px 0', fontSize: '16px' }}>No files found</p>
                <p style={{ margin: '4px 0', fontSize: '13px', opacity: 0.7 }}>
                  {searchQuery ? 'Try a different search term' : 'Upload files from another device to see them here'}
                </p>
              </div>
            )}

            {!loading && !error && filteredFiles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredFiles.map((file, index) => (
                  <div
                    key={index}
                    onClick={() => handleDownloadFile(file)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                      e.currentTarget.style.borderColor = 'var(--accent-color)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                      e.currentTarget.style.borderColor = 'var(--border-color)'
                    }}
                  >
                    {file.isFolder ? (
                      <Folder size={20} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                    ) : (
                      <File size={20} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {file.name}
                      </div>
                      {file.size && (
                        <div style={{ 
                          fontSize: '12px', 
                          color: 'var(--text-secondary)',
                          marginTop: '2px'
                        }}>
                          {formatFileSize(file.size)}
                        </div>
                      )}
                    </div>
                    {!file.isFolder && (
                      <Download size={16} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="settings-footer">
          <div style={{ 
            flex: 1, 
            fontSize: '13px', 
            color: 'var(--text-secondary)' 
          }}>
            {filteredFiles.length > 0 && !loading && (
              <span>📊 {filteredFiles.length} item{filteredFiles.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          <button className="button-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export default DropboxFilesDialog

