# 🔄 CI/CD Automation - Complete Setup

## Overview

Docura now has a **fully automated CI/CD pipeline** that handles everything from building packages to updating the website - with a single command!

## 🚀 What's Automated

### Single Command Release

```bash
scripts/build-prod.sh --release
```

This one command does **everything**:

1. ✅ **Builds all packages** (.deb, .rpm, .pkg.tar.xz)
2. ✅ **Auto-increments version** (1.0.4 → 1.0.5)
3. ✅ **Creates git tag** (v1.0.5)
4. ✅ **Pushes tag to GitHub**
5. ✅ **Creates GitHub Release** with packages
6. ✅ **Updates website** (docs/index.html):
   - Version numbers in meta tags
   - Download links
   - Installation commands
7. ✅ **Copies packages** to docs/downloads/
8. ✅ **Commits & pushes** all changes

## 📋 Available Commands

### Basic Build
```bash
scripts/build-prod.sh
# - Builds packages
# - Auto-increments version
# - No git operations
```

### Build + Create Tag
```bash
scripts/build-prod.sh --tag
# - Builds packages
# - Creates and pushes git tag
# - No GitHub release
```

### Full Release (Recommended!)
```bash
scripts/build-prod.sh --release
# - Everything above
# - Creates GitHub release
# - Updates website
# - Commits and pushes changes
```

### Version Management
```bash
# Normal build: 1.0.4 → 1.0.5 (auto-increment)
scripts/build-prod.sh

# Major version bump: 1.0.4 → 2.0.0
scripts/build-prod.sh --major

# Release with major bump
scripts/build-prod.sh --major --release
```

### Other Flags
```bash
--clean       # Clean previous builds first
--build-pkg   # Also build Arch package with makepkg
```

## 🔧 How It Works

### Version Management

1. **Version Source**: `version.info` (TOML format)
   ```toml
   version = "1.0.4"
   ```

2. **Auto-Sync**: Script automatically updates `src-tauri/tauri.conf.json`

3. **Auto-Increment**: 
   - Normal: 1.0.4 → 1.0.5 → ... → 1.0.9 → 1.1.0
   - Major: 1.0.4 → 2.0.0 (with --major flag)

### Website Updates (When Using --release)

The script automatically updates `docs/index.html`:

1. **Version Numbers**:
   ```javascript
   "version": "1.0.4"  →  "version": "1.0.5"
   "softwareVersion": "1.0.4"  →  "softwareVersion": "1.0.5"
   "Docura v1.0.4"  →  "Docura v1.0.5"
   ```

2. **Download Links**:
   ```html
   href="downloads/docura-bin-1.0.4-1-x86_64.pkg.tar.xz"
   →
   href="downloads/docura-bin-1.0.5-1-x86_64.pkg.tar.xz"
   ```

3. **Installation Commands**:
   ```bash
   sudo pacman -U docura-bin-1.0.4-1-x86_64.pkg.tar.xz
   →
   sudo pacman -U docura-bin-1.0.5-1-x86_64.pkg.tar.xz
   ```

### Package Distribution

After release, packages are available in:

1. **GitHub Releases**: https://github.com/WOF-Softwares/Docura/releases
   - Attached as release assets
   - Auto-uploaded by script

2. **Website Downloads**: https://wof-softwares.github.io/Docura/downloads/
   - Auto-copied from packaging/arch/
   - Direct download links in website

3. **Source Directory**: `packaging/arch/`
   - Original build location
   - For local installation/testing

## 📦 Package Files Generated

For version 1.0.4:

- **Arch Linux**: `docura-bin-1.0.4-1-x86_64.pkg.tar.xz`
- **Debian/Ubuntu**: `docura_1.0.4_amd64.deb`
- **Fedora/RHEL**: `docura-1.0.4-1.x86_64.rpm`

## 🎯 Typical Release Workflow

### Development
```bash
# Make changes
git add .
git commit -m "feat: add awesome feature"
```

### Release
```bash
# One command to rule them all!
scripts/build-prod.sh --release

# The script does:
# 1. Builds all packages
# 2. Version: 1.0.4 → 1.0.5
# 3. Tag: creates v1.0.5
# 4. Release: uploads to GitHub
# 5. Website: updates docs/index.html
# 6. Packages: copies to docs/downloads/
# 7. Git: commits and pushes everything
```

### Result
- ✅ New version live on GitHub Releases
- ✅ Website updated with new download links
- ✅ All changes committed and pushed
- ✅ Users can download immediately from website or GitHub

## 🚀 Benefits

### For Developers
- **Zero manual work** - Everything automated
- **No version conflicts** - Single source of truth
- **No forgotten updates** - Script handles everything
- **Fast releases** - One command, done!

### For Users
- **Always up-to-date** - Website shows latest version
- **Direct downloads** - Packages available immediately
- **Multiple sources** - GitHub or website downloads
- **Clear instructions** - Install commands always correct

## 📝 Requirements

### Tools Needed
- `npm` and `node` (for building frontend)
- `cargo` and `rustc` (for Tauri backend)
- `git` (for version control)
- `gh` CLI (for GitHub releases) - Install: https://cli.github.com/

### Optional
- `jq` (for JSON parsing) - Falls back to `sed` if missing
- `makepkg` (for Arch package building) - Only needed with `--build-pkg`

## 🔐 GitHub Token

The `gh` CLI needs authentication:

```bash
# Login to GitHub (one-time setup)
gh auth login

# Follow the prompts to authenticate
```

## 📊 File Changes Overview

### Modified Files
1. **scripts/build-prod.sh**
   - Added `--release` automation
   - Website update logic
   - Package copying
   - Git operations

2. **docs/index.html**
   - Updated to version 1.0.4
   - Download links corrected
   - Installation commands updated
   - Ready for auto-updates

3. **README.md**
   - Added CI/CD documentation
   - Usage examples
   - Workflow explanation

4. **version.info**
   - Current version: 1.0.4
   - Auto-managed by script

### Created Files
1. **docs/CI_CD_AUTOMATION.md** (this file)
   - Complete CI/CD documentation
   - Usage guide
   - Technical details

## 🎉 Success!

Docura now has a **professional CI/CD pipeline** that:
- Automates releases completely
- Keeps website in sync
- Manages versions automatically
- Distributes packages efficiently

**One command to release everything!** 🚀

---

**Made with ❤️ for the Docura project**

*Last Updated: October 13, 2025*

