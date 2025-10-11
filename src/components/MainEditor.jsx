import React, { useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import MDEditor from '@uiw/react-md-editor'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Code, Eye, Edit3 } from 'lucide-react'

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
  onContentChange,
  activeTab,
  onTabChange,
  currentFile,
  isEditing,
  markdownTheme
}) => {
  const monacoRef = useRef(null)
  const theme = document.documentElement.getAttribute('data-theme')

  // Register Monaco themes
  useEffect(() => {
    if (monacoRef.current) {
      const monaco = monacoRef.current
      Object.entries(monacoThemes).forEach(([themeName, themeData]) => {
        monaco.editor.defineTheme(themeName, themeData)
      })
    }
  }, [monacoRef.current])

  const handleEditorMount = (editor, monaco) => {
    monacoRef.current = monaco
    // Define all themes on mount
    Object.entries(monacoThemes).forEach(([themeName, themeData]) => {
      monaco.editor.defineTheme(themeName, themeData)
    })
  }

  const handleEditorChange = (value) => {
    onContentChange(value || '')
  }

  // Track checkbox index for toggling
  let checkboxCounter = 0

  const handleCheckboxToggle = (checkboxIndex) => {
    const lines = fileContent.split('\n')
    let currentCheckbox = 0
    
    for (let i = 0; i < lines.length; i++) {
      // Match task list items: - [ ] or - [x] or * [ ] etc.
      if (/^[\s-]*[-*+]\s+\[([ xX])\]/.test(lines[i])) {
        if (currentCheckbox === checkboxIndex) {
          // Toggle this checkbox
          if (lines[i].includes('[ ]')) {
            lines[i] = lines[i].replace('[ ]', '[x]')
          } else if (lines[i].includes('[x]') || lines[i].includes('[X]')) {
            lines[i] = lines[i].replace(/\[x\]/i, '[ ]')
          }
          onContentChange(lines.join('\n'))
          break
        }
        currentCheckbox++
      }
    }
  }

  const renderMarkdown = () => {
    // Reset checkbox counter for each render
    checkboxCounter = 0

    return (
      <ReactMarkdown
        className="markdown-preview"
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                style={theme === 'dark' ? oneDark : oneLight}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
          input({ node, checked, type, ...props }) {
            if (type === 'checkbox') {
              const currentIndex = checkboxCounter++
              
              return (
                <input
                  type="checkbox"
                  checked={checked || false}
                  onChange={() => handleCheckboxToggle(currentIndex)}
                  className="task-list-item-checkbox"
                />
              )
            }
            return <input type={type} {...props} />
          },
          li({ node, children, className, ...props }) {
            const isTaskItem = className === 'task-list-item'
            return (
              <li 
                className={isTaskItem ? 'task-list-item' : ''} 
                {...props}
              >
                {children}
              </li>
            )
          },
          h1({ node, children, ...props }) {
            const text = children?.toString() || ''
            const id = text.toLowerCase().replace(/[^\w]+/g, '-')
            return <h1 id={id} {...props}>{children}</h1>
          },
          h2({ node, children, ...props }) {
            const text = children?.toString() || ''
            const id = text.toLowerCase().replace(/[^\w]+/g, '-')
            return <h2 id={id} {...props}>{children}</h2>
          },
          h3({ node, children, ...props }) {
            const text = children?.toString() || ''
            const id = text.toLowerCase().replace(/[^\w]+/g, '-')
            return <h3 id={id} {...props}>{children}</h3>
          },
          h4({ node, children, ...props }) {
            const text = children?.toString() || ''
            const id = text.toLowerCase().replace(/[^\w]+/g, '-')
            return <h4 id={id} {...props}>{children}</h4>
          },
          h5({ node, children, ...props }) {
            const text = children?.toString() || ''
            const id = text.toLowerCase().replace(/[^\w]+/g, '-')
            return <h5 id={id} {...props}>{children}</h5>
          },
          h6({ node, children, ...props }) {
            const text = children?.toString() || ''
            const id = text.toLowerCase().replace(/[^\w]+/g, '-')
            return <h6 id={id} {...props}>{children}</h6>
          }
        }}
      >
        {fileContent || '# Welcome to Dacura\n\nOpen a markdown file to start editing.'}
      </ReactMarkdown>
    )
  }

  if (!isEditing && !currentFile) {
    return (
      <div className="main-editor">
        <div className="welcome-screen">
          <h1>Welcome to Dacura</h1>
          <p>A Typora-like markdown editor</p>
          <div className="welcome-actions">
            <p>Open a folder or file to get started</p>
          </div>
        </div>
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
          <div className="wysiwyg-editor" data-color-mode={markdownTheme?.includes('dark') ? 'dark' : 'light'}>
            <MDEditor
              value={fileContent}
              onChange={(value) => handleEditorChange(value || '')}
              height="100%"
              preview="live"
              hideToolbar={false}
              enableScroll={true}
              visibleDragbar={false}
              highlightEnable={true}
            />
          </div>
        ) : (
          <div className="preview-container">
            <div className="markdown-preview" data-theme={markdownTheme}>
              {renderMarkdown()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MainEditor