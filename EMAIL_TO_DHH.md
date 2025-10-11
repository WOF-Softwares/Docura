# Email to DHH - Docura with Omarchy Integration

---

**To:** dhh@hey.com  
**Subject:** Built Omarchy Integration Into Docura - Respecting Your Philosophy  

---

Hi David,

I hope this email finds you well. I'm reaching out to share something I built that I think you'll appreciate—especially as an Omarchy user.

## **Docura: A Markdown Editor That Respects Omarchy**

I built **Docura**, an open-source markdown editor for Arch Linux (Tauri + Rust + React). What makes it special is **native Omarchy integration** that follows your philosophy of opinionated software.

### **What Makes the Omarchy Integration Different**

Most apps add "theme import" and let users override everything. That misses the point.

**Docura respects Omarchy's control:**
- ✅ Auto-detects Omarchy environment (`omarchy-theme-current`)
- ✅ Syncs themes automatically (Dracula, Nord, Catppuccin, etc.)
- ✅ Uses your Omarchy font in the editor
- 🔒 **When sync is enabled, manual theme changes are blocked**

That last point is intentional. Just like Rails respects convention over configuration—when you choose Omarchy to control your themes, Docura honors that choice. No fighting, no half-measures.

### **The Philosophy in Code**

```javascript
// When Omarchy sync is enabled
if (omarchySyncEnabled) {
  toast.error('Please disable Omarchy sync first')
  return // Omarchy is in control
}
```

It's not user-hostile—it's philosophically consistent. You taught us that opinionated software is good software.

### **Technical Highlights**

- **96% smaller than Typora** (12 MB vs 326 MB)
- **Three editing modes**: Code (Monaco), Live (WYSIWYG), Preview (Typora-style)
- **Native Arch Linux support**: Tiling WM detection, native dialogs
- **Built in 2 days** with AI assistance (transparent about it)
- **Apache 2.0 licensed**

### **Easy Installation (Arch Linux)**

```bash
# Download the package
wget https://github.com/WOF-Softwares/Docura/releases/download/v1.1/docura-1.0.0-1-x86_64.pkg.tar.zst

# Install with pacman
sudo pacman -U docura-1.0.0-1-x86_64.pkg.tar.zst

# Or use the AUR (coming soon)
yay -S docura-bin
```

The Omarchy integration works out of the box—it just detects and syncs.

### **Why I'm Sharing This**

1. **You inspired it** - Your writing on opinionated software shaped how I built this
2. **Omarchy deserves this** - Great tools should work together seamlessly  
3. **Others can learn** - Open source example of respectful integration
4. **You might actually use it** - If it's good enough for Omarchy users, it's good enough

### **See It In Action**

- **Live site**: https://wof-softwares.github.io/Docura/
- **GitHub**: https://github.com/WOF-Softwares/Docura
- **Blog post**: "Respecting Omakase: Why We Built DHH's Philosophy Into Docura"

The README has a dedicated Omarchy section with theme mappings, usage guide, and a note thanking you for Rails, Basecamp, and Omarchy.

---

## **No Expectations—Just Gratitude**

I don't expect a response (I know you're busy running 37signals and building amazing things). But if you have 5 minutes to test it on your Omarchy setup, I'd love to hear what you think.

Even if you never use it, **thank you** for:
- Rails - showed us convention over configuration
- Your writing - taught us to have opinions
- Omarchy - proved Linux can be beautiful and opinionated
- Your example - inspired a generation of developers

This integration exists because you showed us that opinionated software, done right, is liberating.

---

**Best regards,**

[Your Name]

**P.S.** The entire integration—detection, font sync, theme mapping, control respect—is ~200 lines of Rust + JavaScript. Simple, opinionated, it just works. Just like you'd build it. 🙏

---

## Links

- **Website**: https://wof-softwares.github.io/Docura/
- **GitHub**: https://github.com/WOF-Softwares/Docura  
- **Releases**: https://github.com/WOF-Softwares/Docura/releases
- **Omarchy Docs**: https://github.com/WOF-Softwares/Docura/blob/master/docs/OMAKASE_INTEGRATION.md

---


