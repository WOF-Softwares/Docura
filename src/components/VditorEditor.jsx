import React, { useEffect, useRef, useState } from 'react'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { invoke } from '@tauri-apps/api/core'
import toast from 'react-hot-toast'

const VditorEditor = ({ 
  value = '', 
  onChange, 
  height = '100%',
  theme = 'dark',
  mode = 'wysiwyg',
  currentFile
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
        'emoji', 'headings', 'bold', 'italic', 'strike', '|',
        'line', 'quote', 'list', 'ordered-list', 'check', '|',
        'code', 'inline-code', '|', 'upload', 'link', 'table', '|',
        'undo', 'redo', '|', 'fullscreen', 'edit-mode'
      ],
      input: (value) => {
        if (onChange) {
          onChange(value)
        }
      },
      after: () => {
        setIsInitialized(true)
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
