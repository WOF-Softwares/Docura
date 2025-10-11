import React, { useState, useEffect } from 'react'
import { X, Check, RefreshCw } from 'lucide-react'
import { getOmakaseStatus } from '../utils/omakaseSync'

const SettingsDialog = ({ 
  isOpen, 
  onClose, 
  omakaseSyncEnabled, 
  onOmakaseSyncToggle,
  onSyncNow 
}) => {
  const [omakaseStatus, setOmakaseStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadOmakaseStatus()
    }
  }, [isOpen])

  const loadOmakaseStatus = async () => {
    setLoading(true)
    const status = await getOmakaseStatus()
    setOmakaseStatus(status)
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

        <div className="settings-content">
          {/* Omakase Sync Section */}
          <div className="settings-section">
            <h3>🎨 Omakase Integration</h3>
            
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
                    />
                    <span>Auto-sync with Omakase theme</span>
                  </label>
                  <p className="option-description">
                    Automatically update Docura's theme when Omakase theme changes (checks every 30 seconds)
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

          {/* Future settings sections */}
          <div className="settings-section">
            <h3>⚙️ General</h3>
            <p className="coming-soon">More settings coming soon...</p>
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

