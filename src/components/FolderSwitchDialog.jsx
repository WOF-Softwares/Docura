import React from 'react'
import { Monitor, X, RefreshCw } from 'lucide-react'

const FolderSwitchDialog = ({ isOpen, currentFolder, newFolder, onChoice }) => {
  if (!isOpen) return null

  return (
    <div className="folder-switch-overlay" onClick={() => onChoice('cancel')}>
      <div className="folder-switch-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="folder-switch-header">
          <h2>📁 Open New Folder?</h2>
          <button className="close-button" onClick={() => onChoice('cancel')}>
            <X size={20} />
          </button>
        </div>
        
        <div className="folder-switch-content">
          <p className="folder-switch-message">
            You already have <strong>{currentFolder?.split('/').pop()}</strong> open.
            <br />
            How would you like to proceed?
          </p>
          
          <div className="folder-switch-options">
            <button 
              className="folder-switch-option primary"
              onClick={() => onChoice('new-window')}
            >
              <Monitor size={24} />
              <div className="option-text">
                <span className="option-title">Open in New Window</span>
                <span className="option-hint">Keep both folders open</span>
              </div>
            </button>
            
            <button 
              className="folder-switch-option secondary"
              onClick={() => onChoice('replace')}
            >
              <RefreshCw size={24} />
              <div className="option-text">
                <span className="option-title">Replace This Folder</span>
                <span className="option-hint">Close current folder</span>
              </div>
            </button>
          </div>
        </div>
        
        <div className="folder-switch-footer">
          <button className="button-secondary" onClick={() => onChoice('cancel')}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default FolderSwitchDialog

