import React, { useState, useRef, useEffect } from 'react'
import { 
  Menu as MenuIcon, 
  FolderOpen, 
  FileText, 
  Save, 
  Download, 
  FileDown, 
  Printer, 
  Settings,
  Palette,
  Maximize2,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'

const Menu = ({ 
  onOpenFolder,
  onOpenFile,
  onSave,
  onSaveAs,
  onExportPdf,
  onPrint,
  onOpenThemeSelector,
  onOpenSettings,
  onToggleFullscreen,
  onToggleSidebar,
  hasFile,
  isFullscreen,
  isSidebarVisible
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleMenuClick = (action) => {
    action()
    setIsOpen(false)
  }

  return (
    <div className="menu-container" ref={menuRef}>
      <button
        className="toolbar-button menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Menu"
      >
        <MenuIcon size={18} />
        <span>Menu</span>
      </button>

      {isOpen && (
        <div className="menu-dropdown">
          <div className="menu-section">
            <div className="menu-section-title">File</div>
            <button 
              className="menu-item" 
              onClick={() => handleMenuClick(onOpenFolder)}
            >
              <FolderOpen size={16} />
              <span>Open Folder</span>
              <span className="menu-shortcut">Ctrl+Shift+O</span>
            </button>
            <button 
              className="menu-item" 
              onClick={() => handleMenuClick(onOpenFile)}
            >
              <FileText size={16} />
              <span>Open File</span>
              <span className="menu-shortcut">Ctrl+O</span>
            </button>
            <div className="menu-divider"></div>
            <button 
              className="menu-item" 
              onClick={() => handleMenuClick(onSave)}
              disabled={!hasFile}
            >
              <Save size={16} />
              <span>Save</span>
              <span className="menu-shortcut">Ctrl+S</span>
            </button>
            <button 
              className="menu-item" 
              onClick={() => handleMenuClick(onSaveAs)}
            >
              <Download size={16} />
              <span>Save As</span>
              <span className="menu-shortcut">Ctrl+Shift+S</span>
            </button>
          </div>

          <div className="menu-divider"></div>

          <div className="menu-section">
            <div className="menu-section-title">Export</div>
            <button 
              className="menu-item" 
              onClick={() => handleMenuClick(onExportPdf)}
              disabled={!hasFile}
            >
              <FileDown size={16} />
              <span>Export to PDF</span>
            </button>
            <button 
              className="menu-item" 
              onClick={() => handleMenuClick(onPrint)}
              disabled={!hasFile}
            >
              <Printer size={16} />
              <span>Print</span>
            </button>
          </div>

          <div className="menu-divider"></div>

          <div className="menu-section">
            <div className="menu-section-title">View</div>
            <button 
              className="menu-item" 
              onClick={() => handleMenuClick(onToggleSidebar)}
            >
              {isSidebarVisible ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
              <span>{isSidebarVisible ? 'Hide' : 'Show'} Sidebar</span>
              <span className="menu-shortcut">Ctrl+B</span>
            </button>
            <button 
              className="menu-item" 
              onClick={() => handleMenuClick(onToggleFullscreen)}
            >
              <Maximize2 size={16} />
              <span>{isFullscreen ? 'Exit' : 'Enter'} Fullscreen</span>
              <span className="menu-shortcut">F11</span>
            </button>
            <div className="menu-divider"></div>
            <button 
              className="menu-item" 
              onClick={() => handleMenuClick(onOpenThemeSelector)}
            >
              <Palette size={16} />
              <span>Theme Gallery</span>
            </button>
          </div>

          <div className="menu-divider"></div>

          <div className="menu-section">
            <button 
              className="menu-item" 
              onClick={() => handleMenuClick(onOpenSettings)}
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Menu

