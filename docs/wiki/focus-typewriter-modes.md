---
title: "Focus Mode & Typewriter Mode"
category: "Writing Modes"
difficulty: "Beginner"
readTime: "8 min read"
---

# 🎯 Focus Mode & Typewriter Mode

## 📝 Overview

Docura includes two powerful writing modes inspired by Typora - but **BETTER**!

- **Focus Mode (F8)** - Dynamic overlay spotlight on current paragraph
- **Typewriter Mode (F9)** - Auto-scrolling to keep cursor centered

**Fun fact:** After comparing with Typora, users said *"Typora's focus mode is a joke! We won!"* 🏆

---

## 🎯 Focus Mode (F8)

### What is Focus Mode?

Focus Mode **dims everything except the paragraph you're currently writing** - creating a distraction-free environment perfect for deep work!

### How It Works

When you press **F8**:
1. ✨ **Dark overlay** covers the entire screen
2. 🎯 **Bright cutout** follows your cursor/paragraph
3. 🔄 **Tracks automatically** (mouse, keyboard, cursor)
4. 💫 **Smooth animations** when switching paragraphs

**Result:** Only your current work is visible! Everything else fades away! 🌟

### Why It's Better Than Typora

| Feature | Typora | Docura |
|---------|--------|--------|
| Visual Effect | Dims text slightly | **Dark overlay + spotlight** |
| Tracking | None | **Mouse, cursor, keyboard** |
| Animations | None | **Smooth 0.2s transitions** |
| ADHD-Friendly | Meh | **Highly effective!** |
| User Quote | *"It's a joke!"* | *"Perfect for ADHD!"* |

### How to Use

#### Enable Focus Mode:
```
Press F8
OR
Click the 🎯 Focus Mode button in toolbar
```

#### What You'll See:
- Dark overlay covering everything
- Bright spotlight on current paragraph
- Spotlight follows as you type/move
- Smooth transitions between paragraphs

#### Disable Focus Mode:
```
Press F8 again
OR
Click the toolbar button again
```

### Pro Tips

1. **🧠 ADHD-Friendly:** Users with ADHD report this mode is "perfect" for maintaining focus
2. **📝 Long Documents:** Especially helpful when writing articles, blog posts, or documentation
3. **🔄 Combine Modes:** Use Focus Mode + Typewriter Mode together for ULTIMATE focus! (F8 + F9)
4. **🖱️ Mouse Tracking:** Just hover over any paragraph to focus it
5. **⌨️ Keyboard Works:** Use arrow keys to navigate - focus follows!

### Technical Details

Focus Mode uses a **dynamic overlay with clip-path cutout**:
- Fixed overlay: `rgba(0, 0, 0, 0.75)` (dark!)
- Cutout updates every 100ms
- Tracks: `mousemove`, `click`, `keyup`, `keydown`, `input`, `selectionchange`
- Smooth animations: `transition: clip-path 0.2s ease`

**No conflicts with Vditor!** Works perfectly with all editing modes! ✅

---

## ⌨️ Typewriter Mode (F9)

### What is Typewriter Mode?

Typewriter Mode **keeps your cursor centered on the screen** - just like a real typewriter where the paper moves but the typing position stays fixed!

### How It Works

When you press **F9**:
1. 📜 **Document scrolls automatically** to center your cursor
2. 🎯 **Bright center line** shows exactly where the cursor stays
3. 🏷️ **Pulsing badge** ("TYPEWRITER MODE - Cursor Centered")
4. ✨ **Active line highlighted** with subtle glow
5. 📐 **Smart centering** (short docs centered, long docs scrollable)

**Result:** Your eyes always look at the same spot! No neck strain! 🎯

### Why Use Typewriter Mode?

**Benefits:**
- 🎯 **Consistent focus point** - Your eyes stay centered
- 💪 **Reduces neck strain** - No looking up/down
- ✍️ **Natural typing rhythm** - Mimics real typewriters
- 🧠 **Mental flow** - Typing position becomes muscle memory
- 😌 **Less distraction** - Eyes stay centered, mind stays focused

**Perfect For:**
- Long writing sessions
- Creative writing / fiction
- Blog posts and articles
- Academic papers
- Journal entries

### How to Use

#### Enable Typewriter Mode:
```
Press F9
OR
Click the ⌨️ Typewriter button in toolbar
```

#### What You'll See:
- **Pulsing badge** (top-right): "✍️ TYPEWRITER MODE - Cursor Centered"
- **Bright center line** (3px glowing horizontal line)
- **Active line highlight** (paragraph you're typing gets subtle purple glow)
- **Auto-scrolling** (document scrolls as you type to keep cursor centered!)

#### Disable Typewriter Mode:
```
Press F9 again
OR
Click the toolbar button again
```

### Visual Indicators

**1. Floating Badge (Top-Right):**
```
✍️ TYPEWRITER MODE - Cursor Centered
```
- Purple/indigo background
- White text
- Pulsing animation
- You CAN'T miss it! 😄

**2. Center Line:**
- 3px thick glowing line
- Marks where cursor stays
- Bright gradient effect
- Shows the "typing position"

**3. Active Line Highlight:**
- Subtle purple background
- Rounded corners
- Glowing border
- Makes current line stand out

### Pro Tips

1. **📝 Start typing** - The scrolling effect is most noticeable when actively writing
2. **🔄 Combine with Focus Mode** - Use F8 + F9 together for **ULTIMATE FOCUS**!
3. **📐 Use in Fullscreen** - F11 + F9 = Pure writing bliss
4. **⌨️ Keep rhythm** - The cursor stays put, you stay in flow
5. **👀 Watch the magic** - Notice how the document scrolls but cursor doesn't move!

### Typora-Style Smart Centering

Docura uses **Typora's margin auto approach**:

**For Short Documents:**
- Uses `margin: auto` for perfect centering
- No excessive scroll space
- Content stays naturally centered

**For Long Documents:**
- Padding creates scroll space
- Auto-scroll keeps cursor centered
- Smooth writing experience

**Best of both worlds!** 🎯

---

## 🔥 Combine Both Modes!

### The Ultimate Writing Experience

**Press F8 + F9 together:**
- 🎯 **Focus Mode** dims everything except current paragraph
- ⌨️ **Typewriter Mode** keeps cursor centered
- **Result:** PURE FOCUS! Perfect for deep work! 🧠✨

### Perfect For:
- 📝 Long writing sessions
- 🎨 Creative writing
- 📚 Academic papers
- ✍️ Blog posts
- 🧘 Distraction-free writing

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **F8** | Toggle Focus Mode |
| **F9** | Toggle Typewriter Mode |
| **F11** | Toggle Fullscreen |
| **Ctrl+B** | Toggle Sidebar |

**Power Combo:** F8 + F9 + F11 = **Maximum Focus!** 🚀

---

## 🎨 Visual Comparison

### Before (Normal Mode):
```
┌─────────────────────────┐
│  Paragraph 1            │
│  Paragraph 2            │
│  Paragraph 3 ← typing   │
│  Paragraph 4            │
│  Paragraph 5            │
└─────────────────────────┘
```

### After (Focus + Typewriter):
```
┌─────────────────────────┐
│  ████████████████████   │ ← Dark overlay
│  ████████████████████   │
│  ┌───────────────────┐  │ ← Cutout
│  │ Paragraph 3 ← 🎯  │  │ ← Centered & Highlighted
│  └───────────────────┘  │
│  ████████████████████   │ ← Dark overlay
└─────────────────────────┘
       ↑
  Center line
```

**DRAMATIC DIFFERENCE!** 🎭

---

## 🧠 ADHD-Friendly Design

**User testimonial:** *"Perfect for ADHD guys!"* 

**Why it works:**
1. **Strong visual contrast** - Dark overlay makes active area pop
2. **Dynamic tracking** - Follows your attention naturally  
3. **Smooth transitions** - No jarring changes
4. **Impossible to lose focus** - Literally spotlight on your work
5. **Centered cursor** - Eyes stay in one place

**This isn't just a feature - it's a LIFESAVER for focus!** 💜

---

## 🏆 The Victory

After testing against Typora:

**Typora Focus Mode:**
- Just dims text color
- Static, no tracking
- Barely noticeable
- User verdict: *"It's a joke!"*

**Docura Focus Mode:**
- Dynamic overlay spotlight
- Tracks everything
- Highly dramatic
- User verdict: *"Perfect for ADHD!"*

**We won!** 🏆🎉

---

## 🚀 Try It Now!

1. Open Docura
2. Switch to **Live** mode (Edit3 icon)
3. Press **F8** for Focus Mode
4. Press **F9** for Typewriter Mode
5. Start typing and **BE AMAZED!** 🤩

---

## 💡 FAQ

**Q: Can I use Focus Mode in Code/Preview mode?**  
A: Focus Mode works best in **Live** mode (Modern Vditor editor)

**Q: Does Typewriter Mode work with all themes?**  
A: Yes! All 17 themes supported! 🎨

**Q: Can I disable the visual indicators?**  
A: The indicators help you know the modes are active - they're designed to be helpful without being distracting!

**Q: Will this slow down my editor?**  
A: No! Highly optimized. Updates every 100-200ms with smooth animations.

**Q: Can I use this with other features?**  
A: Yes! Works with:
- ✅ All themes
- ✅ Dark/light modes
- ✅ Fullscreen (F11)
- ✅ All Vditor features

---

## 🎯 Summary

**Focus Mode (F8):**
- Dynamic overlay spotlight
- Tracks mouse, cursor, keyboard
- Perfect for ADHD
- **BEATS Typora!** 🏆

**Typewriter Mode (F9):**
- Auto-scrolls to center cursor
- Bright center line
- Pulsing badge
- Typora-style smart centering

**Together:**
- **ULTIMATE FOCUS!** 🚀
- Perfect for deep work
- Distraction-free writing
- Professional results

---

**Happy Focused Writing!** ✍️💜

*Want to learn more? Check out the [blog post about beating Typora](../blog/beating-typora-focus-mode.md)!*

