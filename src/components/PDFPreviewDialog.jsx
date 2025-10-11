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

  const handlePrint = () => {
    try {
      // Get the iframe element that's displaying the PDF
      const iframe = document.querySelector('.pdf-iframe')
      
      if (!iframe) {
        alert('PDF not loaded yet. Please wait and try again.')
        return
      }

      // Try to trigger print on the iframe's content window
      try {
        iframe.contentWindow.focus()
        iframe.contentWindow.print()
        console.log('Print dialog triggered on iframe')
      } catch (err) {
        // If direct iframe print fails (CORS or security), open in new window
        console.log('Direct iframe print failed, opening in new window:', err)
        
        if (!pdfUrl) {
          alert('PDF not ready. Please try again.')
          return
        }
        
        const printWindow = window.open(pdfUrl, '_blank', 'width=800,height=600')
        
        if (printWindow) {
          setTimeout(() => {
            try {
              printWindow.focus()
              printWindow.print()
            } catch (e) {
              console.error('Print in new window failed:', e)
            }
          }, 1000)
        } else {
          alert('Could not open print dialog. Please use the print icon in the PDF viewer above, or download the PDF.')
        }
      }
    } catch (error) {
      console.error('Error printing:', error)
      alert('Print failed. You can download the PDF and print it manually.')
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

