import React, { useEffect, useState } from 'react'
import { 
  Copy, 
  Scissors, 
  Clipboard,
  FileText,
  FolderOpen,
  Search,
  Settings,
  Palette
} from 'lucide-react'

const ContextMenu = ({ 
  x, 
  y, 
  onClose, 
  onNewFile,
  onOpenFile,
  onOpenFolder,
  onQuickOpen,
  onOpenSettings,
  onOpenThemeSelector,
  hasSelection,
  onCopy,
  onCut,
  onPaste
}) => {
  const [position, setPosition] = useState({ x, y })

  useEffect(() => {
    // Adjust position if menu would go off-screen
    const menuWidth = 250
    const menuHeight = 350
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    let adjustedX = x
    let adjustedY = y

    if (x + menuWidth > windowWidth) {
      adjustedX = windowWidth - menuWidth - 10
    }

    if (y + menuHeight > windowHeight) {
      adjustedY = windowHeight - menuHeight - 10
    }

    setPosition({ x: adjustedX, y: adjustedY })
  }, [x, y])

  const handleAction = (action) => {
    action()
    onClose()
  }

  return (
    <>
      <div className="context-menu-overlay" onClick={onClose} />
      <div 
        className="context-menu"
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px` 
        }}
      >
        {hasSelection && (
          <>
            <button 
              className="context-menu-item"
              onClick={() => handleAction(onCopy)}
            >
              <Copy size={16} />
              <span>Copy</span>
              <span className="context-menu-shortcut">Ctrl+C</span>
            </button>
            <button 
              className="context-menu-item"
              onClick={() => handleAction(onCut)}
            >
              <Scissors size={16} />
              <span>Cut</span>
              <span className="context-menu-shortcut">Ctrl+X</span>
            </button>
            <button 
              className="context-menu-item"
              onClick={() => handleAction(onPaste)}
            >
              <Clipboard size={16} />
              <span>Paste</span>
              <span className="context-menu-shortcut">Ctrl+V</span>
            </button>
            <div className="context-menu-divider" />
          </>
        )}
        
        <button 
          className="context-menu-item"
          onClick={() => handleAction(onNewFile)}
        >
          <FileText size={16} />
          <span>New File</span>
          <span className="context-menu-shortcut">Ctrl+N</span>
        </button>
        
        <button 
          className="context-menu-item"
          onClick={() => handleAction(onOpenFile)}
        >
          <FileText size={16} />
          <span>Open File...</span>
          <span className="context-menu-shortcut">Ctrl+O</span>
        </button>
        
        <button 
          className="context-menu-item"
          onClick={() => handleAction(onOpenFolder)}
        >
          <FolderOpen size={16} />
          <span>Open Folder...</span>
          <span className="context-menu-shortcut">Ctrl+Shift+O</span>
        </button>
        
        <button 
          className="context-menu-item"
          onClick={() => handleAction(onQuickOpen)}
        >
          <Search size={16} />
          <span>Quick Open</span>
          <span className="context-menu-shortcut">Ctrl+P</span>
        </button>
        
        <div className="context-menu-divider" />
        
        <button 
          className="context-menu-item"
          onClick={() => handleAction(onOpenThemeSelector)}
        >
          <Palette size={16} />
          <span>Change Theme</span>
        </button>
        
        <button 
          className="context-menu-item"
          onClick={() => handleAction(onOpenSettings)}
        >
          <Settings size={16} />
          <span>Settings</span>
          <span className="context-menu-shortcut">Ctrl+Shift+P</span>
        </button>
      </div>
    </>
  )
}

export default ContextMenu

