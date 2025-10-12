import React, { useState, useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { listen } from '@tauri-apps/api/event'
import { open, save } from '@tauri-apps/plugin-dialog'
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs'
import toast, { Toaster } from 'react-hot-toast'
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'
import MainEditor from './components/MainEditor'
import ThemeSelector from './components/ThemeSelector'
import PDFPreviewDialog from './components/PDFPreviewDialog'
import SettingsDialog from './components/SettingsDialog'
import FolderSwitchDialog from './components/FolderSwitchDialog'
import QuickOpenDialog from './components/QuickOpenDialog'
import ContextMenu from './components/ContextMenu'
import UnsavedChangesDialog from './components/UnsavedChangesDialog'
import RecoveryDialog from './components/RecoveryDialog'
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
  const [omakaseFont, setOmakaseFont] = useState(null)
  const [isFolderSwitchDialogOpen, setIsFolderSwitchDialogOpen] = useState(false)
  const [pendingFolderPath, setPendingFolderPath] = useState(null)
  const [recentItems, setRecentItems] = useState([])
  const [isQuickOpenVisible, setIsQuickOpenVisible] = useState(false)
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, hasSelection: false })
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [unsavedChangesDialog, setUnsavedChangesDialog] = useState({ visible: false, onSave: null, onDontSave: null })
  const [recoveryDialog, setRecoveryDialog] = useState({ visible: false, tempFile: null })
  const [currentTempId, setCurrentTempId] = useState(null) // Track temp file ID for unsaved files
  const [recoveryChecked, setRecoveryChecked] = useState(false) // Track if we've already checked for recovery
  const previewRef = useRef(null)
  const syncIntervalRef = useRef(null)
  const autoSaveTimeoutRef = useRef(null)
  const tempSaveTimeoutRef = useRef(null)
  const isQuittingRef = useRef(false) // Use ref instead of state for immediate access

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
    
    // Load recent items
    loadRecentItems()
    
    // Check for temp files (crash recovery) - ONLY ONCE on mount
    if (!recoveryChecked) {
      loadTempFilesOnStartup()
      setRecoveryChecked(true)
    }
    
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
    
    // Set up CLI event listeners (WINDOW-SPECIFIC)
    console.log('🎧 Setting up window-specific CLI event listeners...')
    const currentWindow = getCurrentWindow()
    let unlistenFolder, unlistenFile
    
    // Use window-specific listen instead of global listen
    currentWindow.listen('cli-open-folder', async (event) => {
      const folderPath = event.payload
      console.log('📁 CLI: Received cli-open-folder event:', folderPath)
      console.log('📁 Event details:', event)
      try {
        console.log('📂 Granting file scope...')
        await invoke('grant_file_scope', { filePath: folderPath })
        console.log('✅ File scope granted')
        
        console.log('📂 Setting current folder state...')
        setCurrentFolder(folderPath)
        
        console.log('📂 Getting folder files...')
        const folderFiles = await invoke('get_folder_files', { folderPath })
        console.log(`✅ Got ${folderFiles.length} files`)
        
        setFiles(folderFiles)
        toast.success(`Opened folder: ${folderPath.split('/').pop()}`)
      } catch (error) {
        console.error('❌ Error opening folder from CLI:', error)
        toast.error('Failed to open folder')
      }
    }).then(fn => { 
      unlistenFolder = fn
      console.log('✅ CLI folder listener registered for this window')
    })
    
    currentWindow.listen('cli-open-file', async (event) => {
      const filePath = event.payload
      console.log('📄 CLI: Opening file:', filePath)
      try {
        await invoke('grant_file_scope', { filePath })
        const content = await readTextFile(filePath)
        setCurrentFile(filePath)
        setFileContent(content)
        setOriginalContent(content)
        setIsEditing(true)
        extractHeaders(content)
        setCurrentFolder(null)
        const fileName = filePath.split('/').pop()
        setFiles([{ name: fileName, path: filePath, type: 'file' }])
        toast.success(`Opened: ${fileName}`)
      } catch (error) {
        console.error('Error opening file from CLI:', error)
        toast.error('Failed to open file')
      }
    }).then(fn => { unlistenFile = fn })
    
    // Cleanup
    return () => {
      if (unlistenFolder) unlistenFolder()
      if (unlistenFile) unlistenFile()
    }
  }, []) // Only run once on mount
  
  useEffect(() => {
    // Set up window close interceptor (prevent close if unsaved changes)
    const currentWindow = getCurrentWindow()
    let unlistenClose
    
    currentWindow.onCloseRequested(async (event) => {
      // If we're intentionally quitting via Ctrl+Q, don't show dialog again
      if (isQuittingRef.current) {
        console.log('✅ Quitting intentionally, allowing close')
        return // Allow close
      }
      
      // Check if there are unsaved changes
      if (hasUnsavedChanges && fileContent.trim() !== '' && isEditing) {
        // Prevent the window from closing
        event.preventDefault()
        
        console.log('🛑 Window close prevented - showing unsaved changes dialog')
        
        // Show unsaved changes dialog
        const choice = await showUnsavedChangesDialog()
        
        if (choice === 'saved' || choice === 'dont-save') {
          // User chose to save or discard - clean up temp file if exists
          if (currentTempId) {
            try {
              await invoke('delete_temp_file', { tempId: currentTempId })
              console.log('🗑️ Deleted temp file on app close')
            } catch (error) {
              console.error('Failed to delete temp file:', error)
            }
          }
          
          // Now close the window (unregister listener first to avoid recursion)
          if (unlistenClose) unlistenClose()
          await currentWindow.close()
        }
        // If 'cancelled', do nothing - window stays open
      }
      // If no unsaved changes, allow window to close normally
    }).then(fn => { 
      unlistenClose = fn
      console.log('✅ Window close listener registered')
    })
    
    // Cleanup
    return () => {
      if (unlistenClose) unlistenClose()
    }
  }, [hasUnsavedChanges, fileContent, currentTempId, isEditing]) // Re-register when these change (no isQuitting since it's a ref)
  
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
    // For new files (originalContent === ''), mark as unsaved if user has typed anything
    // For existing files, mark as unsaved if content changed
    if (fileContent !== originalContent) {
      // Has changes if: content differs AND (has content OR had original content)
      if (fileContent.trim() !== '' || originalContent !== '') {
        setHasUnsavedChanges(true)
      } else {
        // Both empty - no unsaved changes
        setHasUnsavedChanges(false)
      }
    } else {
      setHasUnsavedChanges(false)
    }
  }, [fileContent, originalContent])

  useEffect(() => {
    // Smart auto-save: debounced save after user stops typing
    if (autoSaveEnabled && currentFile && hasUnsavedChanges && fileContent !== '') {
      // Clear any pending auto-save
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
      
      // Set up new auto-save after 2 seconds of inactivity
      autoSaveTimeoutRef.current = setTimeout(async () => {
        try {
          setIsAutoSaving(true)
          await writeTextFile(currentFile, fileContent)
          setOriginalContent(fileContent)
          setHasUnsavedChanges(false)
          console.log('✅ Auto-saved:', currentFile)
          // Show a subtle toast
          toast.success('Auto-saved', {
            duration: 1500,
            icon: '💾',
          })
        } catch (error) {
          console.error('Auto-save failed:', error)
          toast.error('Auto-save failed')
        } finally {
          setIsAutoSaving(false)
        }
      }, 2000) // 2 seconds delay
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [autoSaveEnabled, currentFile, hasUnsavedChanges, fileContent, originalContent])

  useEffect(() => {
    // Temp file auto-save for untitled files (crash recovery)
    if (!currentFile && fileContent !== '' && isEditing) {
      // Clear any pending temp save
      if (tempSaveTimeoutRef.current) {
        clearTimeout(tempSaveTimeoutRef.current)
      }
      
      // Save to temp after 2 seconds of inactivity
      tempSaveTimeoutRef.current = setTimeout(async () => {
        try {
          const tempId = await invoke('save_temp_file', {
            content: fileContent,
            tempId: currentTempId
          })
          
          if (!currentTempId) {
            setCurrentTempId(tempId)
            console.log('💾 Created temp file:', tempId)
          } else {
            console.log('💾 Updated temp file:', tempId)
          }
        } catch (error) {
          console.error('Failed to save temp file:', error)
        }
      }, 2000)
    }
    
    return () => {
      if (tempSaveTimeoutRef.current) {
        clearTimeout(tempSaveTimeoutRef.current)
      }
    }
  }, [fileContent, currentFile, isEditing, currentTempId])

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
        await saveFile() // saveFile handles both cases: existing file or save as
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
      // Ctrl+N for new file
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault()
        await newFile()
      }
      // Ctrl+W for close current file
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault()
        await closeCurrentFile()
      }
      // Ctrl+Q or Super+Q for quit app
      if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
        e.preventDefault()
        await quitApp()
      }
      // Ctrl+Alt+P for print
      if (e.ctrlKey && e.altKey && e.key === 'p') {
        e.preventDefault()
        await handlePrint()
      }
      // Ctrl+E for export to PDF
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault()
        await handleExportToPdf()
      }
      // Ctrl+Shift+P for settings
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setIsSettingsOpen(true)
      }
      // Ctrl+P for quick open (only if not Shift or Alt)
      if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key === 'p') {
        e.preventDefault()
        setIsQuickOpenVisible(true)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentFile, hasUnsavedChanges, fileContent])

  useEffect(() => {
    // Handle right-click context menu
    const handleContextMenu = (e) => {
      // Allow default context menu in Monaco editor and MDEditor (contenteditable areas)
      const target = e.target
      const isEditor = target.closest('.monaco-editor') || 
                      target.closest('.w-md-editor-text') || 
                      target.closest('.w-md-editor-text-pre') ||
                      target.closest('.w-md-editor-text-input')
      
      if (isEditor) {
        // Allow default context menu in editor areas
        return
      }

      // Prevent default context menu everywhere else
      e.preventDefault()
      
      // Check if there's any selected text
      const selection = window.getSelection()
      const hasSelection = selection && selection.toString().length > 0
      
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        hasSelection
      })
    }

    // Close context menu on Escape key
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && contextMenu.visible) {
        setContextMenu({ ...contextMenu, visible: false })
      }
    }

    window.addEventListener('contextmenu', handleContextMenu)
    window.addEventListener('keydown', handleEscapeKey)
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
      window.removeEventListener('keydown', handleEscapeKey)
    }
  }, [contextMenu])

  useEffect(() => {
    // Apply unified theme to document
    const [themeName, variant] = currentTheme.split('-')
    document.documentElement.setAttribute('data-theme', currentTheme)
    document.documentElement.setAttribute('data-theme-base', themeName)
    document.documentElement.setAttribute('data-theme-variant', variant)
  }, [currentTheme])

  // Update sidebar filename for unsaved files based on content
  useEffect(() => {
    if (!currentFile && fileContent && files.length > 0 && files[0].isUntitled) {
      const smartName = getSmartFileName(fileContent)
      setFiles([{
        name: smartName,
        path: null,
        type: 'file',
        isUntitled: true
      }])
    }
  }, [fileContent, currentFile])

  const checkOmakase = async () => {
    const available = await isOmakaseEnvironment()
    setOmakaseAvailable(available)
    if (available) {
      console.log('🎨 Omarchy detected!')
      // Load sync preference from config
      try {
        const config = await invoke('load_config')
        if (config && config.omakase_sync !== undefined) {
          setOmakaseSyncEnabled(config.omakase_sync)
        }
      } catch (error) {
        console.error('Error loading Omarchy sync config:', error)
      }
      
      // Get Omarchy font
      try {
        const font = await invoke('get_omakase_font')
        if (font) {
          setOmakaseFont(font)
          console.log(`🔤 Using Omarchy font: ${font}`)
          // Apply font to editor
          applyEditorFont(font)
        }
      } catch (error) {
        console.log('No Omarchy font detected')
      }
    }
  }
  
  const applyEditorFont = (fontName) => {
    // Apply font to Monaco editor and markdown editor
    document.documentElement.style.setProperty('--editor-font', `"${fontName}", monospace`)
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
      if (config && config.auto_save !== undefined) {
        setAutoSaveEnabled(config.auto_save)
      }
    } catch (error) {
      console.error('Error loading config:', error)
    }
  }

  const saveAppConfig = async (newTheme, omakaseSync = omakaseSyncEnabled, autoSave = autoSaveEnabled) => {
    try {
      await invoke('save_config', {
        config: {
          theme: newTheme || currentTheme,
          omakase_sync: omakaseSync,
          auto_save: autoSave,
          recent_items: []
        }
      })
    } catch (error) {
      console.error('Error saving config:', error)
    }
  }

  const loadRecentItems = async () => {
    try {
      const items = await invoke('get_recent_items')
      setRecentItems(items)
    } catch (error) {
      console.error('Error loading recent items:', error)
    }
  }

  const addRecentItem = async (path, type) => {
    try {
      await invoke('add_recent_item', { path, itemType: type })
      await loadRecentItems()
    } catch (error) {
      console.error('Error adding recent item:', error)
    }
  }

  const clearRecentItems = async () => {
    try {
      await invoke('clear_recent_items')
      setRecentItems([])
      toast.success('Recent items cleared')
    } catch (error) {
      console.error('Error clearing recent items:', error)
      toast.error('Failed to clear recent items')
    }
  }

  const loadTempFilesOnStartup = async () => {
    try {
      const tempFiles = await invoke('load_temp_files')
      
      if (tempFiles && tempFiles.length > 0) {
        console.log(`🔄 Found ${tempFiles.length} unsaved file(s) from previous session`)
        
        // Get the most recent temp file
        const mostRecent = tempFiles[0]
        
        // Show recovery dialog instead of auto-recovering
        setRecoveryDialog({
          visible: true,
          tempFile: mostRecent,
          allTempFiles: tempFiles // Keep reference to all temp files for cleanup
        })
      }
    } catch (error) {
      console.error('Error loading temp files:', error)
    }
  }
  
  const handleRecoverWork = async () => {
    try {
      const { tempFile, allTempFiles } = recoveryDialog
      
      // Load the recovered content
      setCurrentTempId(tempFile.id)
      setFileContent(tempFile.content)
      setOriginalContent(tempFile.content)
      setIsEditing(true)
      extractHeaders(tempFile.content)
      
      // Add to sidebar
      setFiles([{
        name: getSmartFileName(tempFile.content),
        path: null,
        type: 'file',
        isUntitled: true
      }])
      
      // Delete the temp file (it's now being edited, will create new temp if needed)
      try {
        await invoke('delete_temp_file', { tempId: tempFile.id })
        console.log('🗑️ Deleted temp file after recovery')
      } catch (error) {
        console.error('Failed to delete temp file:', error)
      }
      
      // Clean up other old temp files
      if (allTempFiles && allTempFiles.length > 1) {
        for (let i = 1; i < allTempFiles.length; i++) {
          try {
            await invoke('delete_temp_file', { tempId: allTempFiles[i].id })
          } catch (error) {
            console.error('Failed to delete old temp file:', error)
          }
        }
      }
      
      // Close dialog
      setRecoveryDialog({ visible: false, tempFile: null })
      
      // Show success toast
      toast.success('✨ Work recovered successfully!', {
        duration: 3000,
        icon: '📂',
      })
    } catch (error) {
      console.error('Error recovering work:', error)
      toast.error('Failed to recover work')
    }
  }
  
  const handleDiscardRecovery = async () => {
    try {
      const { allTempFiles } = recoveryDialog
      
      // Delete all temp files
      if (allTempFiles && allTempFiles.length > 0) {
        for (const tempFile of allTempFiles) {
          try {
            await invoke('delete_temp_file', { tempId: tempFile.id })
            console.log('🗑️ Deleted temp file:', tempFile.id)
          } catch (error) {
            console.error('Failed to delete temp file:', error)
          }
        }
      }
      
      // Close dialog
      setRecoveryDialog({ visible: false, tempFile: null })
      
      console.log('❌ User chose to discard recovered work')
    } catch (error) {
      console.error('Error discarding recovery:', error)
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

  // Extract smart filename from content
  const getSmartFileName = (content) => {
    if (!content || !content.trim()) return 'Untitled'
    
    // Try H1 header first
    const h1Match = content.match(/^#\s+(.+)$/m)
    if (h1Match && h1Match[1]) {
      const title = h1Match[1].trim()
      return title.length > 30 ? title.substring(0, 30) + '...' : title
    }
    
    // Fallback: First line
    const firstLine = content.split('\n')[0].trim()
    if (firstLine) {
      // Remove markdown symbols
      const cleanLine = firstLine.replace(/^[#\-*>\s]+/, '').trim()
      if (cleanLine) {
        return cleanLine.length > 30 ? cleanLine.substring(0, 30) + '...' : cleanLine
      }
    }
    
    return 'Untitled'
  }

  // Helper function to show unsaved changes dialog
  const showUnsavedChangesDialog = () => {
    return new Promise((resolve) => {
      setUnsavedChangesDialog({
        visible: true,
        onSave: async () => {
          setUnsavedChangesDialog({ visible: false, onSave: null, onDontSave: null })
          if (!currentFile) {
            await saveFileAs()
            resolve(currentFile ? 'saved' : 'cancelled')
          } else {
            await saveFile()
            resolve('saved')
          }
        },
        onDontSave: () => {
          setUnsavedChangesDialog({ visible: false, onSave: null, onDontSave: null })
          resolve('dont-save')
        },
        onCancel: () => {
          setUnsavedChangesDialog({ visible: false, onSave: null, onDontSave: null })
          resolve('cancelled')
        }
      })
    })
  }

  const newFile = async () => {
    try {
      // If there's unsaved content, prompt to save first
      if (hasUnsavedChanges && fileContent.trim() !== '') {
        const choice = await showUnsavedChangesDialog()
        
        if (choice === 'cancelled') {
          return // User cancelled, don't create new file
        }
      }
      
      // Delete old temp file if exists
      if (currentTempId) {
        try {
          await invoke('delete_temp_file', { tempId: currentTempId })
        } catch (error) {
          console.error('Failed to delete temp file:', error)
        }
      }
      
      // Clear editor and state
      setCurrentFile(null)
      setCurrentTempId(null)
      setFileContent('')
      setOriginalContent('')
      setDisplayContent('')
      setHasUnsavedChanges(false)
      setIsEditing(true)
      setOutlineHeaders([])
      
      // Add "Untitled" to sidebar (will update as user types)
      setFiles([{
        name: 'Untitled',
        path: null,
        type: 'file',
        isUntitled: true
      }])
      
      toast.success('New file created')
    } catch (error) {
      console.error('Error creating new file:', error)
      toast.error('Failed to create new file')
    }
  }

  const closeCurrentFile = async () => {
    try {
      // If there's unsaved content, prompt to save first
      if (hasUnsavedChanges && fileContent.trim() !== '') {
        const choice = await showUnsavedChangesDialog()
        
        if (choice === 'cancelled') {
          return // User cancelled, keep file open
        }
      }
      
      // Delete temp file if exists
      if (currentTempId) {
        try {
          await invoke('delete_temp_file', { tempId: currentTempId })
          console.log('🗑️ Deleted temp file on close')
        } catch (error) {
          console.error('Failed to delete temp file:', error)
        }
      }
      
      // Clear editor and state (back to welcome screen)
      setCurrentFile(null)
      setCurrentTempId(null)
      setFileContent('')
      setOriginalContent('')
      setDisplayContent('')
      setHasUnsavedChanges(false)
      setIsEditing(false)
      setOutlineHeaders([])
      
      // Keep folder/files in sidebar if folder is open
      if (!currentFolder) {
        setFiles([])
      }
      
      toast.success('File closed')
    } catch (error) {
      console.error('Error closing file:', error)
      toast.error('Failed to close file')
    }
  }

  const quitApp = async () => {
    try {
      // Only show dialog if there's actually unsaved content
      if (hasUnsavedChanges && fileContent.trim() !== '' && isEditing) {
        const choice = await showUnsavedChangesDialog()
        
        if (choice === 'cancelled') {
          return // User cancelled, don't quit
        }
        
        // If user chose to save or discard, clean up temp file
        if (currentTempId) {
          try {
            await invoke('delete_temp_file', { tempId: currentTempId })
            console.log('🗑️ Deleted temp file on quit')
          } catch (error) {
            console.error('Failed to delete temp file:', error)
          }
        }
      } else {
        // No unsaved changes, just clean up temp file if exists
        if (currentTempId) {
          try {
            await invoke('delete_temp_file', { tempId: currentTempId })
            console.log('🗑️ Deleted temp file on quit')
          } catch (error) {
            console.error('Failed to delete temp file:', error)
          }
        }
      }
      
      // Set flag to bypass window close handler (using ref for immediate access)
      isQuittingRef.current = true
      console.log('🚪 Quitting app...')
      
      // Now close the window - close handler will see isQuittingRef.current = true and allow it
      const window = getCurrentWindow()
      await window.close()
    } catch (error) {
      console.error('Error quitting app:', error)
      // Reset flag on error
      isQuittingRef.current = false
      toast.error('Failed to quit app')
    }
  }

  const openFolder = async () => {
    try {
      // Check for unsaved changes first
      if (hasUnsavedChanges && fileContent.trim() !== '') {
        const choice = await showUnsavedChangesDialog()
        
        if (choice === 'cancelled') {
          return // User cancelled, don't open folder
        }
      }
      
      const selected = await open({
        directory: true,
        multiple: false,
      })
      
      if (selected) {
        // If a folder is already open, ask user what to do
        if (currentFolder) {
          setPendingFolderPath(selected)
          setIsFolderSwitchDialogOpen(true)
          return
        }
        
        // Open folder directly
        await openFolderDirect(selected)
      }
    } catch (error) {
      console.error('Error opening folder:', error)
      toast.error('Failed to open folder')
    }
  }
  
  const openFolderDirect = async (folderPath) => {
    try {
      console.log('📁 Opening folder:', folderPath)
      
      // Grant file system scope for the folder
      try {
        await invoke('grant_file_scope', { filePath: folderPath })
        console.log('✅ File scope granted')
      } catch (scopeError) {
        console.warn('⚠️ Failed to grant file scope:', scopeError)
      }
      
      console.log('📂 Getting folder files...')
      const folderFiles = await invoke('get_folder_files', { 
        folderPath 
      })
      console.log(`📄 Found ${folderFiles.length} files`)
      
      setCurrentFolder(folderPath)
      setFiles(folderFiles)
      
      // Add to recent items
      await addRecentItem(folderPath, 'folder')
      
      toast.success(`Opened folder: ${folderPath.split('/').pop()}`)
    } catch (error) {
      console.error('❌ Error opening folder:', error)
      console.error('Error details:', error.message, error.stack)
      toast.error(`Failed to open folder: ${error.message || error}`)
    }
  }
  
  const handleFolderSwitchChoice = async (choice) => {
    if (choice === 'new-window') {
      // Open in new window
      try {
        await invoke('open_new_window', { folderPath: pendingFolderPath })
        toast.success('Opening in new window...')
      } catch (error) {
        console.error('Error opening new window:', error)
        toast.error('Failed to open new window')
      }
    } else if (choice === 'replace') {
      // Replace current folder
      await openFolderDirect(pendingFolderPath)
    }
    // Close dialog and reset
    setIsFolderSwitchDialogOpen(false)
    setPendingFolderPath(null)
  }

  const openFile = async () => {
    try {
      // Check for unsaved changes first
      if (hasUnsavedChanges && fileContent.trim() !== '') {
        const choice = await showUnsavedChangesDialog()
        
        if (choice === 'cancelled') {
          return // User cancelled, don't open file
        }
      }
      
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
        
        // Clean up temp file if switching from untitled
        if (currentTempId) {
          try {
            await invoke('delete_temp_file', { tempId: currentTempId })
            console.log('🗑️ Deleted temp file when opening new file')
          } catch (error) {
            console.error('Failed to delete temp file:', error)
          }
          setCurrentTempId(null)
        }
        
        setCurrentFile(selected)
        setFileContent(content)
        setOriginalContent(content)
        setIsEditing(true)
        extractHeaders(content)
        
        // Clear folder state (switching to single file mode)
        setCurrentFolder(null)
        
        // Show just this file in the sidebar
        const fileName = selected.split('/').pop()
        setFiles([{
          name: fileName,
          path: selected,
          type: 'file'
        }])
        
        // Add to recent items
        await addRecentItem(selected, 'file')
        
        toast.success(`Opened: ${selected.split('/').pop()}`)
      }
    } catch (error) {
      console.error('Error opening file:', error)
      toast.error('Failed to open file')
    }
  }

  const saveFile = async () => {
    // If no file is open, use Save As instead
    if (!currentFile) {
      toast('Please choose where to save your file 📝', {
        icon: '💾',
        duration: 2000,
      })
      await saveFileAs()
      return
    }
    
    if (fileContent !== undefined) {
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
      // Extract first # header from markdown content as suggested filename
      let suggestedFileName = 'untitled.md'
      
      if (fileContent && fileContent.trim()) {
        // Find first # header (h1)
        const headerMatch = fileContent.match(/^#\s+(.+)$/m)
        if (headerMatch && headerMatch[1]) {
          // Clean the header to make it a valid filename
          let cleanName = headerMatch[1]
            .trim()
            .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
            .replace(/\s+/g, '-') // Replace spaces with dashes
            .toLowerCase()
            .substring(0, 50) // Limit length
          
          if (cleanName) {
            suggestedFileName = `${cleanName}.md`
          }
        }
      }
      
      const selected = await save({
        filters: [
          {
            name: 'Markdown',
            extensions: ['md']
          }
        ],
        defaultPath: suggestedFileName
      })
      
      if (selected) {
        await writeTextFile(selected, fileContent)
        
        // Delete temp file if exists (now that we've saved permanently)
        if (currentTempId) {
          try {
            await invoke('delete_temp_file', { tempId: currentTempId })
            console.log('🗑️ Deleted temp file after permanent save')
          } catch (error) {
            console.error('Failed to delete temp file:', error)
          }
          setCurrentTempId(null)
        }
        
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
      // Check for unsaved changes first
      if (hasUnsavedChanges && fileContent.trim() !== '') {
        const choice = await showUnsavedChangesDialog()
        
        if (choice === 'cancelled') {
          return // User cancelled, don't switch files
        }
      }
      
      // Grant file system scope for the file's directory
      try {
        await invoke('grant_file_scope', { filePath })
      } catch (scopeError) {
        console.warn('Failed to grant file scope:', scopeError)
      }
      
      const content = await readTextFile(filePath)
      
      // Clean up temp file if switching from untitled
      if (currentTempId) {
        try {
          await invoke('delete_temp_file', { tempId: currentTempId })
          console.log('🗑️ Deleted temp file when switching files')
        } catch (error) {
          console.error('Failed to delete temp file:', error)
        }
        setCurrentTempId(null)
      }
      
      setCurrentFile(filePath)
      setFileContent(content)
      setOriginalContent(content)
      setIsEditing(true)
      extractHeaders(content)
      
      // Add to recent items
      await addRecentItem(filePath, 'file')
      
      const fileName = filePath.split('/').pop()
      toast.success(`Opened: ${fileName}`)
    } catch (error) {
      console.error('Error reading file:', error)
      toast.error('Failed to open file')
    }
  }
  
  const openRecentItem = async (item) => {
    try {
      // Check for unsaved changes first
      if (hasUnsavedChanges && fileContent.trim() !== '') {
        const choice = await showUnsavedChangesDialog()
        
        if (choice === 'cancelled') {
          return // User cancelled
        }
      }
      
      if (item.type === 'folder') {
        // Check if a folder is already open
        if (currentFolder) {
          setPendingFolderPath(item.path)
          setIsFolderSwitchDialogOpen(true)
        } else {
          await openFolderDirect(item.path)
        }
      } else {
        // Open file
        await invoke('grant_file_scope', { filePath: item.path })
        const content = await readTextFile(item.path)
        
        // Clean up temp file if switching from untitled
        if (currentTempId) {
          try {
            await invoke('delete_temp_file', { tempId: currentTempId })
            console.log('🗑️ Deleted temp file when opening recent item')
          } catch (error) {
            console.error('Failed to delete temp file:', error)
          }
          setCurrentTempId(null)
        }
        
        setCurrentFile(item.path)
        setFileContent(content)
        setOriginalContent(content)
        setIsEditing(true)
        extractHeaders(content)
        setCurrentFolder(null)
        
        const fileName = item.path.split('/').pop()
        setFiles([{
          name: fileName,
          path: item.path,
          type: 'file'
        }])
        
        // Add to recent items (moves it to top)
        await addRecentItem(item.path, 'file')
        
        toast.success(`Opened: ${fileName}`)
      }
    } catch (error) {
      console.error('Error opening recent item:', error)
      toast.error('Failed to open item')
    }
  }

  const handleQuickOpenFile = async (filePath) => {
    try {
      // Check for unsaved changes first
      if (hasUnsavedChanges && fileContent.trim() !== '') {
        const choice = await showUnsavedChangesDialog()
        
        if (choice === 'cancelled') {
          return // User cancelled, keep quick open dialog open
        }
      }
      
      // Grant file system scope
      await invoke('grant_file_scope', { filePath })
      
      // Read file content
      const content = await readTextFile(filePath)
      
      // Clean up temp file if switching from untitled
      if (currentTempId) {
        try {
          await invoke('delete_temp_file', { tempId: currentTempId })
          console.log('🗑️ Deleted temp file when opening from quick search')
        } catch (error) {
          console.error('Failed to delete temp file:', error)
        }
        setCurrentTempId(null)
      }
      
      setCurrentFile(filePath)
      setFileContent(content)
      setOriginalContent(content)
      setIsEditing(true)
      extractHeaders(content)
      
      // Add to recent items
      await addRecentItem(filePath, 'file')
      
      const fileName = filePath.split('/').pop()
      toast.success(`Opened: ${fileName}`)
    } catch (error) {
      console.error('Error opening file from quick open:', error)
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
        toast.success(`Synced with Omarchy: ${newTheme}`)
      }
    })
    
    // Also sync font if available
    try {
      const font = await invoke('get_omakase_font')
      if (font && font !== omakaseFont) {
        setOmakaseFont(font)
        applyEditorFont(font)
        console.log(`🔤 Updated Omarchy font: ${font}`)
      }
    } catch (error) {
      // Font not available, that's okay
    }
    
    setTimeout(() => setIsSyncing(false), 500)
    
    if (!success) {
      console.log('Omarchy sync failed or theme unchanged')
    }
  }
  
  const handleOmakaseSyncToggle = (enabled) => {
    setOmakaseSyncEnabled(enabled)
    saveAppConfig(currentTheme, enabled, autoSaveEnabled)
    
    if (enabled) {
      toast.success('Omarchy auto-sync enabled')
      // Sync immediately when enabled
      handleOmakaseSync()
    } else {
      toast('Omarchy auto-sync disabled')
    }
  }

  const handleAutoSaveToggle = (enabled) => {
    setAutoSaveEnabled(enabled)
    saveAppConfig(currentTheme, omakaseSyncEnabled, enabled)
    
    if (enabled) {
      toast.success('Auto-save enabled')
    } else {
      toast('Auto-save disabled', {
        icon: '⏸️',
      })
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

  // Context menu handlers
  const handleContextMenuCopy = () => {
    document.execCommand('copy')
  }

  const handleContextMenuCut = () => {
    document.execCommand('cut')
  }

  const handleContextMenuPaste = () => {
    document.execCommand('paste')
  }

  // Extract theme variant for UI components that need it
  const currentVariant = currentTheme.split('-')[1] || 'dark'

  return (
    <div className={`app`}>
      {!isFullscreen && (
      <Toolbar
        theme={currentVariant}
        onToggleTheme={toggleTheme}
        onNewFile={newFile}
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
        recentItems={recentItems}
        onOpenRecentItem={openRecentItem}
        onClearRecentItems={clearRecentItems}
        onOpenQuickSearch={() => setIsQuickOpenVisible(true)}
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
        autoSaveEnabled={autoSaveEnabled}
        onAutoSaveToggle={handleAutoSaveToggle}
      />

      <FolderSwitchDialog
        isOpen={isFolderSwitchDialogOpen}
        currentFolder={currentFolder}
        newFolder={pendingFolderPath}
        onChoice={handleFolderSwitchChoice}
      />

      <QuickOpenDialog
        isOpen={isQuickOpenVisible}
        onClose={() => setIsQuickOpenVisible(false)}
        files={files}
        recentItems={recentItems}
        onSelectFile={handleQuickOpenFile}
        currentFolder={currentFolder}
      />

      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          hasSelection={contextMenu.hasSelection}
          onClose={() => setContextMenu({ ...contextMenu, visible: false })}
          onNewFile={newFile}
          onOpenFile={openFile}
          onOpenFolder={openFolder}
          onQuickOpen={() => setIsQuickOpenVisible(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenThemeSelector={() => setIsThemeSelectorOpen(true)}
          onCopy={handleContextMenuCopy}
          onCut={handleContextMenuCut}
          onPaste={handleContextMenuPaste}
        />
      )}

      <UnsavedChangesDialog
        isOpen={unsavedChangesDialog.visible}
        onSave={unsavedChangesDialog.onSave}
        onDontSave={unsavedChangesDialog.onDontSave}
        onCancel={unsavedChangesDialog.onCancel}
        fileName={currentFile ? currentFile.split('/').pop() : 'Untitled'}
      />

      <RecoveryDialog
        isOpen={recoveryDialog.visible}
        onRecover={handleRecoverWork}
        onDiscard={handleDiscardRecovery}
        fileName={recoveryDialog.tempFile ? getSmartFileName(recoveryDialog.tempFile.content) : 'Untitled'}
        preview={recoveryDialog.tempFile ? recoveryDialog.tempFile.content.substring(0, 200) : ''}
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