import React, { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { FileText, Folder, FolderOpen, File, Clock, Zap, Lightbulb, Palette } from 'lucide-react'
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
      icon: <FileText size={20} />,
      title: 'New File',
      onClick: onNewFile
    },
    {
      icon: <FolderOpen size={20} />,
      title: 'Open Folder',
      onClick: onOpenFolder
    },
    {
      icon: <File size={20} />,
      title: 'Open File',
      onClick: onOpenFile
    },
    {
      icon: <Palette size={20} />,
      title: 'Themes',
      onClick: () => {}
    }
  ]

  const shortcuts = [
    { key: 'Ctrl+N', description: 'Create new document' },
    { key: 'Ctrl+O', description: 'Open file' },
    { key: 'Ctrl+Shift+O', description: 'Open folder' },
    { key: 'Ctrl+P', description: 'Quick file search' },
    { key: 'Ctrl+S', description: 'Save document' }
  ]

  return (
    <div className="welcome-screen-container">
      <div className="welcome-content">
        {/* Greeting Section */}
        <div className="welcome-greeting">
          <div className="greeting-emoji">{greeting.emoji}</div>
          <h1 className="greeting-title">
            {greeting.text}, {username}!
          </h1>
          <p className="welcome-subtitle">
            Welcome to <span className="app-name">Docura</span>
          </p>
        </div>

        {/* Cards Grid */}
        <div className="welcome-cards">
          {/* Quick Actions Card */}
          <div className="welcome-card">
            <div className="card-header">
              <Zap size={16} />
              <h2>Quick Actions</h2>
            </div>
            <div className="actions-grid">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="action-item"
                  onClick={action.onClick}
                >
                  <div className="action-icon">{action.icon}</div>
                  <div className="action-title">{action.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Items Card */}
          {recentItems.length > 0 && (
            <div className="welcome-card">
              <div className="card-header">
                <Clock size={16} />
                <h2>Recent</h2>
              </div>
              <div className="recent-list">
                {recentItems.slice(0, 5).map((item, index) => (
                  <button
                    key={index}
                    className="recent-item"
                    onClick={() => onOpenRecentItem(item)}
                  >
                    <div className="recent-icon">
                      {item.type === 'folder' ? (
                        <Folder size={16} />
                      ) : (
                        <FileText size={16} />
                      )}
                    </div>
                    <div className="recent-info">
                      <div className="recent-name">{item.name}</div>
                      <div className="recent-path">{item.path}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts Card */}
          <div className="welcome-card">
            <div className="card-header">
              <Lightbulb size={16} />
              <h2>Keyboard Shortcuts</h2>
            </div>
            <div className="shortcuts-list">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="shortcut-item">
                  <kbd className="shortcut-key">{shortcut.key}</kbd>
                  <span className="shortcut-desc">{shortcut.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen

