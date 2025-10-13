# 🔧 Debug Guide: Focus Mode & Typewriter Mode

## Changes Made to Fix the Issues

### 1. **VditorEditor.jsx** - Updated Element Detection
- ✅ Added fallback logic to find Vditor WYSIWYG element
- ✅ Added console logs to debug attribute setting
- ✅ Removed invalid Vditor config options (`typewriterMode`, `focus`)
- ✅ Try multiple paths: `vditor.wysiwyg.element` or `.vditor-wysiwyg` selector

### 2. **App.css** - Updated CSS Selectors
- ✅ Removed `>` (direct child) selector for better compatibility
- ✅ Added `!important` to override Vditor's default styles
- ✅ Added `.vditor-wysiwyg__block` class support
- ✅ Now targets ANY nested elements, not just direct children

## How to Test

### Step 1: Open Dev Tools Console
1. Open Docura in browser (http://localhost:1420 or http://localhost:5173)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab

### Step 2: Create/Open a File
1. Create a new file (Ctrl+N) or open existing file
2. Switch to **Live mode** (middle tab)
3. Type some content (paragraphs, headings)

### Step 3: Test Focus Mode
1. Press **F8** or click the **🎯 Focus** button
2. **Check Console** - You should see:
   ```
   ✅ Focus mode enabled on: vditor-wysiwyg
   ```
3. **Check Styles** - Paragraphs should dim to 30% opacity
4. **Hover over paragraphs** - They should become 100% opacity

### Step 4: Test Typewriter Mode
1. Press **F9** or click the **⌨️ Typewriter** button
2. **Check Console** - You should see:
   ```
   ✅ Typewriter mode enabled on: vditor-wysiwyg
   ```
3. **Check Padding** - Editor should have 50vh padding top/bottom
4. **Type and scroll** - Cursor should stay centered

## Debugging Checklist

### If Console Shows Warning
```
⚠️ Could not find Vditor wysiwyg element for focus mode
```

**This means:**
- The element detection failed
- Vditor might use a different structure

**Solution:**
1. Inspect the Vditor element in DevTools (Elements tab)
2. Find the actual class name for WYSIWYG mode
3. Update the selector in `VditorEditor.jsx`

### If Styles Don't Apply

**Check in DevTools Elements tab:**
1. Find the `.vditor-wysiwyg` element
2. Check if `data-focus="true"` or `data-typewriter="true"` attribute is set
3. Check if CSS rules are being applied (look for strikethrough if overridden)

**If attribute IS set but styles don't work:**
- CSS specificity issue - add more `!important`
- Wrong selector - check actual DOM structure

**If attribute is NOT set:**
- JavaScript issue - check console for errors
- Element not found - update element detection logic

## Manual DOM Inspection

### Find the WYSIWYG Element
```javascript
// Run in browser console:
const vditorEl = document.querySelector('.vditor-wysiwyg')
console.log('Vditor WYSIWYG element:', vditorEl)
console.log('Children:', vditorEl?.children)
console.log('Classes:', vditorEl?.className)
```

### Test Attribute Setting
```javascript
// Run in browser console:
const vditorEl = document.querySelector('.vditor-wysiwyg')
vditorEl.setAttribute('data-focus', 'true')
console.log('Attribute set:', vditorEl.getAttribute('data-focus'))
```

### Test CSS Application
```javascript
// Run in browser console:
const vditorEl = document.querySelector('.vditor-wysiwyg')
const style = window.getComputedStyle(vditorEl.querySelector('p'))
console.log('Paragraph opacity:', style.opacity)
```

## Expected Console Output

### When Focus Mode Enabled (F8):
```
✅ Focus mode enabled on: vditor-wysiwyg
```

### When Focus Mode Disabled:
```
❌ Focus mode disabled
```

### When Typewriter Mode Enabled (F9):
```
✅ Typewriter mode enabled on: vditor-wysiwyg
```

### When Typewriter Mode Disabled:
```
❌ Typewriter mode disabled
```

## CSS Inspection

### Check if CSS is loaded:
```javascript
// Run in browser console:
const styles = Array.from(document.styleSheets)
  .map(s => Array.from(s.cssRules || []))
  .flat()
  .filter(r => r.selectorText?.includes('data-focus'))
console.log('Focus mode CSS rules:', styles)
```

### Check if styles apply to elements:
```javascript
// Run in browser console:
const vditorEl = document.querySelector('.vditor-wysiwyg')
vditorEl.setAttribute('data-focus', 'true')

const paragraphs = vditorEl.querySelectorAll('p')
paragraphs.forEach(p => {
  const style = window.getComputedStyle(p)
  console.log('Paragraph opacity:', style.opacity, 'transition:', style.transition)
})
```

## Common Issues & Fixes

### Issue 1: Vditor Not in WYSIWYG Mode
**Symptom:** No `.vditor-wysiwyg` element found  
**Fix:** Make sure you're in Live mode (not Code or Preview)

### Issue 2: Element Found but Styles Don't Apply
**Symptom:** Console shows "enabled" but no visual change  
**Fix:** Check CSS specificity - Vditor might have stronger selectors

### Issue 3: Styles Apply but Get Overridden
**Symptom:** Styles flash then disappear  
**Fix:** Add more `!important` or increase selector specificity

### Issue 4: Works on Hover but Not by Default
**Symptom:** Elements only dim when you hover  
**Fix:** Check if `:hover` selector has higher specificity

## Vditor DOM Structure Reference

Expected structure:
```html
<div class="vditor">
  <div class="vditor-toolbar">...</div>
  <div class="vditor-content">
    <div class="vditor-wysiwyg" data-focus="true" data-typewriter="true">
      <p>Paragraph 1</p>
      <p>Paragraph 2</p>
      ...
    </div>
  </div>
</div>
```

## Quick Fix Commands

### Rebuild CSS:
```bash
npm run build
```

### Clear Cache and Restart:
```bash
rm -rf dist/
npm run build
npm run dev
```

### Check Built CSS:
```bash
grep -A 10 "data-focus" dist/assets/*.css
```

## Next Steps if Still Not Working

1. **Share Console Output** - Copy all console logs when toggling modes
2. **Share DOM Structure** - Right-click `.vditor-wysiwyg` → Copy → Copy outerHTML
3. **Share Computed Styles** - Check what styles are actually applied
4. **Check Network Tab** - Make sure CSS file is loaded

## Alternative Approaches

If current approach doesn't work, we can try:

### Approach 1: Use Inline Styles
Instead of CSS classes, apply styles directly via JavaScript

### Approach 2: Use Vditor's Built-in Methods
Check if Vditor has any API methods for custom styling

### Approach 3: Wrapper Element
Wrap the entire Vditor in a div with data attributes and style that

---

**Run the tests above and share:**
1. Console output when pressing F8/F9
2. DOM structure of `.vditor-wysiwyg` element
3. Any errors or warnings

This will help identify the exact issue! 🔍

