import React, { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs'
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'
import MainEditor from './components/MainEditor'
import './styles/App.css'

function App() {
  const [theme, setTheme] = useState('light')
  const [currentFile, setCurrentFile] = useState(null)
  const [currentFolder, setCurrentFolder] = useState(null)
  const [files, setFiles] = useState([])
  const [fileContent, setFileContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('code') // 'code' or 'preview'
  const [outlineHeaders, setOutlineHeaders] = useState([])

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
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

  return (
    <div className={`app ${theme}`}>
      <Toolbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenFolder={openFolder}
        onOpenFile={openFile}
        onSave={saveFile}
        onSaveAs={saveFileAs}
        onExportPdf={exportToPdf}
        onPrint={printDocument}
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
        />
      </div>
    </div>
  )
}

export default App