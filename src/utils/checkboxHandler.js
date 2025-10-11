/**
 * Utility for handling interactive checkboxes in markdown preview
 */

/**
 * Toggles a checkbox in markdown content
 * @param {string} content - The full markdown content
 * @param {number} lineNumber - The line number (0-based) containing the checkbox
 * @returns {string} - Updated markdown content
 */
export function toggleCheckboxAtLine(content, lineNumber) {
  const lines = content.split('\n')
  
  if (lineNumber < 0 || lineNumber >= lines.length) {
    return content
  }
  
  const line = lines[lineNumber]
  
  // Match checkbox patterns: - [ ] or - [x] or - [X] or * [ ] or * [x] etc.
  // Also supports numbered lists: 1. [ ] or 1. [x]
  const checkboxRegex = /^(\s*(?:[-*+]|\d+\.)\s+)\[([xX ])\](\s+.*)$/
  const match = line.match(checkboxRegex)
  
  if (match) {
    const prefix = match[1]
    const currentState = match[2]
    const suffix = match[3]
    
    // Toggle: ' ' -> 'x', 'x' or 'X' -> ' '
    const newState = currentState === ' ' ? 'x' : ' '
    lines[lineNumber] = `${prefix}[${newState}]${suffix}`
  }
  
  return lines.join('\n')
}

/**
 * Finds the line number of a checkbox element in the markdown
 * @param {string} content - The markdown content
 * @param {string} checkboxText - The text content of the checkbox
 * @param {number} occurrence - Which occurrence of this text to find (0-based)
 * @returns {number} - Line number (0-based) or -1 if not found
 */
export function findCheckboxLine(content, checkboxText, occurrence = 0) {
  const lines = content.split('\n')
  let foundCount = 0
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Check if line contains a checkbox and the text
    if (/^\s*(?:[-*+]|\d+\.)\s+\[[xX ]\]/.test(line)) {
      // Extract the text after the checkbox
      const textMatch = line.match(/^\s*(?:[-*+]|\d+\.)\s+\[[xX ]\]\s+(.*)$/)
      if (textMatch && textMatch[1].trim() === checkboxText.trim()) {
        if (foundCount === occurrence) {
          return i
        }
        foundCount++
      }
    }
  }
  
  return -1
}

/**
 * Makes checkboxes in a preview element interactive
 * @param {HTMLElement} previewElement - The preview container element
 * @param {function} onCheckboxToggle - Callback function(lineNumber, newState)
 */
export function makeCheckboxesInteractive(previewElement, onCheckboxToggle) {
  if (!previewElement) return
  
  // Find all checkbox inputs in the preview
  const checkboxes = previewElement.querySelectorAll('input[type="checkbox"]')
  
  checkboxes.forEach((checkbox, index) => {
    // Remove any existing listeners to avoid duplicates
    const newCheckbox = checkbox.cloneNode(true)
    checkbox.parentNode.replaceChild(newCheckbox, checkbox)
    
    // Make checkbox interactive
    newCheckbox.style.cursor = 'pointer'
    newCheckbox.disabled = false
    
    // Add click handler
    newCheckbox.addEventListener('change', (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      // Get the label text associated with this checkbox
      const listItem = newCheckbox.closest('li')
      if (!listItem) return
      
      // Get the text content (excluding the checkbox)
      const textContent = Array.from(listItem.childNodes)
        .filter(node => node !== newCheckbox && node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent)
        .join('')
        .trim()
      
      // Call the callback with the text and checkbox state
      if (onCheckboxToggle) {
        onCheckboxToggle({
          text: textContent,
          checked: newCheckbox.checked,
          index: index
        })
      }
    })
  })
}

/**
 * Extracts checkbox information from markdown content
 * @param {string} content - The markdown content
 * @returns {Array} - Array of checkbox objects with line, text, and checked state
 */
export function extractCheckboxes(content) {
  const lines = content.split('\n')
  const checkboxes = []
  
  lines.forEach((line, lineNumber) => {
    const checkboxRegex = /^\s*(?:[-*+]|\d+\.)\s+\[([xX ])\]\s+(.*)$/
    const match = line.match(checkboxRegex)
    
    if (match) {
      checkboxes.push({
        line: lineNumber,
        text: match[2].trim(),
        checked: match[1].toLowerCase() === 'x'
      })
    }
  })
  
  return checkboxes
}

/**
 * Toggles a checkbox by its text content
 * @param {string} content - The markdown content
 * @param {string} checkboxText - The text of the checkbox to toggle
 * @param {number} occurrence - Which occurrence to toggle (0-based)
 * @returns {string} - Updated markdown content
 */
export function toggleCheckboxByText(content, checkboxText, occurrence = 0) {
  const lineNumber = findCheckboxLine(content, checkboxText, occurrence)
  if (lineNumber === -1) return content
  return toggleCheckboxAtLine(content, lineNumber)
}

