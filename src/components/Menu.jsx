import React, { useState, useRef, useEffect } from "react";
import {
  Menu as MenuIcon,
  FilePlus,
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
  PanelLeftOpen,
  Clock,
  Folder,
  File,
  Trash2,
  ChevronRight,
  FileType,
  Code,
  Globe,
  FileJson,
  AlignLeft,
  Newspaper,
  Cloud,
} from "lucide-react";

const Menu = ({
  onNewFile,
  onOpenFolder,
  onOpenFile,
  onSave,
  onSaveAs,
  onExportPdf,
  onExportHtml,
  onExportHtmlPlain,
  onExportHtmlTailwind,
  onExportHtmlBootstrap,
  onExportJson,
  onExportRtf,
  onExportMediaWiki,
  onPrint,
  onOpenThemeSelector,
  onOpenSettings,
  onToggleFullscreen,
  onToggleSidebar,
  hasFile,
  isFullscreen,
  isSidebarVisible,
  recentItems,
  onOpenRecentItem,
  onClearRecentItems,
  onOpenFromDropbox,
  dropboxConnected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecentSubmenuOpen, setIsRecentSubmenuOpen] = useState(false);
  const [isExportSubmenuOpen, setIsExportSubmenuOpen] = useState(false);
  const menuRef = useRef(null);
  const recentSubmenuRef = useRef(null);
  const exportSubmenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsRecentSubmenuOpen(false);
        setIsExportSubmenuOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close submenu when main menu closes
  useEffect(() => {
    if (!isOpen) {
      setIsRecentSubmenuOpen(false);
      setIsExportSubmenuOpen(false);
    }
  }, [isOpen]);

  const handleMenuClick = (action) => {
    action();
    setIsOpen(false);
    setIsRecentSubmenuOpen(false);
    setIsExportSubmenuOpen(false);
  };

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
              onClick={() => handleMenuClick(onNewFile)}
            >
              <FilePlus size={16} />
              <span>New File</span>
              <span className="menu-shortcut">Ctrl+N</span>
            </button>
            <div className="menu-divider"></div>
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
            <button
              className="menu-item"
              onClick={() => handleMenuClick(onOpenFromDropbox)}
              disabled={!dropboxConnected}
            >
              <Cloud size={16} />
              <span>Open from Dropbox</span>
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
            <div
              className="menu-item menu-item-submenu"
              onMouseEnter={() => setIsRecentSubmenuOpen(true)}
              onMouseLeave={() => setIsRecentSubmenuOpen(false)}
            >
              <Clock size={16} />
              <span>Recent</span>
              <ChevronRight size={16} className="submenu-arrow" />

              {isRecentSubmenuOpen && (
                <div className="menu-submenu" ref={recentSubmenuRef}>
                  {recentItems && recentItems.length > 0 ? (
                    <>
                      <div className="menu-submenu-items">
                        {recentItems.map((item, index) => (
                          <button
                            key={index}
                            className="menu-item recent-item"
                            onClick={() =>
                              handleMenuClick(() => onOpenRecentItem(item))
                            }
                            title={item.path}
                          >
                            {item.type === "folder" ? (
                              <Folder size={14} />
                            ) : (
                              <File size={14} />
                            )}
                            <span className="recent-item-name">
                              {item.name}
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="menu-divider"></div>
                      <button
                        className="menu-item"
                        onClick={() => handleMenuClick(onClearRecentItems)}
                      >
                        <Trash2 size={14} />
                        <span>Clear Recent</span>
                      </button>
                    </>
                  ) : (
                    <div
                      className="menu-item"
                      style={{ opacity: 0.5, cursor: "default" }}
                    >
                      <span>No recent items</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="menu-divider"></div>

          <div className="menu-section">
            <div
              className="menu-item menu-item-submenu"
              onMouseEnter={() => setIsExportSubmenuOpen(true)}
              onMouseLeave={() => setIsExportSubmenuOpen(false)}
            >
              <Download size={16} />
              <span>Export</span>
              <ChevronRight size={16} className="submenu-arrow" />

              {isExportSubmenuOpen && (
                <div className="menu-submenu" ref={exportSubmenuRef}>
                  <div className="menu-submenu-items">
                    <button
                      className="menu-item"
                      onClick={() => handleMenuClick(onExportPdf)}
                      disabled={!hasFile}
                    >
                      <FileDown size={14} />
                      <span>PDF</span>
                      <span className="menu-shortcut">Ctrl+E</span>
                    </button>
                    <div className="menu-divider"></div>
                    <button
                      className="menu-item"
                      onClick={() => handleMenuClick(onExportHtml)}
                      disabled={!hasFile}
                    >
                      <Globe size={14} />
                      <span>HTML</span>
                    </button>
                    <button
                      className="menu-item"
                      onClick={() => handleMenuClick(onExportHtmlPlain)}
                      disabled={!hasFile}
                    >
                      <FileType size={14} />
                      <span>HTML (Plain)</span>
                    </button>
                    <button
                      className="menu-item"
                      onClick={() => handleMenuClick(onExportHtmlTailwind)}
                      disabled={!hasFile}
                    >
                      <Code size={14} />
                      <span>HTML with Tailwind CSS</span>
                    </button>
                    <button
                      className="menu-item"
                      onClick={() => handleMenuClick(onExportHtmlBootstrap)}
                      disabled={!hasFile}
                    >
                      <Globe size={14} />
                      <span>HTML with Bootstrap</span>
                    </button>
                    <div className="menu-divider"></div>
                    <button
                      className="menu-item"
                      onClick={() => handleMenuClick(onExportJson)}
                      disabled={!hasFile}
                    >
                      <FileJson size={14} />
                      <span>JSON</span>
                    </button>
                    <button
                      className="menu-item"
                      onClick={() => handleMenuClick(onExportRtf)}
                      disabled={!hasFile}
                    >
                      <AlignLeft size={14} />
                      <span>RTF</span>
                    </button>
                    <button
                      className="menu-item"
                      onClick={() => handleMenuClick(onExportMediaWiki)}
                      disabled={!hasFile}
                    >
                      <Newspaper size={14} />
                      <span>MediaWiki</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              className="menu-item"
              onClick={() => handleMenuClick(onPrint)}
              disabled={!hasFile}
            >
              <Printer size={16} />
              <span>Print</span>
              <span className="menu-shortcut">Ctrl+Alt+P</span>
            </button>
          </div>

          <div className="menu-divider"></div>

          <div className="menu-section">
            <div className="menu-section-title">View</div>
            <button
              className="menu-item"
              onClick={() => handleMenuClick(onToggleSidebar)}
            >
              {isSidebarVisible ? (
                <PanelLeftClose size={16} />
              ) : (
                <PanelLeftOpen size={16} />
              )}
              <span>{isSidebarVisible ? "Hide" : "Show"} Sidebar</span>
              <span className="menu-shortcut">Ctrl+B</span>
            </button>
            <button
              className="menu-item"
              onClick={() => handleMenuClick(onToggleFullscreen)}
            >
              <Maximize2 size={16} />
              <span>{isFullscreen ? "Exit" : "Enter"} Fullscreen</span>
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
              <span className="menu-shortcut">Ctrl+Shift+P</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
