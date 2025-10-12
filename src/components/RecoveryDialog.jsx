import React from 'react'
import { RotateCcw, Trash2, X } from 'lucide-react'

const RecoveryDialog = ({ isOpen, onRecover, onDiscard, fileName, preview }) => {
  if (!isOpen) return null

  return (
    <div className="recovery-overlay" onClick={onDiscard}>
      <div className="recovery-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="recovery-header">
          <RotateCcw size={20} color="var(--accent-color)" />
          <h2>Unsaved Work Found</h2>
        </div>
        
        <div className="recovery-content">
          <p className="recovery-message">
            Docura found unsaved work from your previous session.
          </p>
          
          {preview && (
            <div className="recovery-preview">
              <div className="recovery-preview-label">Preview:</div>
              <div className="recovery-preview-content">
                {preview}
              </div>
            </div>
          )}
          
          <p className="recovery-question">
            Would you like to recover this work?
          </p>
        </div>
        
        <div className="recovery-actions">
          <button className="recovery-button recovery-button-discard" onClick={onDiscard}>
            <Trash2 size={16} />
            No, Delete It
          </button>
          <button className="recovery-button recovery-button-recover" onClick={onRecover}>
            <RotateCcw size={16} />
            Yes, Recover
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecoveryDialog

