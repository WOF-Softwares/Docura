import React from 'react'
import { Settings, FileText } from 'lucide-react'
import '../styles/StatusBar.css'

const StatusBar = ({
  currentFile,
  wordCount = 0,
  charCount = 0,
  lineNumber = 1,
  columnNumber = 1,
  encoding = 'UTF-8',
  lineEnding = 'LF',
  indentation = '2 Spaces',
  isEditing = false,
  onSettingsClick
}) => {
  const fileName = currentFile ? currentFile.split('/').pop() : 'Untitled'
  
  return (
    <div className="status-bar">
      <div className="status-left">
        <div className="status-item file-name">
          <FileText size={14} />
          <span>{fileName}</span>
        </div>
      </div>
      
      <div className="status-right">
        {isEditing && (
          <>
            <div className="status-item" title="Line and Column">
              Ln {lineNumber}, Col {columnNumber}
            </div>
            
            <div className="status-divider"></div>
            
            <div className="status-item" title="Word Count">
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </div>
            
            <div className="status-item" title="Character Count">
              {charCount} {charCount === 1 ? 'char' : 'chars'}
            </div>
            
            <div className="status-divider"></div>
            
            <div 
              className="status-item clickable" 
              title="Encoding (click to open settings)"
              onClick={onSettingsClick}
            >
              {encoding}
            </div>
            
            <div 
              className="status-item clickable" 
              title="Line Ending (click to open settings)"
              onClick={onSettingsClick}
            >
              {lineEnding}
            </div>
            
            <div 
              className="status-item clickable" 
              title="Indentation (click to open settings)"
              onClick={onSettingsClick}
            >
              {indentation}
            </div>
            
            <div className="status-divider"></div>
          </>
        )}
        
        <div 
          className="status-item settings-button" 
          title="Settings (Ctrl+Shift+P)"
          onClick={onSettingsClick}
        >
          <Settings size={14} />
        </div>
      </div>
    </div>
  )
}

export default StatusBar

