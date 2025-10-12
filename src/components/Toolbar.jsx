import React from 'react'
import { 
  Shuffle, 
  RefreshCw,
  Maximize,
  Minimize,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react'
import Menu from './Menu'

const Toolbar = ({
  theme,
  onToggleTheme,
  onNewFile,
  onOpenFolder,
  onOpenFile,
  onSave,
  onSaveAs,
  onExportPdf,
  onPrint,
  onOpenThemeSelector,
  onOpenSettings,
  hasFile,
  onToggleFullscreen,
  isFullscreen,
  onToggleSidebar,
  isSidebarVisible,
  omakaseAvailable,
  omakaseSyncEnabled,
  onOmakaseSync,
  isSyncing,
  recentItems,
  onOpenRecentItem,
  onClearRecentItems
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <Menu
          onNewFile={onNewFile}
          onOpenFolder={onOpenFolder}
          onOpenFile={onOpenFile}
          onSave={onSave}
          onSaveAs={onSaveAs}
          onExportPdf={onExportPdf}
          onPrint={onPrint}
          onOpenThemeSelector={onOpenThemeSelector}
          onOpenSettings={onOpenSettings}
          onToggleFullscreen={onToggleFullscreen}
          onToggleSidebar={onToggleSidebar}
          hasFile={hasFile}
          isFullscreen={isFullscreen}
          isSidebarVisible={isSidebarVisible}
          recentItems={recentItems}
          onOpenRecentItem={onOpenRecentItem}
          onClearRecentItems={onClearRecentItems}
        />
      </div>
      
      <div className="toolbar-section">
        <button
          className="toolbar-button"
          onClick={onToggleTheme}
          title="Switch to random theme"
        >
          <Shuffle size={16} />
          <span>Random</span>
        </button>
        
        {omakaseAvailable && omakaseSyncEnabled && (
          <button
            className={`omakase-sync-button ${isSyncing ? 'syncing' : ''}`}
            onClick={onOmakaseSync}
            title="Sync with Omakase theme"
          >
            <RefreshCw size={16} />
            <span>Omakase</span>
          </button>
        )}
      </div>
      
      <div className="toolbar-section" style={{ marginLeft: 'auto' }}>
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