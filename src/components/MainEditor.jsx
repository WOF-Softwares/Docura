import React, { useEffect, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import MDEditor from '@uiw/react-md-editor'
import VditorEditor from './VditorEditor'
import { Code, Eye, Edit3 } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import toast from 'react-hot-toast'
import { makeCheckboxesInteractive, toggleCheckboxByText, extractCheckboxes } from '../utils/checkboxHandler'
import WelcomeScreen from './WelcomeScreen'

// Monaco theme configurations
const monacoThemes = {
  'dracula-dark': {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ff79c6' },
      { token: 'string', foreground: 'f1fa8c' },
      { token: 'number', foreground: 'bd93f9' },
      { token: 'type', foreground: '8be9fd' },
    ],
    colors: {
      'editor.background': '#282a36',
      'editor.foreground': '#f8f8f2',
      'editor.lineHighlightBackground': '#44475a',
      'editor.selectionBackground': '#44475a',
      'editorCursor.foreground': '#f8f8f2',
      'editorLineNumber.foreground': '#6272a4',
    }
  },
  'dracula-light': {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ff79c6' },
      { token: 'string', foreground: 'f1fa8c' },
    ],
    colors: {
      'editor.background': '#f8f8f2',
      'editor.foreground': '#282a36',
      'editor.lineHighlightBackground': '#e6e6e6',
      'editor.selectionBackground': '#d4d4d4',
      'editorCursor.foreground': '#282a36',
      'editorLineNumber.foreground': '#6272a4',
    }
  },
  'cappuccino-dark': {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '939293', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ff6188' },
      { token: 'string', foreground: 'ffd866' },
      { token: 'number', foreground: 'ab9df2' },
      { token: 'type', foreground: '78dce8' },
    ],
    colors: {
      'editor.background': '#2d2a2e',
      'editor.foreground': '#e2e2e3',
      'editor.lineHighlightBackground': '#403e41',
      'editor.selectionBackground': '#403e41',
      'editorCursor.foreground': '#e2e2e3',
      'editorLineNumber.foreground': '#939293',
    }
  },
  'cappuccino-light': {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6e6a86', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'b4637a' },
      { token: 'string', foreground: 'ea9d34' },
    ],
    colors: {
      'editor.background': '#faf4ed',
      'editor.foreground': '#575279',
      'editor.lineHighlightBackground': '#f2e9e1',
      'editor.selectionBackground': '#e9ddd2',
      'editorCursor.foreground': '#575279',
      'editorLineNumber.foreground': '#6e6a86',
    }
  },
  'nord-dark': {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '4c566a', fontStyle: 'italic' },
      { token: 'keyword', foreground: '81a1c1' },
      { token: 'string', foreground: 'a3be8c' },
      { token: 'number', foreground: 'b48ead' },
      { token: 'type', foreground: '88c0d0' },
    ],
    colors: {
      'editor.background': '#2e3440',
      'editor.foreground': '#eceff4',
      'editor.lineHighlightBackground': '#3b4252',
      'editor.selectionBackground': '#434c5e',
      'editorCursor.foreground': '#eceff4',
      'editorLineNumber.foreground': '#4c566a',
    }
  },
  'nord-light': {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '4c566a', fontStyle: 'italic' },
      { token: 'keyword', foreground: '5e81ac' },
      { token: 'string', foreground: 'a3be8c' },
    ],
    colors: {
      'editor.background': '#eceff4',
      'editor.foreground': '#2e3440',
      'editor.lineHighlightBackground': '#e5e9f0',
      'editor.selectionBackground': '#d8dee9',
      'editorCursor.foreground': '#2e3440',
      'editorLineNumber.foreground': '#4c566a',
    }
  },
  'solarized-dark': {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '586e75', fontStyle: 'italic' },
      { token: 'keyword', foreground: '859900' },
      { token: 'string', foreground: '2aa198' },
      { token: 'number', foreground: 'd33682' },
      { token: 'type', foreground: '268bd2' },
    ],
    colors: {
      'editor.background': '#002b36',
      'editor.foreground': '#839496',
      'editor.lineHighlightBackground': '#073642',
      'editor.selectionBackground': '#073642',
      'editorCursor.foreground': '#839496',
      'editorLineNumber.foreground': '#586e75',
    }
  },
  'solarized-light': {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '93a1a1', fontStyle: 'italic' },
      { token: 'keyword', foreground: '859900' },
      { token: 'string', foreground: '2aa198' },
    ],
    colors: {
      'editor.background': '#fdf6e3',
      'editor.foreground': '#657b83',
      'editor.lineHighlightBackground': '#eee8d5',
      'editor.selectionBackground': '#eee8d5',
      'editorCursor.foreground': '#657b83',
      'editorLineNumber.foreground': '#93a1a1',
    }
  },
  'monokai-dark': {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'f92672' },
      { token: 'string', foreground: 'e6db74' },
      { token: 'number', foreground: 'ae81ff' },
      { token: 'type', foreground: '66d9ef' },
    ],
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#f8f8f2',
      'editor.lineHighlightBackground': '#3e3d32',
      'editor.selectionBackground': '#49483e',
      'editorCursor.foreground': '#f8f8f2',
      'editorLineNumber.foreground': '#75715e',
    }
  },
  'monokai-light': {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'f92672' },
      { token: 'string', foreground: 'a6e22e' },
    ],
    colors: {
      'editor.background': '#fafafa',
      'editor.foreground': '#272822',
      'editor.lineHighlightBackground': '#f0f0f0',
      'editor.selectionBackground': '#e6e6e6',
      'editorCursor.foreground': '#272822',
      'editorLineNumber.foreground': '#75715e',
    }
  },
  'github-dark': {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ff7b72' },
      { token: 'string', foreground: 'a5d6ff' },
      { token: 'number', foreground: '79c0ff' },
      { token: 'type', foreground: 'ffa657' },
    ],
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#f0f6fc',
      'editor.lineHighlightBackground': '#161b22',
      'editor.selectionBackground': '#21262d',
      'editorCursor.foreground': '#f0f6fc',
      'editorLineNumber.foreground': '#8b949e',
    }
  },
  'github-light': {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '656d76', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'cf222e' },
      { token: 'string', foreground: '0a3069' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#24292f',
      'editor.lineHighlightBackground': '#f6f8fa',
      'editor.selectionBackground': '#f1f3f4',
      'editorCursor.foreground': '#24292f',
      'editorLineNumber.foreground': '#656d76',
    }
  },
}

const MainEditor = ({
  fileContent,
  displayContent,
  onContentChange,
  activeTab,
  onTabChange,
  currentFile,
  isEditing,
  markdownTheme,
  recentItems,
  onOpenFolder,
  onOpenFile,
  onNewFile,
  onOpenRecentItem,
  onCursorPositionChange,
  onOpenThemeSelector
}) => {
  const monacoRef = useRef(null)
  const editorRef = useRef(null) // Reference to the editor instance
  const previewRef = useRef(null)
  const livePreviewRef = useRef(null)
  const fileContentRef = useRef(fileContent) // Use ref to avoid recreating callback
  const theme = document.documentElement.getAttribute('data-theme')
  
  // Update ref when fileContent changes
  useEffect(() => {
    fileContentRef.current = fileContent
  }, [fileContent])

  // Register Monaco themes
  useEffect(() => {
    if (monacoRef.current) {
      const monaco = monacoRef.current
      Object.entries(monacoThemes).forEach(([themeName, themeData]) => {
        monaco.editor.defineTheme(themeName, themeData)
      })
    }
  }, [monacoRef.current])

  // Apply theme when it changes
  useEffect(() => {
    if (monacoRef.current && markdownTheme) {
      monacoRef.current.editor.setTheme(markdownTheme)
    }
  }, [markdownTheme])


  const handleEditorMount = (editor, monaco) => {
    monacoRef.current = monaco
    editorRef.current = editor
    // Define all themes on mount
    Object.entries(monacoThemes).forEach(([themeName, themeData]) => {
      monaco.editor.defineTheme(themeName, themeData)
    })
    // Set initial theme
    if (markdownTheme) {
      monaco.editor.setTheme(markdownTheme)
    }
    
    // Track cursor position changes
    if (onCursorPositionChange) {
      editor.onDidChangeCursorPosition((e) => {
        onCursorPositionChange({
          line: e.position.lineNumber,
          column: e.position.column
        })
      })
    }
  }

  const handleEditorChange = (value) => {
    onContentChange(value || '')
  }

  // Handle checkbox toggle in preview
  const handleCheckboxToggle = useCallback((checkboxInfo) => {
    const { text, index } = checkboxInfo
    
    // Use ref to get current content without recreating callback
    const currentContent = fileContentRef.current
    
    // Extract current checkboxes from content
    const checkboxes = extractCheckboxes(currentContent)
    
    // Find the matching checkbox by index
    if (index >= 0 && index < checkboxes.length) {
      const updatedContent = toggleCheckboxByText(currentContent, text, 0)
      onContentChange(updatedContent)
    }
  }, [onContentChange]) // Removed fileContent dependency

  // Make checkboxes interactive when preview renders
  useEffect(() => {
    // Only setup when switching tabs or initially loading
    const setupInteractiveCheckboxes = () => {
      // For preview-only mode
      if (activeTab === 'preview' && previewRef.current) {
        const previewElement = previewRef.current.querySelector('.wmde-markdown')
        if (previewElement) {
          makeCheckboxesInteractive(previewElement, handleCheckboxToggle)
        }
      }
      
      // For live mode (preview side)
      if (activeTab === 'live' && livePreviewRef.current) {
        const previewElement = livePreviewRef.current.querySelector('.wmde-markdown-var')
        if (previewElement) {
          makeCheckboxesInteractive(previewElement, handleCheckboxToggle)
        }
      }
    }

    // Setup with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(setupInteractiveCheckboxes, 200)
    
    return () => clearTimeout(timeoutId)
  }, [activeTab, handleCheckboxToggle]) // Removed fileContent and displayContent to prevent loops

  // Handle image paste from clipboard
  useEffect(() => {
    const handlePaste = async (e) => {
      // Only handle if we have a current file (can't save to untitled)
      if (!currentFile) {
        return
      }

      const items = e.clipboardData?.items
      if (!items) return

      // Check if clipboard contains an image
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault()
          
          const blob = item.getAsFile()
          if (!blob) continue

          try {
            // Convert blob to base64
            const reader = new FileReader()
            reader.onload = async () => {
              const base64Data = reader.result.split(',')[1] // Remove data:image/png;base64, prefix
              
              // Generate filename with timestamp
              const timestamp = Date.now()
              const extension = blob.type.split('/')[1] || 'png'
              const imageName = `pasted-image-${timestamp}.${extension}`
              
              toast.loading('Saving image...', { id: 'image-paste' })
              
              try {
                // Save image via Rust command
                const relativePath = await invoke('save_clipboard_image', {
                  filePath: currentFile,
                  imageData: base64Data,
                  imageName
                })
                
                // Insert markdown image syntax at cursor position
                const markdownSyntax = `![${imageName}](${relativePath})`
                
                // Insert into editor based on active tab
                if (activeTab === 'code' && editorRef.current) {
                  // Monaco editor
                  const editor = editorRef.current
                  const position = editor.getPosition()
                  editor.executeEdits('paste-image', [{
                    range: {
                      startLineNumber: position.lineNumber,
                      startColumn: position.column,
                      endLineNumber: position.lineNumber,
                      endColumn: position.column
                    },
                    text: markdownSyntax
                  }])
                  editor.setPosition({
                    lineNumber: position.lineNumber,
                    column: position.column + markdownSyntax.length
                  })
                } else {
                  // For Live and Preview modes, append to content
                  // (MDEditor doesn't provide easy cursor position access)
                  const currentContent = fileContentRef.current
                  const newContent = currentContent + '\n' + markdownSyntax
                  onContentChange(newContent)
                }
                
                toast.success('Image pasted successfully!', { id: 'image-paste' })
              } catch (error) {
                console.error('Failed to save pasted image:', error)
                toast.error('Failed to save image: ' + error, { id: 'image-paste' })
              }
            }
            
            reader.readAsDataURL(blob)
          } catch (error) {
            console.error('Error processing pasted image:', error)
            toast.error('Failed to process image')
          }
          
          break // Only handle first image
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [currentFile, activeTab, onContentChange])


  if (!isEditing && !currentFile) {
    return (
      <div className="main-editor">
        <WelcomeScreen
          recentItems={recentItems}
          onOpenFolder={onOpenFolder}
          onOpenFile={onOpenFile}
          onNewFile={onNewFile}
          onOpenRecentItem={onOpenRecentItem}
          onOpenThemeSelector={onOpenThemeSelector}
        />
      </div>
    )
  }

  return (
    <div className="main-editor">
      <div className="editor-tabs">
        <button
          className={`editor-tab ${activeTab === 'code' ? 'active' : ''}`}
          onClick={() => onTabChange('code')}
          title="Source Code Editor"
        >
          <Code size={16} />
          <span>Code</span>
        </button>
        <button
          className={`editor-tab ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => onTabChange('live')}
          title="WYSIWYG Editor (Typora-style)"
        >
          <Edit3 size={16} />
          <span>Live</span>
        </button>
        <button
          className={`editor-tab ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => onTabChange('preview')}
          title="Read-only Preview"
        >
          <Eye size={16} />
          <span>Preview</span>
        </button>
      </div>

      <div className="editor-content">
        {activeTab === 'code' ? (
          <Editor
            key={currentFile || 'new-file'} // Force remount on file change to clear history
            height="100%"
            defaultLanguage="markdown"
            value={fileContent}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme={markdownTheme || 'dracula-dark'}
            options={{
              wordWrap: 'on',
              lineNumbers: 'on',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              fontFamily: '"Fira Code", "Monaco", "Menlo", monospace',
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
            }}
          />
        ) : activeTab === 'live' ? (
          <div 
            ref={livePreviewRef}
            className="wysiwyg-editor" 
            data-color-mode={markdownTheme?.includes('dark') ? 'dark' : 'light'}
          >
            <VditorEditor
              value={fileContent}
              onChange={(value) => handleEditorChange(value || '')}
              height="100%"
              theme={markdownTheme?.includes('dark') ? 'dark' : 'light'}
              mode="wysiwyg"
              currentFile={currentFile}
            />
          </div>
        ) : (
          <div 
            ref={previewRef}
            className="wysiwyg-editor preview-only" 
            data-color-mode={markdownTheme?.includes('dark') ? 'dark' : 'light'}
          >
            <MDEditor
              value={displayContent || fileContent}
              height="100%"
              preview="preview"
              hideToolbar={true}
              enableScroll={true}
              visibleDragbar={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default MainEditor