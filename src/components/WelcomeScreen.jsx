import React, { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { FileText, Folder, FolderOpen, File, Clock, Zap } from 'lucide-react'
import '../styles/WelcomeScreen.css'

function WelcomeScreen({ 
  recentItems = [], 
  onOpenFolder, 
  onOpenFile, 
  onNewFile,
  onOpenRecentItem 
}) {
  const [username, setUsername] = useState('')
  const [greeting, setGreeting] = useState({ text: 'Hello', emoji: '👋' })

  useEffect(() => {
    // Get username
    invoke('get_username')
      .then(name => {
        // Capitalize first letter
        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1)
        setUsername(capitalizedName)
      })
      .catch(err => {
        console.error('Failed to get username:', err)
        setUsername('there')
      })

    // Set greeting based on time
    const hour = new Date().getHours()
    
    if (hour >= 5 && hour < 12) {
      setGreeting({ text: 'Good Morning', emoji: '🌅' })
    } else if (hour >= 12 && hour < 17) {
      setGreeting({ text: 'Good Afternoon', emoji: '☀️' })
    } else if (hour >= 17 && hour < 21) {
      setGreeting({ text: 'Good Evening', emoji: '🌆' })
    } else {
      setGreeting({ text: 'Good Night', emoji: '🌙' })
    }
  }, [])

  const quickActions = [
    {
      icon: <FileText size={24} />,
      title: 'New File',
      description: 'Create a new markdown document',
      shortcut: 'Ctrl+N',
      onClick: onNewFile,
      primary: true
    },
    {
      icon: <FolderOpen size={24} />,
      title: 'Open Folder',
      description: 'Open a folder of markdown files',
      shortcut: 'Ctrl+Shift+O',
      onClick: onOpenFolder
    },
    {
      icon: <File size={24} />,
      title: 'Open File',
      description: 'Open an existing markdown file',
      shortcut: 'Ctrl+O',
      onClick: onOpenFile
    }
  ]

  const tips = [
    { emoji: '⚡', text: 'Press Ctrl+P for quick file search' },
    { emoji: '🎨', text: 'Click the palette icon to change themes' },
    { emoji: '💾', text: 'Auto-save keeps your work safe automatically' },
    { emoji: '🖼️', text: 'Drag & drop images directly into the editor' }
  ]

  return (
    <div className="welcome-screen-container">
      <div className="welcome-content">
        {/* Greeting Section */}
        <div className="welcome-greeting">
          <h1 className="greeting-title">
            <span className="greeting-emoji">{greeting.emoji}</span>
            {greeting.text}, {username}!
          </h1>
          <p className="welcome-subtitle">
            Welcome to <span className="app-name">Docura</span> — A beautiful markdown editor
          </p>
        </div>

        {/* Main Grid */}
        <div className="welcome-grid">
          {/* Quick Actions */}
          <div className="welcome-section">
            <div className="section-header">
              <Zap size={20} />
              <h2>Get Started</h2>
            </div>
            <div className="quick-actions">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className={`action-card ${action.primary ? 'primary' : ''}`}
                  onClick={action.onClick}
                >
                  <div className="action-icon">{action.icon}</div>
                  <div className="action-content">
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                  </div>
                  <div className="action-shortcut">{action.shortcut}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Items */}
          {recentItems.length > 0 && (
            <div className="welcome-section">
              <div className="section-header">
                <Clock size={20} />
                <h2>Recent</h2>
              </div>
              <div className="recent-list">
                {recentItems.slice(0, 6).map((item, index) => (
                  <button
                    key={index}
                    className="recent-item"
                    onClick={() => onOpenRecentItem(item)}
                  >
                    <div className="recent-icon">
                      {item.type === 'folder' ? (
                        <Folder size={18} />
                      ) : (
                        <FileText size={18} />
                      )}
                    </div>
                    <div className="recent-content">
                      <div className="recent-name">{item.name}</div>
                      <div className="recent-path">{item.path}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="welcome-tips">
          <h3 className="tips-title">💡 Quick Tips</h3>
          <div className="tips-grid">
            {tips.map((tip, index) => (
              <div key={index} className="tip-item">
                <span className="tip-emoji">{tip.emoji}</span>
                <span className="tip-text">{tip.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen

