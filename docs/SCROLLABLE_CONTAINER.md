# Advanced Scrollable Container

The `ScrollableContainer` component provides a sophisticated, customizable scrolling solution for Docura's sidebar and other UI elements.

## Features

### 🎨 **Custom Styling**
- Fully customizable scrollbar appearance
- Configurable width, colors, and hover effects
- Theme-aware with CSS variable support
- Smooth animations and transitions

### 🖱️ **Advanced Interactions**
- Drag-and-drop scrollbar thumb
- Click-to-scroll on track
- Auto-hide on mouse leave
- Hover effects with visual feedback

### 📱 **Responsive Design**
- Adapts to container size changes
- ResizeObserver for dynamic content
- Proper overflow handling
- Cross-browser compatibility

### 🔧 **Developer API**
- Ref-based programmatic scrolling
- Scroll position monitoring
- Event callbacks
- Imperative methods for external control

## Usage

### Basic Usage
```jsx
import ScrollableContainer from './components/ScrollableContainer'

<ScrollableContainer>
  <div>Your scrollable content here</div>
</ScrollableContainer>
```

### Advanced Configuration
```jsx
<ScrollableContainer 
  ref={scrollRef}
  className="custom-container"
  thumbColor="var(--accent-color)"
  thumbHoverColor="var(--primary-color)"
  scrollbarWidth={8}
  autoHide={true}
  smoothScroll={true}
  onScroll={(e) => console.log('Scrolled!', e)}
>
  <YourContent />
</ScrollableContainer>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Content to be scrolled |
| `className` | string | '' | Additional CSS classes |
| `maxHeight` | string | 'auto' | Maximum height of container |
| `showScrollbar` | boolean | true | Whether to show custom scrollbar |
| `scrollbarWidth` | number | 8 | Width of scrollbar in pixels |
| `trackColor` | string | 'transparent' | Background color of scrollbar track |
| `thumbColor` | string | 'var(--border-color)' | Color of scrollbar thumb |
| `thumbHoverColor` | string | 'var(--text-secondary)' | Thumb color on hover |
| `onScroll` | function | null | Scroll event callback |
| `autoHide` | boolean | true | Auto-hide scrollbar when not hovering |
| `smoothScroll` | boolean | true | Enable smooth scrolling behavior |

## Ref Methods

When using a ref, you get access to these methods:

```jsx
const scrollRef = useRef(null)

// Programmatic scrolling
scrollRef.current?.scrollTo(100)        // Scroll to specific position
scrollRef.current?.scrollToTop()        // Scroll to top
scrollRef.current?.scrollToBottom()     // Scroll to bottom

// Get scroll information
const scrollTop = scrollRef.current?.getScrollTop()
const scrollHeight = scrollRef.current?.getScrollHeight()
```

## CSS Classes

The component supports several CSS modifier classes:

- `.auto-hide` - Scrollbar auto-hides (default)
- `.always-show` - Scrollbar always visible
- `.smooth-scroll` - Smooth scrolling enabled
- `.no-smooth-scroll` - Instant scrolling
- `.thin-scrollbar` - 6px width
- `.thick-scrollbar` - 12px width

## Implementation Details

### Scrollbar Calculation
The scrollbar thumb size and position are calculated based on:
- Container height vs content height ratio
- Current scroll position percentage
- Minimum thumb height (20px) for usability

### Performance Optimizations
- ResizeObserver for efficient size change detection
- Throttled scroll events
- CSS transforms for smooth thumb movement
- Minimal DOM reflows

### Accessibility
- Proper focus indicators
- Keyboard navigation support
- ARIA-compliant markup
- Screen reader friendly

## Browser Support

- **Chrome/Edge**: Full support with webkit scrollbar hiding
- **Firefox**: Full support with scrollbar-width: none
- **Safari**: Full support with webkit scrollbar hiding
- **Internet Explorer**: Basic support (fallback to native scrollbars)

## Integration with Sidebar

The Sidebar component now uses ScrollableContainer for both file tree and outline views:

```jsx
// File tree with custom scrolling
<ScrollableContainer 
  ref={fileTreeScrollRef}
  thumbColor="var(--border-color)"
  thumbHoverColor="var(--accent-color)"
  scrollbarWidth={6}
  autoHide={true}
>
  <div className="file-tree">
    {renderFileTree(files)}
  </div>
</ScrollableContainer>
```

This provides:
- ✅ No hidden files in deep folder structures
- ✅ Professional, theme-consistent scrollbars
- ✅ Smooth user experience
- ✅ Accessibility compliance
- ✅ Performance optimization

## Future Enhancements

Potential improvements for future versions:
- Horizontal scrolling support
- Kinetic scrolling on mobile
- Scroll indicator/position hints
- Virtual scrolling for large datasets
- Scroll sync between multiple containers