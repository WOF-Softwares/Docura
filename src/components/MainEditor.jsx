import React from 'react'
import Editor from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
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

  const renderMarkdown = () => {
    return (
      <ReactMarkdown
        className="markdown-preview"
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
          <div className="preview-container" data-md-theme={markdownTheme}>
            {renderMarkdown()}
          </div>
        )}
      </div>
    </div>
  )
}

export default MainEditor