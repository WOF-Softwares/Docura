import React, { useState, useEffect } from 'react'
import { X, Check, RefreshCw } from 'lucide-react'
import { getOmakaseStatus } from '../utils/omakaseSync'
import { getPlasmaStatus } from '../utils/plasmaSync'

const SettingsDialog = ({ 
  isOpen, 
  onClose, 
  omakaseSyncEnabled, 
  onOmakaseSyncToggle,
  plasmaSyncEnabled,
  onPlasmaSyncToggle,
  onSyncNow,
  autoSaveEnabled,
  onAutoSaveToggle,
  editorSettings,
  onEditorSettingsChange,
  liveEditorType,
  onLiveEditorTypeChange,
  syncProvider, // 'omakase' or 'plasma'
  dropboxSyncEnabled,
  onDropboxSyncToggle,
  dropboxStatus,
  onDropboxAuth,
  onDropboxDisconnect,
  onAddSyncFolder,
  onRemoveSyncFolder,
  syncFolders
}) => {
  const [omakaseStatus, setOmakaseStatus] = useState(null)
  const [plasmaStatus, setPlasmaStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    if (isOpen) {
      loadThemeProviderStatus()
    }
  }, [isOpen])

  const loadThemeProviderStatus = async () => {
    setLoading(true)
    
    // Load both statuses in parallel
    const [omakaseRes, plasmaRes] = await Promise.all([
      getOmakaseStatus(),
      getPlasmaStatus()
    ])
    
    setOmakaseStatus(omakaseRes)
    setPlasmaStatus(plasmaRes)
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="settings-body">
          {/* Settings Tabs Sidebar */}
          <div className="settings-sidebar">
            <button
              className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              ⚙️ General
            </button>
            <button
              className={`settings-tab ${activeTab === 'sync' ? 'active' : ''}`}
              onClick={() => setActiveTab('sync')}
            >
              ☁️ Cloud Sync
            </button>
            <button
              className={`settings-tab ${activeTab === 'advanced' ? 'active' : ''}`}
              onClick={() => setActiveTab('advanced')}
            >
              🔧 Editor Settings
            </button>
          </div>

          {/* Settings Content */}
          <div className="settings-content">
            {/* General Tab */}
            {activeTab === 'general' && (
              <>
                <div className="settings-section">
                  <h3>⚙️ General</h3>
                  
                  <div className="settings-option">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={autoSaveEnabled}
                        onChange={(e) => onAutoSaveToggle(e.target.checked)}
                      />
                      <span>Enable Auto-Save</span>
                    </label>
                    <p className="option-description">
                      Automatically save your file 2 seconds after you stop typing. Only works with saved files (not "Untitled" documents).
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Cloud Sync Tab */}
            {activeTab === 'sync' && (
              <>
                {/* Dropbox Sync Section */}
                <div className="settings-section">
                  <h3>☁️ Dropbox Sync</h3>
                  
                  {!dropboxStatus?.connected ? (
                    <>
                      <div className="settings-info">
                        <span>Connect your Dropbox account to automatically sync your markdown files across devices.</span>
                      </div>
                      
                      <button 
                        className="sync-button"
                        onClick={onDropboxAuth}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 2L0 6l6 4 6-4-6-4zm6 9l-6 4 6 4 6-4-6-4zm-6 9l6 4 6-4-6-4-6 4z"/>
                        </svg>
                        Connect Dropbox
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="settings-info success">
                        <Check size={16} />
                        <span>Dropbox connected!</span>
                      </div>
                      
                      <div className="settings-details">
                        <div className="detail-row">
                          <span className="detail-label">Account:</span>
                          <span className="detail-value">{dropboxStatus.email}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Target Folder:</span>
                          <span className="detail-value">{dropboxStatus.targetFolder || 'My Documents'}</span>
                        </div>
                      </div>

                      <div className="settings-option">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={dropboxSyncEnabled}
                            onChange={(e) => onDropboxSyncToggle(e.target.checked)}
                          />
                          <span>Enable Dropbox Auto-Sync</span>
                        </label>
                        <p className="option-description">
                          Automatically sync your markdown files to Dropbox when they change
                        </p>
                      </div>

                      {/* Sync Folders Management */}
                      <div className="settings-subsection">
                        <h4 className="subsection-title">Synced Folders</h4>
                        <p className="option-description">
                          Select local folders to sync with Dropbox
                        </p>
                        
                        {syncFolders && syncFolders.length > 0 ? (
                          <div className="sync-folders-list">
                            {syncFolders.map((folder, index) => (
                              <div key={index} className="sync-folder-item">
                                <div className="folder-info">
                                  <span className="folder-icon">📁</span>
                                  <div className="folder-paths">
                                    <div className="local-path">{folder.localPath}</div>
                                    <div className="dropbox-path">→ {folder.dropboxPath}</div>
                                  </div>
                                </div>
                                <button
                                  className="remove-folder-btn"
                                  onClick={() => onRemoveSyncFolder(index)}
                                  title="Remove folder"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="settings-info">
                            <span>No folders configured for sync yet.</span>
                          </div>
                        )}
                        
                        <button 
                          className="add-folder-btn"
                          onClick={onAddSyncFolder}
                          disabled={!dropboxSyncEnabled}
                        >
                          + Add Folder to Sync
                        </button>
                      </div>

                      <button 
                        className="disconnect-btn"
                        onClick={onDropboxDisconnect}
                      >
                        Disconnect Dropbox
                      </button>
                    </>
                  )}
                </div>

                {/* Omakase Sync Section */}
                <div className="settings-section">
                  <h3>🎨 Omakase Theme Sync</h3>
                  
                  {loading ? (
                    <div className="settings-loading">
                      <RefreshCw size={16} className="spin" />
                      <span>Checking Omakase status...</span>
                    </div>
                  ) : omakaseStatus?.available ? (
                    <>
                      <div className="settings-info success">
                        <Check size={16} />
                        <span>Omakase detected!</span>
                      </div>
                      
                      <div className="settings-details">
                        <div className="detail-row">
                          <span className="detail-label">Current Theme:</span>
                          <span className="detail-value">{omakaseStatus.theme}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Current Font:</span>
                          <span className="detail-value">{omakaseStatus.font}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Mapped to:</span>
                          <span className="detail-value accent">{omakaseStatus.mappedTheme}</span>
                        </div>
                      </div>

                      <div className="settings-option">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={omakaseSyncEnabled}
                            onChange={(e) => onOmakaseSyncToggle(e.target.checked)}
                            disabled={plasmaSyncEnabled}
                          />
                          <span>Auto-sync with Omakase theme</span>
                        </label>
                        <p className="option-description">
                          Automatically update Docura's theme when Omakase theme changes (checks every 30 seconds)
                          {plasmaSyncEnabled && <span className="text-error"> • Disabled (Plasma sync is active)</span>}
                        </p>
                      </div>

                      <button 
                        className="sync-button"
                        onClick={onSyncNow}
                        disabled={!omakaseSyncEnabled}
                      >
                        <RefreshCw size={16} />
                        Sync Now
                      </button>
                    </>
                  ) : (
                    <div className="settings-info">
                      <span>Omakase not detected. Install <a href="https://omakase.app" target="_blank" rel="noopener noreferrer">Omakase</a> to enable theme synchronization.</span>
                    </div>
                  )}
                </div>

                {/* Plasma Sync Section */}
                <div className="settings-section">
                  <h3>🎨 KDE Plasma Theme Sync</h3>
                  
                  {loading ? (
                    <div className="settings-loading">
                      <RefreshCw size={16} className="spin" />
                      <span>Checking Plasma status...</span>
                    </div>
                  ) : plasmaStatus?.available ? (
                    <>
                      <div className="settings-info success">
                        <Check size={16} />
                        <span>KDE Plasma detected!</span>
                      </div>
                      
                      <div className="settings-details">
                        <div className="detail-row">
                          <span className="detail-label">Color Scheme:</span>
                          <span className="detail-value">{plasmaStatus.scheme}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Theme Mode:</span>
                          <span className="detail-value">{plasmaStatus.isDark ? 'Dark' : 'Light'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Mapped to:</span>
                          <span className="detail-value accent">{plasmaStatus.theme}</span>
                        </div>
                      </div>

                      <div className="settings-option">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={plasmaSyncEnabled}
                            onChange={(e) => onPlasmaSyncToggle(e.target.checked)}
                            disabled={omakaseSyncEnabled}
                          />
                          <span>Auto-sync with Plasma color scheme</span>
                        </label>
                        <p className="option-description">
                          Automatically update Docura's theme when Plasma color scheme changes (checks every 30 seconds)
                          {omakaseSyncEnabled && <span className="text-error"> • Disabled (Omakase sync is active)</span>}
                        </p>
                      </div>

                      <button 
                        className="sync-button"
                        onClick={onSyncNow}
                        disabled={!plasmaSyncEnabled}
                      >
                        <RefreshCw size={16} />
                        Sync Now
                      </button>
                    </>
                  ) : (
                    <div className="settings-info">
                      <span>KDE Plasma not detected. This feature is only available when running under KDE Plasma 5 or 6.</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Advanced/Editor Settings Tab */}
            {activeTab === 'advanced' && (
              <>
                <div className="settings-section">
                  <h3>📝 Editor</h3>
                  
                  <div className="settings-option">
                    <label className="setting-label">
                      Live Editor Type
                    </label>
                    <select
                      className="setting-select"
                      value={liveEditorType || 'modern'}
                      onChange={(e) => onLiveEditorTypeChange(e.target.value)}
                    >
                      <option value="classic">Classic (MDEditor)</option>
                      <option value="modern">Modern (Vditor - Typora-like)</option>
                    </select>
                    <p className="option-description">
                      Choose the editor for Live mode. Classic is the original split-pane editor, Modern provides a Typora-like WYSIWYG experience.
                    </p>
                  </div>

                  <div className="settings-option">
                    <label className="setting-label">
                      Default Indentation
                    </label>
                    <select
                      className="setting-select"
                      value={editorSettings?.indentation || '2'}
                      onChange={(e) => onEditorSettingsChange({ ...editorSettings, indentation: e.target.value })}
                    >
                      <option value="2">2 Spaces</option>
                      <option value="4">4 Spaces</option>
                      <option value="8">8 Spaces</option>
                      <option value="tab">Tab</option>
                    </select>
                    <p className="option-description">
                      Default indentation size for new documents
                    </p>
                  </div>

                  <div className="settings-option">
                    <label className="setting-label">
                      Line Ending
                    </label>
                    <select
                      className="setting-select"
                      value={editorSettings?.lineEnding || 'LF'}
                      onChange={(e) => onEditorSettingsChange({ ...editorSettings, lineEnding: e.target.value })}
                    >
                      <option value="LF">LF (Unix/Linux)</option>
                      <option value="CRLF">CRLF (Windows)</option>
                      <option value="CR">CR (Mac Classic)</option>
                    </select>
                    <p className="option-description">
                      Default line ending for new documents
                    </p>
                  </div>

                  <div className="settings-option">
                    <label className="setting-label">
                      Encoding
                    </label>
                    <select
                      className="setting-select"
                      value={editorSettings?.encoding || 'UTF-8'}
                      onChange={(e) => onEditorSettingsChange({ ...editorSettings, encoding: e.target.value })}
                    >
                      <option value="UTF-8">UTF-8</option>
                      <option value="UTF-16">UTF-16</option>
                      <option value="UTF-16LE">UTF-16LE</option>
                      <option value="UTF-16BE">UTF-16BE</option>
                      <option value="ISO-8859-1">ISO-8859-1 (Latin-1)</option>
                      <option value="Windows-1252">Windows-1252</option>
                    </select>
                    <p className="option-description">
                      Default character encoding for new documents. File-specific encoding is detected and shown in status bar.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="settings-footer">
          <button className="button-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsDialog

