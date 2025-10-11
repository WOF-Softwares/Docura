import React, { useState, useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { open } from '@tauri-apps/plugin-dialog'
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs'
import toast, { Toaster } from 'react-hot-toast'
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'
import MainEditor from './components/MainEditor'
import ThemeSelector from './components/ThemeSelector'
import PDFPreviewDialog from './components/PDFPreviewDialog'
import SettingsDialog from './components/SettingsDialog'
import { exportToPDF, generatePDFBlob } from './utils/pdfExport'
import { convertMarkdownImagePaths } from './utils/imagePathConverter'
import { isOmakaseEnvironment, syncWithOmakase } from './utils/omakaseSync'
import './styles/App.css'
import './styles/ThemeSelector.css'
import './styles/markdown-themes.css'

function App() {
  const [currentTheme, setCurrentTheme] = useState('dracula-dark') // Unified theme state
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false)
  const [currentFile, setCurrentFile] = useState(null)
  const [currentFolder, setCurrentFolder] = useState(null)
  const [files, setFiles] = useState([])
  const [fileContent, setFileContent] = useState('')
  const [displayContent, setDisplayContent] = useState('') // Content with converted image paths for display
  const [originalContent, setOriginalContent] = useState('') // Track original content for unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('code') // 'code' or 'preview'
  const [outlineHeaders, setOutlineHeaders] = useState([])
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false)
  const [pdfBlob, setPdfBlob] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [omakaseAvailable, setOmakaseAvailable] = useState(false)
  const [omakaseSyncEnabled, setOmakaseSyncEnabled] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const previewRef = useRef(null)
  const syncIntervalRef = useRef(null)

  // Available themes for random cycling
  const availableThemes = [
    'dracula-dark', 'dracula-light',
    'cappuccino-dark', 'cappuccino-light', 
    'nord-dark', 'nord-light',
    'solarized-dark', 'solarized-light',
    'monokai-dark', 'monokai-light',
    'github-dark', 'github-light'
  ]

  useEffect(() => {
    // Load config on mount
    loadAppConfig()
    
    // Check if running in tiling WM
    invoke('is_tiling_wm').then((isTiling) => {
      if (isTiling) {
        console.log('🪟 Running in tiling window manager - titlebar hidden')
      } else {
        console.log('🪟 Running in standard window manager')
      }
    }).catch(err => console.error('Error checking WM:', err))
    
    // Check for Omakase
    checkOmakase()
  }, [])
  
  useEffect(() => {
    // Setup Omakase sync interval if enabled
    if (omakaseSyncEnabled && omakaseAvailable) {
      console.log('🎨 Starting Omakase auto-sync (every 30 seconds)')
      
      // Sync immediately
      handleOmakaseSync()
      
      // Then sync every 30 seconds
      syncIntervalRef.current = setInterval(() => {
        handleOmakaseSync()
      }, 30000)
      
      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current)
          console.log('🎨 Stopped Omakase auto-sync')
        }
      }
    }
  }, [omakaseSyncEnabled, omakaseAvailable])

  useEffect(() => {
    // Track unsaved changes
    if (originalContent !== '' && fileContent !== originalContent) {
      setHasUnsavedChanges(true)
    } else {
      setHasUnsavedChanges(false)
    }
  }, [fileContent, originalContent])

  useEffect(() => {
    // Convert image paths when content or file changes
    const updateDisplayContent = async () => {
      if (currentFile && fileContent) {
        const converted = await convertMarkdownImagePaths(fileContent, currentFile)
        setDisplayContent(converted)
      } else {
        setDisplayContent(fileContent)
      }
    }
    updateDisplayContent()
  }, [fileContent, currentFile])

  useEffect(() => {
    // Add keyboard shortcuts
    const handleKeyDown = async (e) => {
      // F11 for fullscreen
      if (e.key === 'F11') {
        e.preventDefault()
        try {
          const window = getCurrentWindow()
          const isCurrentlyFullscreen = await window.isFullscreen()
          await window.setFullscreen(!isCurrentlyFullscreen)
          setIsFullscreen(!isCurrentlyFullscreen)
        } catch (error) {
          console.error('Error toggling fullscreen:', error)
        }
      }
      // Ctrl+B for sidebar toggle
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault()
        setIsSidebarVisible(prev => !prev)
      }
      // Ctrl+S for save
      if (e.ctrlKey && !e.shiftKey && e.key === 's') {
        e.preventDefault()
        if (currentFile) {
          await saveFile()
        } else {
          toast.error('No file open to save')
        }
      }
      // Ctrl+Shift+S for save as
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        await saveFileAs()
      }
      // Ctrl+O for open file
      if (e.ctrlKey && !e.shiftKey && e.key === 'o') {
        e.preventDefault()
        await openFile()
      }
      // Ctrl+Shift+O for open folder
      if (e.ctrlKey && e.shiftKey && e.key === 'O') {
        e.preventDefault()
        await openFolder()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentFile])

  useEffect(() => {
    // Apply unified theme to document
    const [themeName, variant] = currentTheme.split('-')
    document.documentElement.setAttribute('data-theme', currentTheme)
    document.documentElement.setAttribute('data-theme-base', themeName)
    document.documentElement.setAttribute('data-theme-variant', variant)
  }, [currentTheme])

  const checkOmakase = async () => {
    const available = await isOmakaseEnvironment()
    setOmakaseAvailable(available)
    if (available) {
      console.log('🎨 Omakase detected!')
      // Load sync preference from config
      try {
        const config = await invoke('load_config')
        if (config && config.omakase_sync !== undefined) {
          setOmakaseSyncEnabled(config.omakase_sync)
        }
      } catch (error) {
        console.error('Error loading Omakase sync config:', error)
      }
    }
  }

  const loadAppConfig = async () => {
    try {
      const config = await invoke('load_config')
      if (config && config.theme) {
        setCurrentTheme(config.theme)
      }
      if (config && config.omakase_sync !== undefined) {
        setOmakaseSyncEnabled(config.omakase_sync)
      }
    } catch (error) {
      console.error('Error loading config:', error)
    }
  }

  const saveAppConfig = async (newTheme, omakaseSync = omakaseSyncEnabled) => {
    try {
      await invoke('save_config', {
        config: {
          theme: newTheme || currentTheme,
          omakase_sync: omakaseSync,
          recent_files: []
        }
      })
    } catch (error) {
      console.error('Error saving config:', error)
    }
  }

  const toggleTheme = () => {
    // Check if Omakase sync is enabled
    if (omakaseSyncEnabled && omakaseAvailable) {
      toast.error('Please disable Omakase sync first to manually change themes', {
        duration: 4000,
        icon: '🎨',
      })
      return
    }
    
    // Get a random theme from available themes, but different from current
    const otherThemes = availableThemes.filter(theme => theme !== currentTheme)
    const randomTheme = otherThemes[Math.floor(Math.random() * otherThemes.length)]
    setCurrentTheme(randomTheme)
    saveAppConfig(randomTheme)
  }

  const openFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      })
      
      if (selected) {
        // Grant file system scope for the folder
        try {
          await invoke('grant_file_scope', { filePath: selected })
        } catch (scopeError) {
          console.warn('Failed to grant file scope:', scopeError)
        }
        
        setCurrentFolder(selected)
        const folderFiles = await invoke('get_folder_files', { 
          folderPath: selected 
        })
        setFiles(folderFiles)
        toast.success(`Opened folder: ${selected.split('/').pop()}`)
      }
    } catch (error) {
      console.error('Error opening folder:', error)
      toast.error('Failed to open folder')
    }
  }

  const openFile = async () => {
    try {
      const selected = await open({
        filters: [
          {
            name: 'Markdown',
            extensions: ['md', 'markdown', 'mdown', 'mkdn', 'mdx']
          }
        ]
      })
      
      if (selected) {
        // Grant file system scope for the file's directory
        try {
          await invoke('grant_file_scope', { filePath: selected })
        } catch (scopeError) {
          console.warn('Failed to grant file scope:', scopeError)
        }
        
        const content = await readTextFile(selected)
        setCurrentFile(selected)
        setFileContent(content)
        setOriginalContent(content)
        setIsEditing(true)
        extractHeaders(content)
        
        // If no folder is open, add this file to the sidebar
        if (!currentFolder) {
          const fileName = selected.split('/').pop()
          setFiles([{
            name: fileName,
            path: selected,
            type: 'file'
          }])
        }
        
        toast.success(`Opened: ${selected.split('/').pop()}`)
      }
    } catch (error) {
      console.error('Error opening file:', error)
      toast.error('Failed to open file')
    }
  }

  const saveFile = async () => {
    if (currentFile && fileContent) {
      try {
        await writeTextFile(currentFile, fileContent)
        setOriginalContent(fileContent) // Update original content after save
        setHasUnsavedChanges(false)
        const fileName = currentFile.split('/').pop()
        toast.success(`Saved: ${fileName}`)
      } catch (error) {
        console.error('Error saving file:', error)
        toast.error('Failed to save file')
      }
    }
  }

  const saveFileAs = async () => {
    try {
      const selected = await open({
        filters: [
          {
            name: 'Markdown',
            extensions: ['md']
          }
        ],
        defaultPath: 'untitled.md'
      })
      
      if (selected) {
        await writeTextFile(selected, fileContent)
        setCurrentFile(selected)
        setOriginalContent(fileContent)
        setHasUnsavedChanges(false)
        const fileName = selected.split('/').pop()
        toast.success(`Saved as: ${fileName}`)
        
        // If no folder is open, update the file in sidebar
        if (!currentFolder) {
          setFiles([{
            name: fileName,
            path: selected,
            type: 'file'
          }])
        }
      }
    } catch (error) {
      console.error('Error saving file as:', error)
      toast.error('Failed to save file')
    }
  }

  const handleExportToPdf = async () => {
    try {
      console.log('Export PDF clicked, current tab:', activeTab)
      
      // Switch to preview mode if not already there
      if (activeTab === 'code') {
        alert('Please switch to Preview or Live mode to export PDF')
        return
      }

      // Wait a moment for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Get the preview element
      let previewElement = document.querySelector('.wmde-markdown')
      
      console.log('Preview element found:', previewElement)
      
      if (!previewElement) {
        console.error('No preview element found!')
        alert('Could not find preview. Please make sure you are in Preview or Live mode.')
        return
      }

      // Get filename from current file or use default
      const filename = currentFile 
        ? currentFile.split('/').pop().replace(/\.(md|markdown)$/i, '.pdf')
        : 'document.pdf'

      console.log('Exporting to:', filename)

      // Export to PDF (will show save dialog)
      const result = await exportToPDF(previewElement, filename)
      
      if (result) {
        console.log('PDF exported successfully!')
        toast.success('PDF exported successfully!')
      } else {
        console.log('Export cancelled')
      }
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      toast.error(`Failed to export PDF: ${error.message}`)
    }
  }

  const handlePrint = async () => {
    try {
      console.log('Print clicked, current tab:', activeTab)
      
      // Switch to preview mode if not already there
      if (activeTab === 'code') {
        alert('Please switch to Preview or Live mode to print')
        return
      }

      // Wait a moment for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Get the preview element
      let previewElement = document.querySelector('.wmde-markdown')
      
      console.log('Preview element for print:', previewElement)
      
      if (!previewElement) {
        console.error('No preview element found!')
        alert('Could not find preview. Please make sure you are in Preview or Live mode.')
        return
      }

      console.log('Generating PDF blob...')
      // Generate PDF blob for preview
      const blob = await generatePDFBlob(previewElement)
      console.log('PDF blob generated:', blob)
      setPdfBlob(blob)
      setIsPDFPreviewOpen(true)
    } catch (error) {
      console.error('Error generating PDF preview:', error)
      alert(`Failed to generate print preview: ${error.message}`)
    }
  }

  const extractHeaders = (content) => {
    const headerRegex = /^(#{1,6})\s+(.*)$/gm
    const headers = []
    let match

    while ((match = headerRegex.exec(content)) !== null) {
      const text = match[2]
      const id = text.toLowerCase().replace(/[^\w]+/g, '-')
      headers.push({
        level: match[1].length,
        text: text,
        id: id,
        line: content.substring(0, match.index).split('\n').length
      })
    }

    setOutlineHeaders(headers)
  }

  const handleHeaderClick = (header) => {
    // Switch to preview mode if not already there
    if (activeTab !== 'preview') {
      setActiveTab('preview')
    }
    
    // Use setTimeout to ensure the preview is rendered before scrolling
    setTimeout(() => {
      const element = document.getElementById(header.id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const selectFile = async (filePath) => {
    try {
      // Grant file system scope for the file's directory
      try {
        await invoke('grant_file_scope', { filePath })
      } catch (scopeError) {
        console.warn('Failed to grant file scope:', scopeError)
      }
      
      const content = await readTextFile(filePath)
      setCurrentFile(filePath)
      setFileContent(content)
      setOriginalContent(content)
      setIsEditing(true)
      extractHeaders(content)
      const fileName = filePath.split('/').pop()
      toast.success(`Opened: ${fileName}`)
    } catch (error) {
      console.error('Error reading file:', error)
      toast.error('Failed to open file')
    }
  }

  const onContentChange = (newContent) => {
    setFileContent(newContent)
    extractHeaders(newContent)
  }

  const handleThemeChange = (newTheme) => {
    // Check if Omakase sync is enabled
    if (omakaseSyncEnabled && omakaseAvailable) {
      toast.error('Omakase sync is enabled. Please disable it in Settings to manually change themes.', {
        duration: 4000,
        icon: '🎨',
      })
      return
    }
    
    setCurrentTheme(newTheme)
    saveAppConfig(newTheme)
  }
  
  const handleOmakaseSync = async () => {
    if (!omakaseAvailable) return
    
    setIsSyncing(true)
    const success = await syncWithOmakase((newTheme) => {
      if (newTheme !== currentTheme) {
        setCurrentTheme(newTheme)
        saveAppConfig(newTheme)
        toast.success(`Synced with Omakase: ${newTheme}`)
      }
    })
    
    setTimeout(() => setIsSyncing(false), 500)
    
    if (!success) {
      console.log('Omakase sync failed or theme unchanged')
    }
  }
  
  const handleOmakaseSyncToggle = (enabled) => {
    setOmakaseSyncEnabled(enabled)
    saveAppConfig(currentTheme, enabled)
    
    if (enabled) {
      toast.success('Omakase auto-sync enabled')
      // Sync immediately when enabled
      handleOmakaseSync()
    } else {
      toast('Omakase auto-sync disabled')
    }
  }

  const toggleFullscreen = async () => {
    try {
      const window = getCurrentWindow()
      const isCurrentlyFullscreen = await window.isFullscreen()
      await window.setFullscreen(!isCurrentlyFullscreen)
      setIsFullscreen(!isCurrentlyFullscreen)
    } catch (error) {
      console.error('Error toggling fullscreen:', error)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev)
  }

  // Extract theme variant for UI components that need it
  const currentVariant = currentTheme.split('-')[1] || 'dark'

  return (
    <div className={`app`}>
      {!isFullscreen && (
      <Toolbar
        theme={currentVariant}
        onToggleTheme={toggleTheme}
        onOpenFolder={openFolder}
        onOpenFile={openFile}
        onSave={saveFile}
        onSaveAs={saveFileAs}
        onExportPdf={handleExportToPdf}
        onPrint={handlePrint}
        onOpenThemeSelector={() => setIsThemeSelectorOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasFile={!!currentFile}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        onToggleSidebar={toggleSidebar}
        isSidebarVisible={isSidebarVisible}
        omakaseAvailable={omakaseAvailable}
        omakaseSyncEnabled={omakaseSyncEnabled}
        onOmakaseSync={handleOmakaseSync}
        isSyncing={isSyncing}
      />
      )}
      
      <div className="app-body">
        {isSidebarVisible && !isFullscreen && (
          <Sidebar
            currentFolder={currentFolder}
            files={files}
            outlineHeaders={outlineHeaders}
            onSelectFile={selectFile}
            onRefreshFiles={() => {
              if (currentFolder) {
                invoke('get_folder_files', { folderPath: currentFolder })
                  .then(setFiles)
              }
            }}
            onHeaderClick={handleHeaderClick}
            currentFile={currentFile}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        )}
        
        <MainEditor
          fileContent={fileContent}
          displayContent={displayContent}
          onContentChange={onContentChange}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentFile={currentFile}
          isEditing={isEditing}
          markdownTheme={currentTheme}
        />
      </div>

      <ThemeSelector
        isOpen={isThemeSelectorOpen}
        onClose={() => setIsThemeSelectorOpen(false)}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        omakaseSyncEnabled={omakaseSyncEnabled && omakaseAvailable}
      />

      <PDFPreviewDialog
        isOpen={isPDFPreviewOpen}
        onClose={() => setIsPDFPreviewOpen(false)}
        pdfBlob={pdfBlob}
        filename={currentFile ? currentFile.split('/').pop().replace(/\.(md|markdown)$/i, '.pdf') : 'document.pdf'}
      />

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        omakaseSyncEnabled={omakaseSyncEnabled}
        onOmakaseSyncToggle={handleOmakaseSyncToggle}
        onSyncNow={handleOmakaseSync}
      />

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          },
          success: {
            iconTheme: {
              primary: 'var(--accent-color)',
              secondary: 'var(--bg-secondary)',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'var(--bg-secondary)',
            },
          },
        }}
      />
    </div>
  )
}

export default App