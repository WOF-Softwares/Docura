import React, { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs'
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'
import MainEditor from './components/MainEditor'
import ThemeSelector from './components/ThemeSelector'
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

  const exportToPdf = async () => {
    try {
      await invoke('export_to_pdf', { 
        content: fileContent,
        filename: currentFile || 'document.pdf'
      })
    } catch (error) {
      console.error('Error exporting to PDF:', error)
    }
  }

  const printDocument = async () => {
    try {
      await invoke('print_document', { content: fileContent })
    } catch (error) {
      console.error('Error printing document:', error)
    }
  }

  const extractHeaders = (content) => {
    const headerRegex = /^(#{1,6})\s+(.*)$/gm
    const headers = []
    let match

    while ((match = headerRegex.exec(content)) !== null) {
      headers.push({
        level: match[1].length,
        text: match[2],
        line: content.substring(0, match.index).split('\n').length
      })
    }

    setOutlineHeaders(headers)
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

  // Extract theme variant for UI components that need it
  const currentVariant = currentTheme.split('-')[1] || 'dark'

  return (
    <div className={`app`}>
      <Toolbar
        theme={currentVariant}
        onToggleTheme={toggleTheme}
        onOpenFolder={openFolder}
        onOpenFile={openFile}
        onSave={saveFile}
        onSaveAs={saveFileAs}
        onExportPdf={exportToPdf}
        onPrint={printDocument}
        onOpenThemeSelector={() => setIsThemeSelectorOpen(true)}
        hasFile={!!currentFile}
      />
      
      <div className="app-body">
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
        />
        
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
    </div>
  )
}

export default App