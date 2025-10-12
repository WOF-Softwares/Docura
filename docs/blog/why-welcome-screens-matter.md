---
title: "Why Every Great Editor Needs a Welcome Screen"
date: "October 12, 2025"
readTime: "10 min read"
author: "Docura Team"
tags: ["ux", "design", "philosophy", "typora"]
---

# Why Every Great Editor Needs a Welcome Screen

## The Blank Canvas Problem

Open Typora for the first time. What do you see?

**Nothing.**

A blank white (or black) window. No guidance. No suggestions. No recent files. No shortcuts. Just... emptiness.

Now open VSCode, Cursor, or Docura. What do you see?

**Everything you need to get started.**

This isn't a coincidence. This is **intentional design**. And the difference is stark.

---

## The 326 MB Editor vs The 12 MB Editor

Let's talk about an uncomfortable truth: **Typora, at 326 MB, doesn't have a welcome screen.** 

Docura, at **12 MB** (96% smaller!), has a beautiful, feature-rich welcome screen inspired by VSCode and Cursor - but more compact and responsive.

Think about that for a moment. We built a complete markdown editor **27 times smaller** than Typora, yet we found time and space to implement:

- 🌅 Time-based personalized greetings (Good Morning/Afternoon/Evening/Night)
- ⚡ Quick actions (New File, Open Folder, Open File, Themes)
- 📜 Recent items (last 5 files/folders with full paths)
- ⌨️ Keyboard shortcuts reference
- 📱 Ultra-responsive design (works perfectly from 400px to 4K)
- 🪟 Tiling WM support (i3, sway, hyprland)

**How is it that the smaller, faster, free editor has better UX than the bloated, paid one?**

---

## What Great Editors Understand

### VSCode Gets It

VSCode pioneered the modern welcome screen. When you open it:
- **Quick actions** are immediately visible
- **Recent projects** are one click away
- **Learning resources** help new users
- **Keyboard shortcuts** are discoverable

Result? Users feel **welcomed**, not abandoned.

### Cursor Perfected It

Cursor (the AI-powered fork of VSCode) took it further:
- Cleaner design
- Better typography
- More contextual suggestions
- Seamless onboarding

Result? Professional developers feel **at home immediately**.

### Docura Learned From Both

We studied VSCode and Cursor, then asked: "How can we make this **even better**?"

Our welcome screen:
- **Adapts to time of day** - Good Morning at 7am, Good Night at 11pm
- **Uses your actual username** - Fetched from the system (via `whoami`)
- **Shows what YOU need** - Your recent files, not generic templates
- **Teaches as you go** - Keyboard shortcuts displayed in context
- **Works everywhere** - From ultrawide monitors to tiling WM half-screens
- **Respects high DPI** - Looks crisp on Retina/4K displays
- **Scales with Wayland** - Perfect at 150%, 200%, 300% scaling

And we did this while keeping the entire application at **12 MB**.

---

## Why Typora Still Shows a Blank Screen

I don't want to speculate too much, but there are a few possibilities:

### 1. **"Minimalism" as an Excuse**

Some might argue: "A blank screen is minimalist!"

No. A blank screen is **lazy**. 

Minimalism is about removing **unnecessary** elements while keeping **essential** ones. A welcome screen that helps users get started? That's essential.

VSCode is minimalist. Cursor is minimalist. They both have welcome screens.

### 2. **Legacy Codebase**

Typora might be built on an older architecture that makes adding a welcome screen difficult.

But that's not an excuse - that's a warning sign. If your codebase is so rigid you can't add basic UX improvements, you have a serious technical debt problem.

### 3. **They Don't See the Value**

This is the scariest possibility. If Typora's team doesn't understand why welcome screens matter, what else don't they understand about modern UX?

---

## The User Experience Gap

Let's compare the first 30 seconds of using each editor:

### Typora
1. Open app → Blank screen
2. Stare at emptiness
3. Remember you need to click File → Open
4. Navigate file system
5. Find your file
6. Finally start working

**Time to productivity: 30-60 seconds**  
**User feeling: Confused, lost**

### Docura
1. Open app → Beautiful welcome screen
2. See "Good Morning, Ehsan!" with 🌅
3. Click on recent file OR hit Ctrl+O
4. Start working immediately

**Time to productivity: 3-10 seconds**  
**User feeling: Welcomed, guided, productive**

That's a **6-10x improvement** in time-to-productivity. That's the difference between **frustration and delight**.

---

## What Makes a Great Welcome Screen?

Based on our research and implementation, here are the key principles:

### 1. **Contextual Personalization**
- Use the user's name (we fetch it from system)
- Adapt to time of day (morning, afternoon, evening, night)
- Show emoji that matches the greeting (🌅☀️🌆🌙)

### 2. **Immediate Actions**
- New File - most common action
- Open Folder - for project work
- Open File - for quick edits
- Themes - because everyone loves customization

### 3. **Recent History**
- Show last 5 files/folders
- Display full paths (so you know where they are)
- One-click to reopen
- Icons to distinguish files from folders

### 4. **Discoverability**
- Display key keyboard shortcuts
- Show Ctrl+N, Ctrl+O, Ctrl+P, Ctrl+S
- Help users learn as they go
- No need to hunt through menus

### 5. **Responsive Design**
- Works on 4K monitors (3840x2160)
- Works on laptops (1920x1080)
- Works on tablets (1024x768)
- Works in tiling WMs (even 400px half-screens!)
- Adapts to high DPI displays
- Respects Wayland scaling

### 6. **Visual Hierarchy**
- Greeting is prominent but not overwhelming
- Quick actions in compact card layout
- Recent items easily scannable
- Shortcuts reference at a glance

### 7. **Performance**
- Loads instantly (no lag)
- Renders smoothly (no jank)
- Adds minimal bundle size (~5KB CSS + 3KB JS)

---

## The Philosophy: Respect Through Design

Here's what a welcome screen **really** communicates:

**"We thought about you. We anticipated your needs. We want to help you get started quickly."**

A blank screen communicates:

**"Figure it out yourself. We couldn't be bothered."**

This is why Docura has a welcome screen and Typora doesn't. It's not about technical capability - it's about **philosophy**.

We believe:
- Users deserve to feel **welcomed**, not abandoned
- First impressions **matter**
- Good UX requires **anticipating** user needs, not just reacting to them
- Small touches (like time-based greetings) show **care**

---

## The Technical Implementation

Want to know the best part? Implementing this was **straightforward**.

### Backend (Rust/Tauri)
```rust
#[command]
async fn get_username() -> Result<String, String> {
    match Command::new("whoami").output() {
        Ok(output) => {
            if output.status.success() {
                let username = String::from_utf8_lossy(&output.stdout)
                    .trim()
                    .to_string();
                Ok(username)
            } else {
                env::var("USER").or_else(|_| env::var("USERNAME"))
                    .map_err(|_| "Could not determine username".to_string())
            }
        }
        Err(_) => {
            env::var("USER").or_else(|_| env::var("USERNAME"))
                .map_err(|_| "Could not determine username".to_string())
        }
    }
}
```

### Frontend (React)
```jsx
const [greeting, setGreeting] = useState({ text: 'Hello', emoji: '👋' })

useEffect(() => {
  const hour = new Date().getHours()
  
  if (hour >= 5 && hour < 12) {
    setGreeting({ text: 'Good Morning', emoji: '🌅' })
  } else if (hour >= 12 && hour < 17) {
    setGreeting({ text: 'Good Afternoon', emoji: '☀️' })
  } else if (hour >= 17 && hour < 21) {
    setGreeting({ text: 'Good Evening', emoji: '🌆' })
  } else {
    setGreeting({ text: 'Good Night', emoji: '🌙' })
  }
}, [])
```

### Styling (CSS)
```css
.welcome-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 1rem;
}

@media (max-width: 600px) {
  .welcome-screen-container {
    padding: 0.75rem 0.25rem;
  }
  /* More aggressive size reductions for tiling WMs */
}
```

**Total code added: ~165 lines of JSX, ~686 lines of CSS (with extensive responsive rules), 15 lines of Rust.**

That's it. That's all it takes to show you **care about your users**.

---

## The Status Bar: Another Example

While we were at it, we also added a **professional status bar** (like VSCode) that Typora doesn't have:

- Current file name
- Line and column position (Ln 20, Col 30)
- Word count
- Character count
- Encoding (UTF-8, etc.)
- Line ending (LF/CRLF)
- Indentation (2 Spaces, 4 Spaces, Tab)
- Settings gear icon

All of this in a **28px bar at the bottom**. Unobtrusive. Informative. Professional.

Typora? No status bar. You're writing blind.

---

## The Competitive Landscape

Let's be clear about where we stand:

### VSCode
- ✅ Excellent welcome screen
- ✅ Professional status bar
- ❌ Not a markdown editor (requires extensions)
- ❌ Heavy (200+ MB)

### Cursor
- ✅ Beautiful welcome screen
- ✅ Modern status bar
- ❌ Not a markdown editor
- ❌ Expensive ($20/month for Pro)

### Typora
- ❌ No welcome screen
- ❌ No status bar
- ✅ Markdown-focused
- ❌ Bloated (326 MB)
- ❌ Expensive ($14.99)

### Docura
- ✅ Beautiful welcome screen (inspired by VSCode/Cursor)
- ✅ Professional status bar
- ✅ Markdown-focused
- ✅ Lightweight (12 MB)
- ✅ Free and open source

We took the best from VSCode and Cursor, applied it to a markdown editor, made it **smaller and faster** than Typora, and released it **for free**.

---

## Lessons for Other Developers

If you're building an editor, IDE, or any productivity tool, here are the lessons:

### 1. **First Impressions Are Everything**
Your welcome screen is the first thing users see. Make it count.

### 2. **Anticipate Needs**
Don't wait for users to ask. Show them what they probably want to do next.

### 3. **Respect Context**
Time of day matters. Recent files matter. Keyboard shortcuts matter. Show all of it.

### 4. **Make It Responsive**
Your users aren't all on 1920x1080. Some use 4K. Some use tiling WMs. Design for **all of them**.

### 5. **Keep It Fast**
A slow welcome screen is worse than no welcome screen. Optimize everything.

### 6. **Test on Real Setups**
We tested on X11, Wayland, tiling WMs (i3, sway), high DPI displays, and various scaling factors. You should too.

### 7. **Learn from the Best**
VSCode and Cursor have incredible UX. Study them. Learn from them. Then make it your own.

---

## The Future

We're not stopping here. Future welcome screen improvements we're considering:

- **Project templates** - Start from markdown resume, blog post, documentation
- **Tips of the day** - Helpful tricks and features users might not know
- **Plugin recommendations** - When we add plugin support
- **Statistics** - Show writing stats (words written this week, etc.)
- **Weather integration** - Why not? Good Morning with actual weather! ☀️🌧️

But even without these, our current welcome screen is **miles ahead** of Typora's blank canvas.

---

## Conclusion: Small Details, Big Impact

A welcome screen seems like a small thing. It's "just" the first screen users see.

But that's exactly why it **matters so much**.

It sets the tone. It shows you care. It makes users feel **respected and welcomed** instead of **confused and abandoned**.

Typora charges $14.99 and gives you nothing.  
Docura costs $0.00 and greets you by name with a smile.

**That's the difference between treating users as transactions vs treating them as people.**

And that's why every great editor needs a welcome screen.

---

## Try It Yourself

Want to see the difference? 

1. Download Docura (12 MB, free)
2. Open it
3. See the greeting: "Good Morning, [YourName]! 🌅"
4. Click through recent items
5. Notice the keyboard shortcuts
6. Feel the difference

Then open Typora and see... nothing.

**The choice is yours. But we know which experience we'd choose.**

---

*Built with care by the Docura team. Open source. Always free. Always improving.*

🏠 [Try Docura Now](https://github.com/WOF-Softwares/Docura)

