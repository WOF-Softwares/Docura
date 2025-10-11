import React from 'react'
import Editor from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Code, Eye } from 'lucide-react'

const MainEditor = ({
  fileContent,
  onContentChange,
  activeTab,
  onTabChange,
  currentFile,
  isEditing,
  markdownTheme
}) => {
  const theme = document.documentElement.getAttribute('data-theme')

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
        >
          <Code size={16} />
          <span>Code</span>
        </button>
        <button
          className={`editor-tab ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => onTabChange('preview')}
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
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            options={{
              wordWrap: 'on',
              lineNumbers: 'on',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              fontFamily: '"Fira Code", "Monaco", "Menlo", monospace',
              automaticLayout: true,
            }}
          />
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