import React, { useState } from 'react'
import { Palette, X } from 'lucide-react'

const ThemeSelector = ({ isOpen, onClose, currentTheme, onThemeChange }) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme)

  const themes = [
    {
      id: 'dracula-dark',
      name: 'Dracula Dark',
      description: 'Purple and cyan dark theme',
      preview: {
        bg: '#282a36',
        primary: '#bd93f9',
        accent: '#8be9fd',
        text: '#f8f8f2'
      }
    },
    {
      id: 'cappuccino-dark',
      name: 'Cappuccino Dark',
      description: 'Warm dark theme with pink accents',
      preview: {
        bg: '#2d2a2e',
        primary: '#ab9df2',
        accent: '#78dce8',
        text: '#e2e2e3'
      }
    },
    {
      id: 'nord-light',
      name: 'Nord Light',
      description: 'Arctic-inspired light theme',
      preview: {
        bg: '#eceff4',
        primary: '#5e81ac',
        accent: '#88c0d0',
        text: '#2e3440'
      }
    },
    {
      id: 'solarized-light',
      name: 'Solarized Light',
      description: 'Designed for readability',
      preview: {
        bg: '#fdf6e3',
        primary: '#268bd2',
        accent: '#2aa198',
        text: '#657b83'
      }
    }
  ]

  const handleApply = () => {
    onThemeChange(selectedTheme)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="theme-selector-overlay" onClick={onClose}>
      <div className="theme-selector-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="theme-selector-header">
          <div className="theme-selector-title">
            <Palette size={20} />
            <h2>Select Theme</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="theme-selector-body">
          <div className="themes-grid">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className={`theme-card ${selectedTheme === theme.id ? 'selected' : ''}`}
                onClick={() => setSelectedTheme(theme.id)}
              >
                <div className="theme-preview" style={{ backgroundColor: theme.preview.bg }}>
                  <div className="theme-preview-header" style={{ backgroundColor: theme.preview.primary }}>
                    <div className="theme-preview-dot" />
                    <div className="theme-preview-dot" />
                    <div className="theme-preview-dot" />
                  </div>
                  <div className="theme-preview-content">
                    <div className="theme-preview-line" style={{ backgroundColor: theme.preview.text, opacity: 0.8 }} />
                    <div className="theme-preview-line" style={{ backgroundColor: theme.preview.accent, opacity: 0.6, width: '80%' }} />
                    <div className="theme-preview-line" style={{ backgroundColor: theme.preview.text, opacity: 0.4, width: '90%' }} />
                  </div>
                </div>
                <div className="theme-info">
                  <h3>{theme.name}</h3>
                  <p>{theme.description}</p>
                </div>
                {selectedTheme === theme.id && (
                  <div className="theme-selected-badge">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="theme-selector-footer">
          <button className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button-primary" onClick={handleApply}>
            Apply Theme
          </button>
        </div>
      </div>
    </div>
  )
}

export default ThemeSelector

