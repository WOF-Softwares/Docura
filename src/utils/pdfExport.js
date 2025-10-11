import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Export markdown preview to PDF
 * @param {string} content - Markdown content
 * @param {string} filename - Output filename
 * @param {HTMLElement} previewElement - The preview DOM element to convert
 * @returns {Promise<Blob>} - PDF blob
 */
export async function exportToPDF(previewElement, filename = 'document.pdf') {
  try {
    if (!previewElement) {
      throw new Error('No preview element provided')
    }

    console.log('Starting PDF export...', previewElement)
    // Create a temporary container for rendering
    const container = document.createElement('div')
    container.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      width: 210mm;
      padding: 20mm;
      background-color: #ffffff !important;
      color: #000000 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `
    
    // Clone the preview content
    const clonedContent = previewElement.cloneNode(true)
    
    // Override styles for PDF (force simple colors for printing)
    clonedContent.style.cssText = `
      background-color: #ffffff !important;
      color: #000000 !important;
      max-width: 170mm;
      margin: 0 auto;
      font-size: 16px;
      line-height: 1.6;
    `
    
    // Force simple colors on all child elements
    const allElements = clonedContent.querySelectorAll('*')
    allElements.forEach(el => {
      // Remove problematic CSS properties
      el.style.backgroundColor = el.style.backgroundColor || 'transparent'
      el.style.color = el.style.color || '#000000'
      
      // Fix headings
      if (el.tagName.match(/^H[1-6]$/)) {
        el.style.color = '#000000'
        el.style.borderColor = '#cccccc'
      }
      
      // Fix links
      if (el.tagName === 'A') {
        el.style.color = '#0066cc'
      }
      
      // Fix code blocks
      if (el.tagName === 'CODE' || el.tagName === 'PRE') {
        el.style.backgroundColor = '#f5f5f5'
        el.style.color = '#000000'
        el.style.borderColor = '#dddddd'
      }
      
      // Fix blockquotes
      if (el.tagName === 'BLOCKQUOTE') {
        el.style.backgroundColor = '#f9f9f9'
        el.style.borderLeftColor = '#cccccc'
        el.style.color = '#333333'
      }
    })
    
    container.appendChild(clonedContent)
    document.body.appendChild(container)

    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794, // A4 width in pixels at 96 DPI
    })

    // Remove temporary container
    document.body.removeChild(container)

    // Create PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Save the PDF
    pdf.save(filename)

    // Also return the blob for preview
    return pdf.output('blob')
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}

/**
 * Generate PDF blob without saving (for preview)
 * @param {HTMLElement} previewElement - The preview DOM element to convert
 * @returns {Promise<Blob>} - PDF blob
 */
export async function generatePDFBlob(previewElement) {
  try {
    if (!previewElement) {
      throw new Error('No preview element provided')
    }

    const container = document.createElement('div')
    container.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      width: 210mm;
      padding: 20mm;
      background-color: #ffffff !important;
      color: #000000 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `
    
    const clonedContent = previewElement.cloneNode(true)
    clonedContent.style.cssText = `
      background-color: #ffffff !important;
      color: #000000 !important;
      max-width: 170mm;
      margin: 0 auto;
      font-size: 16px;
      line-height: 1.6;
    `
    
    // Force simple colors on all child elements
    const allElements = clonedContent.querySelectorAll('*')
    allElements.forEach(el => {
      el.style.backgroundColor = el.style.backgroundColor || 'transparent'
      el.style.color = el.style.color || '#000000'
      
      if (el.tagName.match(/^H[1-6]$/)) {
        el.style.color = '#000000'
        el.style.borderColor = '#cccccc'
      }
      
      if (el.tagName === 'A') {
        el.style.color = '#0066cc'
      }
      
      if (el.tagName === 'CODE' || el.tagName === 'PRE') {
        el.style.backgroundColor = '#f5f5f5'
        el.style.color = '#000000'
        el.style.borderColor = '#dddddd'
      }
      
      if (el.tagName === 'BLOCKQUOTE') {
        el.style.backgroundColor = '#f9f9f9'
        el.style.borderLeftColor = '#cccccc'
        el.style.color = '#333333'
      }
    })
    
    container.appendChild(clonedContent)
    document.body.appendChild(container)

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
    })

    document.body.removeChild(container)

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    return pdf.output('blob')
  } catch (error) {
    console.error('Error generating PDF blob:', error)
    throw error
  }
}

