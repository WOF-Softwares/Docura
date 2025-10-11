import React, { useState } from 'react'
import { Palette, X } from 'lucide-react'

const ThemeSelector = ({ isOpen, onClose, currentTheme, onThemeChange }) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme)

  const themes = [
    {
      id: 'dracula',
      name: 'Dracula',
      description: 'Purple and cyan vampire theme',
      variants: {
        light: {
          bg: '#f8f8f2',
          primary: '#6272a4',
          accent: '#50fa7b',
          text: '#282a36'
        },
        dark: {
          bg: '#282a36',
          primary: '#bd93f9',
          accent: '#8be9fd',
          text: '#f8f8f2'
        }
      }
    },
    {
      id: 'cappuccino',
      name: 'Cappuccino',
      description: 'Warm coffee-inspired theme',
      variants: {
        light: {
          bg: '#faf4ed',
          primary: '#907aa9',
          accent: '#56949f',
          text: '#575279'
        },
        dark: {
          bg: '#2d2a2e',
          primary: '#ab9df2',
          accent: '#78dce8',
          text: '#e2e2e3'
        }
      }
    },
    {
      id: 'nord',
      name: 'Nord',
      description: 'Arctic-inspired theme',
      variants: {
        light: {
          bg: '#eceff4',
          primary: '#5e81ac',
          accent: '#88c0d0',
          text: '#2e3440'
        },
        dark: {
          bg: '#2e3440',
          primary: '#81a1c1',
          accent: '#88c0d0',
          text: '#eceff4'
        }
      }
    },
    {
      id: 'solarized',
      name: 'Solarized',
      description: 'Designed for readability',
      variants: {
        light: {
          bg: '#fdf6e3',
          primary: '#268bd2',
          accent: '#2aa198',
          text: '#657b83'
        },
        dark: {
          bg: '#002b36',
          primary: '#268bd2',
          accent: '#2aa198',
          text: '#839496'
        }
      }
    },
    {
      id: 'monokai',
      name: 'Monokai',
      description: 'Popular dark code editor theme',
      variants: {
        light: {
          bg: '#fafafa',
          primary: '#75715e',
          accent: '#f92672',
          text: '#272822'
        },
        dark: {
          bg: '#272822',
          primary: '#f92672',
          accent: '#a6e22e',
          text: '#f8f8f2'
        }
      }
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Clean and professional',
      variants: {
        light: {
          bg: '#ffffff',
          primary: '#0366d6',
          accent: '#28a745',
          text: '#24292e'
        },
        dark: {
          bg: '#0d1117',
          primary: '#58a6ff',
          accent: '#7c3aed',
          text: '#f0f6fc'
        }
      }
    }
  ]

  const handleApply = () => {
    onThemeChange(selectedTheme)
    onClose()
  }

  const getCurrentVariant = (theme) => {
    // Extract the current theme variant from the selectedTheme
    const parts = selectedTheme.split('-')
    const isCurrentThemeDark = parts.includes('dark')
    return isCurrentThemeDark ? theme.variants.dark : theme.variants.light
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
            {themes.map((theme) => {
              const currentVariant = getCurrentVariant(theme)
              const themeId = `${theme.id}-${selectedTheme.includes('dark') ? 'dark' : 'light'}`
              const isSelected = selectedTheme.startsWith(theme.id)
              
              return (
                <div
                  key={theme.id}
                  className={`theme-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedTheme(themeId)}
                >
                  <div className="theme-preview" style={{ backgroundColor: currentVariant.bg }}>
                    <div className="theme-preview-header" style={{ backgroundColor: currentVariant.primary }}>
                      <div className="theme-preview-dot" />
                      <div className="theme-preview-dot" />
                      <div className="theme-preview-dot" />
                    </div>
                    <div className="theme-preview-content">
                      <div className="theme-preview-line" style={{ backgroundColor: currentVariant.text, opacity: 0.8 }} />
                      <div className="theme-preview-line" style={{ backgroundColor: currentVariant.accent, opacity: 0.6, width: '80%' }} />
                      <div className="theme-preview-line" style={{ backgroundColor: currentVariant.text, opacity: 0.4, width: '90%' }} />
                    </div>
                  </div>
                  <div className="theme-info">
                    <h3>{theme.name}</h3>
                    <p>{theme.description}</p>
                  </div>
                  {isSelected && (
                    <div className="theme-selected-badge">✓</div>
                  )}
                </div>
              )
            })}
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

