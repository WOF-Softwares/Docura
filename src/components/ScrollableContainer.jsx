import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react'
import '../styles/ScrollableContainer.css'

const ScrollableContainer = forwardRef(({ 
  children, 
  className = '', 
  maxHeight = 'auto',
  showScrollbar = true,
  scrollbarWidth = 8,
  trackColor = 'transparent',
  thumbColor = 'var(--border-color)',
  thumbHoverColor = 'var(--text-secondary)',
  onScroll = null,
  autoHide = true,
  smoothScroll = true
}, ref) => {
  const containerRef = useRef(null)
  const contentRef = useRef(null)
  const scrollbarRef = useRef(null)
  const thumbRef = useRef(null)
  
  const [isDragging, setIsDragging] = useState(false)
  const [showScrollbarTrack, setShowScrollbarTrack] = useState(false)
  const [thumbHeight, setThumbHeight] = useState(0)
  const [thumbTop, setThumbTop] = useState(0)

  const updateScrollbar = () => {
    if (!containerRef.current || !contentRef.current || !thumbRef.current) return

    const container = containerRef.current
    const content = contentRef.current
    
    const containerHeight = container.clientHeight
    const contentHeight = content.scrollHeight
    const scrollTop = container.scrollTop
    
    const hasOverflow = contentHeight > containerHeight
    setShowScrollbarTrack(hasOverflow && showScrollbar)
    
    if (hasOverflow) {
      // Calculate thumb height as a ratio of container to content
      const thumbHeightRatio = containerHeight / contentHeight
      const calculatedThumbHeight = Math.max(thumbHeightRatio * containerHeight, 20)
      
      // Calculate thumb position
      const maxScrollTop = contentHeight - containerHeight
      const scrollPercentage = scrollTop / maxScrollTop
      const maxThumbTop = containerHeight - calculatedThumbHeight
      const calculatedThumbTop = scrollPercentage * maxThumbTop
      
      setThumbHeight(calculatedThumbHeight)
      setThumbTop(isNaN(calculatedThumbTop) ? 0 : calculatedThumbTop)
    }
  }

  const handleScroll = (e) => {
    updateScrollbar()
    if (onScroll) onScroll(e)
  }

  const handleThumbMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    
    const startY = e.clientY
    const startScrollTop = containerRef.current.scrollTop
    
    const handleMouseMove = (e) => {
      if (!containerRef.current || !contentRef.current) return
      
      const deltaY = e.clientY - startY
      const container = containerRef.current
      const containerHeight = container.clientHeight
      const contentHeight = contentRef.current.scrollHeight
      const maxScrollTop = contentHeight - containerHeight
      
      const scrollRatio = deltaY / (containerHeight - thumbHeight)
      const newScrollTop = startScrollTop + (scrollRatio * maxScrollTop)
      
      container.scrollTop = Math.max(0, Math.min(newScrollTop, maxScrollTop))
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleTrackClick = (e) => {
    if (!containerRef.current || !contentRef.current || !scrollbarRef.current) return
    
    const scrollbar = scrollbarRef.current
    const rect = scrollbar.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    
    const container = containerRef.current
    const containerHeight = container.clientHeight
    const contentHeight = contentRef.current.scrollHeight
    const maxScrollTop = contentHeight - containerHeight
    
    const scrollPercentage = clickY / containerHeight
    container.scrollTop = scrollPercentage * maxScrollTop
  }

  useEffect(() => {
    updateScrollbar()
    
    const resizeObserver = new ResizeObserver(updateScrollbar)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current)
    }
    
    return () => resizeObserver.disconnect()
  }, [children])

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    scrollTo: (top) => {
      if (containerRef.current) {
        containerRef.current.scrollTop = top
      }
    },
    scrollToTop: () => {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0
      }
    },
    scrollToBottom: () => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight
      }
    },
    getScrollTop: () => {
      return containerRef.current ? containerRef.current.scrollTop : 0
    },
    getScrollHeight: () => {
      return containerRef.current ? containerRef.current.scrollHeight : 0
    }
  }))

  const containerStyle = {
    maxHeight,
    '--scrollbar-width': `${scrollbarWidth}px`,
    '--track-color': trackColor,
    '--thumb-color': thumbColor,
    '--thumb-hover-color': thumbHoverColor
  }

  const containerClasses = [
    'scrollable-container',
    className,
    autoHide ? 'auto-hide' : 'always-show',
    smoothScroll ? 'smooth-scroll' : 'no-smooth-scroll'
  ].filter(Boolean).join(' ')

  return (
    <div className={containerClasses} style={containerStyle}>
      <div
        ref={containerRef}
        className="scrollable-content"
        onScroll={handleScroll}
      >
        <div ref={contentRef}>
          {children}
        </div>
      </div>
      
      {showScrollbarTrack && (
        <div
          ref={scrollbarRef}
          className="custom-scrollbar"
          onClick={handleTrackClick}
        >
          <div
            ref={thumbRef}
            className={`scrollbar-thumb ${isDragging ? 'dragging' : ''}`}
            style={{
              height: `${thumbHeight}px`,
              top: `${thumbTop}px`
            }}
            onMouseDown={handleThumbMouseDown}
          />
        </div>
      )}
    </div>
  )
})

export default ScrollableContainer