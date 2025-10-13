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
        'content-theme', 'code-theme', 'outline'
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
      // Toggle typewriter mode - try multiple element paths
      const vditor = vditorRef.current.vditor
      
      // Try to get the wysiwyg element
      let targetElement = null
      if (vditor?.wysiwyg?.element) {
        targetElement = vditor.wysiwyg.element
      } else if (vditor?.element) {
        // Try the vditor element itself
        const wysiwygEl = vditor.element.querySelector('.vditor-wysiwyg')
        if (wysiwygEl) targetElement = wysiwygEl
      }
      
      if (targetElement) {
        if (typewriterMode) {
          targetElement.setAttribute('data-typewriter', 'true')
          console.log('✅ Typewriter mode enabled on:', targetElement.className)
        } else {
          targetElement.removeAttribute('data-typewriter')
          console.log('❌ Typewriter mode disabled')
        }
      } else {
        console.warn('⚠️ Could not find Vditor wysiwyg element for typewriter mode')
      }
    }
  }, [typewriterMode, isInitialized])

  useEffect(() => {
    if (vditorRef.current && isInitialized) {
      // Toggle focus mode - try multiple element paths
      const vditor = vditorRef.current.vditor
      
      // Try to get the wysiwyg element
      let targetElement = null
      if (vditor?.wysiwyg?.element) {
        targetElement = vditor.wysiwyg.element
      } else if (vditor?.element) {
        // Try the vditor element itself
        const wysiwygEl = vditor.element.querySelector('.vditor-wysiwyg')
        if (wysiwygEl) targetElement = wysiwygEl
      }
      
      if (targetElement) {
        if (focusMode) {
          targetElement.setAttribute('data-focus', 'true')
          console.log('✅ Focus mode enabled on:', targetElement.className)
        } else {
          targetElement.removeAttribute('data-focus')
          console.log('❌ Focus mode disabled')
        }
      } else {
        console.warn('⚠️ Could not find Vditor wysiwyg element for focus mode')
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
