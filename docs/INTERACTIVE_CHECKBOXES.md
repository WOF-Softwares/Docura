# Interactive Checkboxes Feature 📝✅

## Overview

Docura now supports **interactive checkboxes** in markdown preview and live modes! Click checkboxes directly in the preview to toggle them, and the source markdown is automatically updated. This makes todo list management seamless and intuitive.

---

## Features

### ✨ What You Get

- **Click to Toggle**: Checkboxes are fully interactive in Preview and Live modes
- **Auto-Update**: Source markdown updates automatically when you click
- **Visual Feedback**: Hover effects and smooth animations
- **Theme-Aware**: Checkbox styling matches your current theme
- **Unsaved Indicator**: File is marked with unsaved changes dot
- **Multiple Formats**: Works with all markdown list styles
- **Real-time Sync**: Changes reflect immediately in all views

---

## How to Use

### Basic Usage

1. **Create a todo list** in markdown:
   ```markdown
   - [ ] Task to do
   - [x] Completed task
   ```

2. **Switch to Preview or Live mode**
3. **Click any checkbox** to toggle its state
4. **Save the file** with `Ctrl+S` when done

### Demo

Open the included `test-todos.md` file to try it out immediately!

---

## Supported Syntax

### Standard Checkboxes
```markdown
- [ ] Unchecked item
- [x] Checked item
- [X] Also checked (uppercase X)
```

### Different List Markers
```markdown
- [ ] With dash
* [ ] With asterisk
+ [ ] With plus
```

### Numbered Lists
```markdown
1. [ ] First task
2. [x] Second task (completed)
3. [ ] Third task
```

### Nested Lists
```markdown
- [ ] Parent task
  - [ ] Child task 1
  - [x] Child task 2
- [x] Another parent
```

### Mixed Content
```markdown
- [ ] Task with **bold** text
- [x] Task with *italic* text
- [ ] Task with `code`
- [ ] Task with [links](url)
```

---

## Technical Details

### How It Works

1. **Rendering**: MDEditor renders markdown with checkbox inputs
2. **Enhancement**: JavaScript makes checkboxes interactive
3. **Detection**: Click events are captured on checkboxes
4. **Matching**: Checkbox is matched to source markdown line
5. **Update**: Source markdown is updated with new state
6. **Re-render**: Preview updates to show new state

### Architecture

#### Components

**checkboxHandler.js** - Core utility functions:
- `makeCheckboxesInteractive()` - Adds click handlers to checkboxes
- `toggleCheckboxAtLine()` - Toggles checkbox at specific line
- `toggleCheckboxByText()` - Toggles checkbox by text content
- `extractCheckboxes()` - Parses checkboxes from markdown
- `findCheckboxLine()` - Finds line number for checkbox

**MainEditor.jsx** - Integration:
- Refs for preview containers
- MutationObserver for DOM changes
- useCallback for stable event handlers
- useEffect for setup and cleanup

### State Management

```javascript
// Checkbox toggle flow:
User clicks checkbox
  ↓
handleCheckboxToggle() called
  ↓
Find matching checkbox in markdown
  ↓
Toggle state in source text
  ↓
onContentChange() updates state
  ↓
Preview re-renders with new state
  ↓
makeCheckboxesInteractive() re-applies handlers
```

### DOM Selectors

- **Preview mode**: `.wmde-markdown` container
- **Live mode**: `.wmde-markdown-var` container
- **Checkboxes**: `input[type="checkbox"]` elements

---

## Styling

### CSS Enhancements

```css
/* Custom checkbox styling */
.wmde-markdown input[type="checkbox"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
  margin-right: 8px;
  accent-color: var(--accent-color);
}

/* Hover effect */
.wmde-markdown input[type="checkbox"]:hover {
  transform: scale(1.1);
}
```

### Theme Integration

Checkboxes automatically use your current theme's accent color for a cohesive look.

---

## Use Cases

### Personal Task Management
```markdown
## Today's Tasks
- [ ] Morning workout
- [ ] Check emails
- [ ] Team standup at 10am
- [ ] Lunch break
- [ ] Code review
- [ ] Write documentation
```

### Project Tracking
```markdown
## Sprint Goals
- [x] Design UI mockups
- [x] Set up database
- [ ] Implement authentication
- [ ] Write API endpoints
- [ ] Frontend integration
- [ ] Testing
- [ ] Deploy to staging
```

### Shopping Lists
```markdown
## Grocery Shopping
- [ ] Milk
- [x] Bread
- [ ] Eggs
- [x] Cheese
- [ ] Coffee
```

### Meeting Agenda
```markdown
## Team Meeting
- [x] Review last sprint
- [x] Discuss blockers
- [ ] Plan next sprint
- [ ] Assign tasks
- [ ] Set deadlines
```

---

## Best Practices

### 1. **Use Clear Text**
```markdown
✅ Good: - [ ] Fix login bug on mobile devices
❌ Avoid: - [ ] bug
```

### 2. **Keep Lists Organized**
Group related tasks together and use headers for clarity.

### 3. **Regular Saves**
Save your file regularly (`Ctrl+S`) to persist checkbox changes.

### 4. **Use Preview Mode**
For pure task management, Preview mode provides a clean, distraction-free view.

### 5. **Combine with Other Features**
- Use **bold** for important tasks
- Use *italic* for notes
- Use `code` for technical items
- Add links for references

---

## Keyboard Shortcuts

While in Preview/Live mode:
- **Click checkbox**: Toggle state
- **Ctrl+S**: Save changes
- **Ctrl+B**: Toggle sidebar
- **F11**: Toggle fullscreen

---

## Comparison with Other Editors

| Feature | Docura | Typora | Obsidian | VS Code |
|---------|--------|--------|----------|---------|
| Interactive Checkboxes | ✅ | ✅ | ✅ | ❌ |
| Preview Mode | ✅ | ✅ | ✅ | ✅ |
| Live Mode | ✅ | ✅ | ❌ | ❌ |
| Auto-save | Manual | Manual | Auto | Manual |
| Themes | 12 | Limited | Many | Many |

---

## Troubleshooting

### Checkboxes Not Interactive?

**Check these:**
1. Are you in Preview or Live mode? (Code mode doesn't support this)
2. Is the syntax correct? `- [ ]` or `- [x]`
3. Try refreshing by switching tabs

### Changes Not Saving?

**Solutions:**
1. Make sure to save with `Ctrl+S`
2. Check for unsaved changes indicator (dot in sidebar)
3. Verify file permissions

### Checkbox Style Issues?

**Try:**
1. Switch themes to see if it's theme-specific
2. Check if custom CSS is interfering
3. Restart the app

---

## Future Enhancements

Planned improvements:
- [ ] Right-click context menu for checkboxes
- [ ] Keyboard navigation (Space to toggle)
- [ ] Progress indicators for checkbox lists
- [ ] Date/time stamps for completed tasks
- [ ] Filter completed/incomplete tasks
- [ ] Export todo lists to other formats

---

## Code Examples

### Basic Implementation

```javascript
// Toggle checkbox at specific line
const updatedContent = toggleCheckboxAtLine(content, lineNumber)

// Toggle by text content
const updatedContent = toggleCheckboxByText(content, "Task text", 0)

// Extract all checkboxes
const checkboxes = extractCheckboxes(content)
// Returns: [{ line: 0, text: "Task", checked: false }, ...]
```

### Integration Example

```javascript
// Make checkboxes interactive
makeCheckboxesInteractive(previewElement, (info) => {
  // Handle checkbox toggle
  const { text, checked, index } = info
  const newContent = toggleCheckboxByText(content, text, index)
  updateContent(newContent)
})
```

---

## Performance

- **Fast**: Checkbox detection uses efficient regex
- **Optimized**: MutationObserver only watches necessary changes
- **Stable**: useCallback prevents unnecessary re-renders
- **Smooth**: 100ms delay ensures DOM is ready

---

## Accessibility

The interactive checkboxes maintain proper accessibility:
- ✅ Keyboard accessible (native checkbox behavior)
- ✅ Screen reader friendly (native input elements)
- ✅ High contrast support (theme-aware)
- ✅ Focus indicators (browser default)

---

## Credits

This feature is inspired by:
- Typora's interactive checkboxes
- Obsidian's task management
- GitHub's markdown rendering

Built with love for the Docura community! 💙

---

## Feedback

Have suggestions or found a bug? Please:
1. Open an issue on GitHub
2. Describe the expected vs actual behavior
3. Include markdown examples
4. Share your use case

We love hearing from our users! 🎉

