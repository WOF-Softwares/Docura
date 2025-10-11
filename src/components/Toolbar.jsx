import React from 'react'
import { 
  Shuffle, 
  FolderOpen, 
  File, 
  Save, 
  FileText, 
  Printer,
  Palette,
  Maximize,
  Minimize,
  PanelLeftClose,
  PanelLeft
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
  onOpenThemeSelector,
  hasFile,
  onToggleFullscreen,
  isFullscreen,
  onToggleSidebar,
  isSidebarVisible
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <button
          className="toolbar-button"
          onClick={onToggleTheme}
          title="Switch to random theme"
        >
          <Shuffle size={16} />
          <span>Random</span>
        </button>
        
        <button
          className="toolbar-button"
          onClick={onOpenThemeSelector}
          title="Choose specific theme"
        >
          <Palette size={16} />
          <span>Themes</span>
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
      
      <div className="toolbar-section">
        <button
          className="toolbar-button"
          onClick={onToggleSidebar}
          title={`${isSidebarVisible ? 'Hide' : 'Show'} Sidebar (Ctrl+B)`}
        >
          {isSidebarVisible ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
          <span>Sidebar</span>
        </button>
        
        <button
          className="toolbar-button"
          onClick={onToggleFullscreen}
          title={`${isFullscreen ? 'Exit' : 'Enter'} Fullscreen (F11)`}
        >
          {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          <span>Fullscreen</span>
        </button>
      </div>
    </div>
  )
}

export default Toolbar