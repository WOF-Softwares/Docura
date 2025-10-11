import React, { useState, useEffect } from 'react'
import { X, Printer, Download } from 'lucide-react'
import { save } from '@tauri-apps/plugin-dialog'
import { writeFile } from '@tauri-apps/plugin-fs'

const PDFPreviewDialog = ({ isOpen, onClose, pdfBlob, filename }) => {
  const [pdfUrl, setPdfUrl] = useState(null)

  useEffect(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob)
      setPdfUrl(url)

      // Cleanup URL when component unmounts or blob changes
      return () => {
        if (url) {
          URL.revokeObjectURL(url)
        }
      }
    }
  }, [pdfBlob])

  const handlePrint = async () => {
    if (!pdfBlob) return

    try {
      // Create a temporary blob URL for printing
      const url = URL.createObjectURL(pdfBlob)
      
      // Create an iframe to load and print the PDF
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = 'none'
      iframe.src = url
      
      document.body.appendChild(iframe)
      
      // Wait for PDF to load, then trigger print dialog
      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow.focus()
            iframe.contentWindow.print()
            
            // Clean up after print dialog closes or prints
            setTimeout(() => {
              document.body.removeChild(iframe)
              URL.revokeObjectURL(url)
            }, 1000)
          } catch (error) {
            console.error('Error printing:', error)
            document.body.removeChild(iframe)
            URL.revokeObjectURL(url)
            alert('Print failed. Please try downloading the PDF instead.')
          }
        }, 500)
      }
      
      iframe.onerror = () => {
        document.body.removeChild(iframe)
        URL.revokeObjectURL(url)
        alert('Failed to load PDF for printing. Please try downloading instead.')
      }
    } catch (error) {
      console.error('Error printing PDF:', error)
      alert('Failed to print: ' + error.message)
    }
  }

  const handleDownload = async () => {
    if (!pdfBlob) return

    try {
      // Show save dialog
      const filePath = await save({
        defaultPath: filename || 'document.pdf',
        filters: [{
          name: 'PDF',
          extensions: ['pdf']
        }]
      })

      if (!filePath) {
        console.log('Save cancelled')
        return
      }

      // Convert blob to array buffer
      const arrayBuffer = await pdfBlob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      // Write the file
      await writeFile(filePath, uint8Array)

      console.log('PDF downloaded to:', filePath)
      alert('PDF saved successfully!')
    } catch (error) {
      console.error('Error saving PDF:', error)
      alert('Failed to save PDF: ' + error.message)
    }
  }

  if (!isOpen) return null

  return (
    <div className="pdf-preview-overlay" onClick={onClose}>
      <div className="pdf-preview-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="pdf-preview-header">
          <h2>PDF Preview</h2>
          <div className="pdf-preview-actions">
            <button
              className="pdf-action-button"
              onClick={handleDownload}
              title="Download PDF"
            >
              <Download size={18} />
              <span>Download</span>
            </button>
            <button
              className="pdf-action-button primary"
              onClick={handlePrint}
              title="Print PDF"
            >
              <Printer size={18} />
              <span>Print</span>
            </button>
            <button
              className="pdf-close-button"
              onClick={onClose}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="pdf-preview-content">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="PDF Preview"
              className="pdf-iframe"
            />
          ) : (
            <div className="pdf-loading">
              <p>Generating PDF preview...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PDFPreviewDialog

