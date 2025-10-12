import React from 'react'
import { Save, X, AlertCircle } from 'lucide-react'

const UnsavedChangesDialog = ({ 
  isOpen, 
  onSave, 
  onDontSave, 
  onCancel,
  fileName 
}) => {
  if (!isOpen) return null

  return (
    <div className="unsaved-changes-overlay" onClick={onCancel}>
      <div className="unsaved-changes-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="unsaved-changes-header">
          <AlertCircle size={24} className="text-accent" />
          <h2>Unsaved Changes</h2>
        </div>

        <div className="unsaved-changes-content">
          <p className="unsaved-changes-message">
            Do you want to save changes to <strong>{fileName || 'Untitled'}</strong>?
          </p>
          <p className="unsaved-changes-hint">
            Your changes will be lost if you don't save them.
          </p>
        </div>

        <div className="unsaved-changes-actions">
          <button 
            className="unsaved-button unsaved-button-save"
            onClick={onSave}
          >
            <Save size={16} />
            Save
          </button>
          <button 
            className="unsaved-button unsaved-button-dont-save"
            onClick={onDontSave}
          >
            <X size={16} />
            Don't Save
          </button>
          <button 
            className="unsaved-button unsaved-button-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnsavedChangesDialog

