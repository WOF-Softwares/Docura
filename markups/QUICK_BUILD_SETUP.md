# 🚀 Quick Build Setup for Docura

## Environment Variables - Easy Setup

### Fish Shell (Your Primary Shell) 🐟

**Auto-loaded on startup!** No command needed.
Just open a new Fish shell and the variables are ready.

Or manually load:
```fish
docura_build_env
```

### Bash/Zsh 

```bash
docura_build_env
```

## 📋 What Gets Set

```
DROPBOX_CLIENT_ID     = oni7s2m0zhzjqb1
DROPBOX_CLIENT_SECRET = r9oyjntvotwlp4x
DROPBOX_REDIRECT_URI  = https://wof-softwares.github.io/Docura/oauth-redirect.html
```

## 🏃 Quick Start

### For Fish (Recommended):
```fish
# Variables auto-load, just build!
npm run tauri dev
```

### For Bash/Zsh:
```bash
docura_build_env
npm run tauri dev
```

## 📂 Files Modified

- **Fish:**
  - `~/.config/fish/config.fish` - Auto-load variables
  - `~/.config/fish/functions/docura_build_env.fish` - Manual function

- **Bash:**
  - `~/.bashrc` - Variables + alias

- **Zsh:**
  - `~/.zshrc` - Variables + alias (if exists)

## ✅ Verify Setup

**Check if variables are loaded:**

Fish:
```fish
echo $DROPBOX_CLIENT_ID
# Should show: oni7s2m0zhzjqb1
```

Bash/Zsh:
```bash
echo $DROPBOX_CLIENT_ID
# Should show: oni7s2m0zhzjqb1
```

## 🔧 Troubleshooting

**Variables not set?**

1. **Fish**: Open new terminal (auto-loads)
2. **Bash/Zsh**: Run `docura_build_env` first

**Still not working?**

```bash
# Reload shell config
source ~/.bashrc  # Bash
source ~/.zshrc   # Zsh

# Or just open a new terminal
```

## 🎯 Build Commands

```bash
# Development
npm run tauri dev

# Production
npm run tauri build

# With clean build
npm run tauri build -- --clean
```

## 📚 Related Docs

- Full setup: `DROPBOX_CREDENTIALS_SETUP.md`
- Complete guide: `DROPBOX_READY_TO_GO.md`
- Implementation: `COMPLETE_DROPBOX_INTEGRATION_SUMMARY.md`

---

**TL;DR:** Open Fish terminal → Variables auto-load → Run `npm run tauri dev` → Done! 🚀

