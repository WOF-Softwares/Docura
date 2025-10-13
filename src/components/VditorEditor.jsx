import React, { useEffect, useRef, useState } from 'react'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { invoke } from '@tauri-apps/api/core'
import toast from 'react-hot-toast'

// Set Vditor to English locale
if (typeof window !== 'undefined' && window.Vditor) {
  window.Vditor.setCodeTheme = window.Vditor.setCodeTheme || (() => {})
}

const VditorEditor = ({ 
  value = '', 
  onChange, 
  height = '100%',
  theme = 'dark',
  mode = 'wysiwyg',
  currentFile,
  focusMode = false,
  typewriterMode = false
}) => {
  const containerRef = useRef(null)
  const vditorRef = useRef(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const handleImagePaste = async (files) => {
    if (!currentFile) {
      toast.error('Please save the file first before adding images')
      return ''
    }

    try {
      const file = files[0]
      const arrayBuffer = await file.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      
      const timestamp = Date.now()
      const extension = file.type.split('/')[1] || 'png'
      const filename = `image_${timestamp}.${extension}`
      
      const imagePath = await invoke('save_pasted_image', {
        fileContent: Array.from(bytes),
        filename: filename,
        currentFilePath: currentFile
      })
      
      toast.success('Image pasted successfully!', { id: 'image-paste' })
      return imagePath
    } catch (error) {
      console.error('Failed to save pasted image:', error)
      toast.error('Failed to save image: ' + error, { id: 'image-paste' })
      return ''
    }
  }

  useEffect(() => {
    if (!containerRef.current || isInitialized) return

    vditorRef.current = new Vditor(containerRef.current, {
      height: typeof height === 'number' ? height : 500,
      mode: mode,
      theme: theme,
      value: value,
      lang: 'en_US',
      cache: { enable: false },
      preview: {
        theme: {
          current: theme === 'dark' ? 'dark' : 'light'
        },
        hljs: {
          enable: true,
          style: theme === 'dark' ? 'github-dark' : 'github'
        },
        math: { inlineDigit: true }
      },
      toolbar: [
        'emoji', 
        {
          name: 'headings',
          tipPosition: 'n',
          tip: 'Headings',
          options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
        },
        'bold', 'italic', 'strike', '|',
        'line', 'quote', 'list', 'ordered-list', 'check', '|',
        'code', 'inline-code', '|', 'upload', 'link', 'table', '|',
        'undo', 'redo', '|', 'fullscreen', 'edit-mode', '|',
         'outline'
      ],
      // Fix for customWysiwygToolbar error - provide empty function
      customWysiwygToolbar: () => {},
      // Note: Vditor doesn't have built-in typewriterMode or focus options
      // We'll handle these manually via CSS and data attributes
      input: (value) => {
        if (onChange) {
          onChange(value)
        }
      },
      after: () => {
        setIsInitialized(true)
        
        // Apply initial modes if enabled
        if (focusMode || typewriterMode) {
          console.log('📝 Vditor initialized, applying modes:', { focusMode, typewriterMode })
        }
      },
      upload: {
        accept: 'image/*',
        handler: async (files) => {
          const imagePath = await handleImagePaste(files)
          return imagePath ? {
            msg: '',
            code: 0,
            data: {
              errFiles: [],
              succMap: { [files[0].name]: imagePath }
            }
          } : null
        }
      }
    })

    return () => {
      if (vditorRef.current) {
        vditorRef.current.destroy()
        vditorRef.current = null
        setIsInitialized(false)
      }
    }
  }, [height, theme, mode, currentFile])

  useEffect(() => {
    if (vditorRef.current && isInitialized && value !== vditorRef.current.getValue()) {
      vditorRef.current.setValue(value)
    }
  }, [value, isInitialized])

  useEffect(() => {
    if (vditorRef.current && isInitialized) {
      vditorRef.current.setTheme(theme, theme === 'dark' ? 'dark' : 'light')
    }
  }, [theme, isInitialized])

  useEffect(() => {
    if (vditorRef.current && isInitialized) {
      // Toggle typewriter mode with active centering
      const vditor = vditorRef.current.vditor
      
      // Try to get the wysiwyg element
      let targetElement = null
      if (vditor?.wysiwyg?.element) {
        targetElement = vditor.wysiwyg.element
      } else if (vditor?.element) {
        const wysiwygEl = vditor.element.querySelector('.vditor-wysiwyg')
        if (wysiwygEl) targetElement = wysiwygEl
      }
      
      if (targetElement) {
        if (typewriterMode) {
          targetElement.setAttribute('data-typewriter', 'true')
          console.log('✅ Typewriter mode enabled - Cursor always centered! ⌨️')
          
          // Function to center the current line
          const centerCurrentLine = () => {
            // Get cursor position
            const selection = window.getSelection()
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0)
              const container = range.commonAncestorContainer
              const element = container.nodeType === 3 ? container.parentElement : container
              const currentLine = element.closest('p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, pre, table, div')
              
              if (currentLine && targetElement.contains(currentLine)) {
                const lineRect = currentLine.getBoundingClientRect()
                const viewportCenter = window.innerHeight / 2
                const lineCenter = lineRect.top + (lineRect.height / 2)
                const scrollOffset = lineCenter - viewportCenter
                
                // Smooth scroll to center the line
                window.scrollBy({
                  top: scrollOffset,
                  behavior: 'smooth'
                })
              }
            }
          }
          
          // Center on various events
          const handleTypewriterUpdate = () => {
            setTimeout(centerCurrentLine, 50) // Small delay for DOM update
          }
          
          targetElement.addEventListener('input', handleTypewriterUpdate)
          targetElement.addEventListener('keydown', handleTypewriterUpdate)
          targetElement.addEventListener('click', handleTypewriterUpdate)
          document.addEventListener('selectionchange', handleTypewriterUpdate)
          
          // Center every 200ms for continuous centering
          const typewriterInterval = setInterval(centerCurrentLine, 200)
          
          // Initial center
          setTimeout(centerCurrentLine, 100)
          
          // Store cleanup
          targetElement._typewriterCleanup = () => {
            targetElement.removeEventListener('input', handleTypewriterUpdate)
            targetElement.removeEventListener('keydown', handleTypewriterUpdate)
            targetElement.removeEventListener('click', handleTypewriterUpdate)
            document.removeEventListener('selectionchange', handleTypewriterUpdate)
            clearInterval(typewriterInterval)
            console.log('🧹 Typewriter mode cleanup')
          }
        } else {
          targetElement.removeAttribute('data-typewriter')
          console.log('❌ Typewriter mode disabled')
          
          // Cleanup
          if (targetElement._typewriterCleanup) {
            targetElement._typewriterCleanup()
            targetElement._typewriterCleanup = null
          }
        }
      } else {
        console.warn('⚠️ Could not find Vditor wysiwyg element for typewriter mode')
      }
    }
    
    // Cleanup on unmount
    return () => {
      const vditor = vditorRef.current?.vditor
      const targetElement = vditor?.wysiwyg?.element || vditor?.element?.querySelector('.vditor-wysiwyg')
      if (targetElement?._typewriterCleanup) {
        targetElement._typewriterCleanup()
      }
    }
  }, [typewriterMode, isInitialized])

  useEffect(() => {
    if (vditorRef.current && isInitialized) {
      // Toggle focus mode with overlay approach
      const vditor = vditorRef.current.vditor
      
      // Find the wysiwyg element
      let targetElement = null
      if (vditor?.wysiwyg?.element) {
        targetElement = vditor.wysiwyg.element
      } else if (vditor?.element) {
        const wysiwygEl = vditor.element.querySelector('.vditor-wysiwyg')
        if (wysiwygEl) targetElement = wysiwygEl
      }
      
      if (targetElement) {
        if (focusMode) {
          targetElement.setAttribute('data-focus', 'true')
          console.log('✅ Focus mode enabled - ADHD-friendly! 🎯')
          
          // Remove any existing overlay first (safety check)
          const existingOverlay = document.getElementById('focus-mode-overlay')
          if (existingOverlay) existingOverlay.remove()
          
          // Create overlay element
          const overlay = document.createElement('div')
          overlay.id = 'focus-mode-overlay'
          overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.75);
            pointer-events: none;
            z-index: 9998;
            transition: clip-path 0.3s ease;
          `
          
          // Add overlay to body
          document.body.appendChild(overlay)
          
          let lastActiveElement = null
          
          // Function to get current active element
          const getActiveElement = () => {
            // Priority 1: Element with cursor (selection)
            const selection = window.getSelection()
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0)
              const container = range.commonAncestorContainer
              const element = container.nodeType === 3 ? container.parentElement : container
              const closestBlock = element.closest('p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, pre, table, div')
              if (closestBlock && targetElement.contains(closestBlock)) {
                return closestBlock
              }
            }
            
            // Priority 2: Focused element (keyboard navigation)
            const focused = document.activeElement
            if (focused && targetElement.contains(focused)) {
              const closestBlock = focused.closest('p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, pre, table, div')
              if (closestBlock) return closestBlock
            }
            
            // Priority 3: Hovered element (mouse)
            const hovered = targetElement.querySelector('p:hover, h1:hover, h2:hover, h3:hover, h4:hover, h5:hover, h6:hover, ul:hover, ol:hover, blockquote:hover, pre:hover, table:hover')
            if (hovered) return hovered
            
            // Priority 4: Element with focus-within
            const focusWithin = targetElement.querySelector('p:focus-within, h1:focus-within, h2:focus-within, h3:focus-within, h4:focus-within, h5:focus-within, h6:focus-within, ul:focus-within, ol:focus-within, blockquote:focus-within, pre:focus-within, table:focus-within')
            if (focusWithin) return focusWithin
            
            // Fallback: Keep last active or use first element
            return lastActiveElement || targetElement.querySelector('p, h1, h2, h3, h4, h5, h6')
          }
          
          // Function to update cutout based on active element
          const updateCutout = () => {
            const activeEl = getActiveElement()
            
            if (activeEl) {
              lastActiveElement = activeEl
              const rect = activeEl.getBoundingClientRect()
              const padding = 16
              
              // Create clip-path with hole for active element
              const clipPath = `polygon(
                0% 0%,
                0% 100%,
                ${rect.left - padding}px 100%,
                ${rect.left - padding}px ${rect.top - padding}px,
                ${rect.right + padding}px ${rect.top - padding}px,
                ${rect.right + padding}px ${rect.bottom + padding}px,
                ${rect.left - padding}px ${rect.bottom + padding}px,
                ${rect.left - padding}px 100%,
                100% 100%,
                100% 0%
              )`
              
              overlay.style.clipPath = clipPath
            }
          }
          
          // Update on various events
          targetElement.addEventListener('mousemove', updateCutout)
          targetElement.addEventListener('click', updateCutout)
          targetElement.addEventListener('keyup', updateCutout)
          targetElement.addEventListener('keydown', updateCutout)
          targetElement.addEventListener('input', updateCutout)
          document.addEventListener('selectionchange', updateCutout)
          
          // Update periodically for cursor movement
          const intervalId = setInterval(updateCutout, 100)
          
          // Initial cutout
          setTimeout(updateCutout, 100)
          
          // Store cleanup function
          targetElement._focusModeCleanup = () => {
            targetElement.removeEventListener('mousemove', updateCutout)
            targetElement.removeEventListener('click', updateCutout)
            targetElement.removeEventListener('keyup', updateCutout)
            targetElement.removeEventListener('keydown', updateCutout)
            targetElement.removeEventListener('input', updateCutout)
            document.removeEventListener('selectionchange', updateCutout)
            clearInterval(intervalId)
            overlay.remove()
            console.log('🧹 Focus mode cleanup: overlay removed')
          }
        } else {
          targetElement.removeAttribute('data-focus')
          console.log('❌ Focus mode disabled')
          
          // BULLETPROOF cleanup - multiple safety checks
          if (targetElement._focusModeCleanup) {
            targetElement._focusModeCleanup()
            targetElement._focusModeCleanup = null
          }
          
          // Extra safety: Remove overlay by ID if it exists
          const overlay = document.getElementById('focus-mode-overlay')
          if (overlay) {
            overlay.remove()
            console.log('🧹 Safety cleanup: removed lingering overlay')
          }
        }
      } else {
        console.warn('⚠️ Could not find Vditor wysiwyg element for focus mode')
      }
    }
    
    // Cleanup on unmount
    return () => {
      const overlay = document.getElementById('focus-mode-overlay')
      if (overlay) {
        overlay.remove()
        console.log('🧹 Component unmount: overlay removed')
      }
    }
  }, [focusMode, isInitialized])

  return (
    <div 
      ref={containerRef}
      className="vditor-container"
      style={{ 
        height: typeof height === 'string' ? height : `${height}px`,
        width: '100%'
      }}
    />
  )
}

export default VditorEditor
