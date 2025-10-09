import React from 'react'
import { 
  Sun, 
  Moon, 
  FolderOpen, 
  File, 
  Save, 
  FileText, 
  Printer 
} from 'lucide-react'

const Toolbar = ({
  theme,
  onToggleTheme,
  onOpenFolder,
  onOpenFile,
  onSave,
  onSaveAs,
  onExportPdf,
  onPrint,
  hasFile
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <button
          className="toolbar-button"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
      
      <div className="toolbar-section">
        <button
          className="toolbar-button"
          onClick={onOpenFolder}
          title="Open Folder"
        >
          <FolderOpen size={16} />
          <span>Open Folder</span>
        </button>
        
        <button
          className="toolbar-button"
          onClick={onOpenFile}
          title="Open File"
        >
          <File size={16} />
          <span>Open File</span>
        </button>
      </div>
      
      <div className="toolbar-section">
        <button
          className="toolbar-button"
          onClick={onSave}
          disabled={!hasFile}
          title="Save"
        >
          <Save size={16} />
          <span>Save</span>
        </button>
        
        <button
          className="toolbar-button"
          onClick={onSaveAs}
          title="Save As"
        >
          <Save size={16} />
          <span>Save As</span>
        </button>
      </div>
      
      <div className="toolbar-section">
        <button
          className="toolbar-button"
          onClick={onExportPdf}
          disabled={!hasFile}
          title="Export to PDF"
        >
          <FileText size={16} />
          <span>Export PDF</span>
        </button>
        
        <button
          className="toolbar-button"
          onClick={onPrint}
          disabled={!hasFile}
          title="Print"
        >
          <Printer size={16} />
          <span>Print</span>
        </button>
      </div>
    </div>
  )
}

export default Toolbar