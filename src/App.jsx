import React, { useState, useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { open } from '@tauri-apps/plugin-dialog'
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs'
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'
import MainEditor from './components/MainEditor'
import ThemeSelector from './components/ThemeSelector'
import PDFPreviewDialog from './components/PDFPreviewDialog'
import { exportToPDF, generatePDFBlob } from './utils/pdfExport'
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
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('code') // 'code' or 'preview'
  const [outlineHeaders, setOutlineHeaders] = useState([])
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false)
  const [pdfBlob, setPdfBlob] = useState(null)
  const previewRef = useRef(null)

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
  }, [])

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
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    // Apply unified theme to document
    const [themeName, variant] = currentTheme.split('-')
    document.documentElement.setAttribute('data-theme', currentTheme)
    document.documentElement.setAttribute('data-theme-base', themeName)
    document.documentElement.setAttribute('data-theme-variant', variant)
  }, [currentTheme])

  const loadAppConfig = async () => {
    try {
      const config = await invoke('load_config')
      if (config && config.theme) {
        setCurrentTheme(config.theme)
      }
    } catch (error) {
      console.error('Error loading config:', error)
    }
  }

  const saveAppConfig = async (newTheme) => {
    try {
      await invoke('save_config', {
        config: {
          theme: newTheme,
          recent_files: []
        }
      })
    } catch (error) {
      console.error('Error saving config:', error)
    }
  }

  const toggleTheme = () => {
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
        setCurrentFolder(selected)
        const folderFiles = await invoke('get_folder_files', { 
          folderPath: selected 
        })
        setFiles(folderFiles)
      }
    } catch (error) {
      console.error('Error opening folder:', error)
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
        const content = await readTextFile(selected)
        setCurrentFile(selected)
        setFileContent(content)
        setIsEditing(true)
        extractHeaders(content)
      }
    } catch (error) {
      console.error('Error opening file:', error)
    }
  }

  const saveFile = async () => {
    if (currentFile && fileContent) {
      try {
        await writeTextFile(currentFile, fileContent)
        console.log('File saved successfully')
      } catch (error) {
        console.error('Error saving file:', error)
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
        console.log('File saved as:', selected)
      }
    } catch (error) {
      console.error('Error saving file as:', error)
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
        alert('PDF exported successfully!')
      } else {
        console.log('Export cancelled')
      }
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      alert(`Failed to export PDF: ${error.message}`)
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
      const content = await readTextFile(filePath)
      setCurrentFile(filePath)
      setFileContent(content)
      setIsEditing(true)
      extractHeaders(content)
    } catch (error) {
      console.error('Error reading file:', error)
    }
  }

  const onContentChange = (newContent) => {
    setFileContent(newContent)
    extractHeaders(newContent)
  }

  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme)
    saveAppConfig(newTheme)
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
        hasFile={!!currentFile}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        onToggleSidebar={toggleSidebar}
        isSidebarVisible={isSidebarVisible}
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
          />
        )}
        
        <MainEditor
          fileContent={fileContent}
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
      />

      <PDFPreviewDialog
        isOpen={isPDFPreviewOpen}
        onClose={() => setIsPDFPreviewOpen(false)}
        pdfBlob={pdfBlob}
        filename={currentFile ? currentFile.split('/').pop().replace(/\.(md|markdown)$/i, '.pdf') : 'document.pdf'}
      />
    </div>
  )
}

export default App