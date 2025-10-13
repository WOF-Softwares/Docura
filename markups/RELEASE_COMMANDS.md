# 🚀 Quick Release Commands

## One-Command Release (Recommended!)

```bash
scripts/build-prod.sh --release
```

This does **everything automatically**:
- ✅ Builds all packages
- ✅ Bumps version
- ✅ Creates git tag
- ✅ Creates GitHub release
- ✅ Updates website
- ✅ Copies packages to docs/downloads/
- ✅ Commits and pushes

## All Available Commands

### Basic Commands

```bash
# Build packages only (auto-increment version)
scripts/build-prod.sh

# Clean previous builds first, then build
scripts/build-prod.sh --clean

# Build and create Arch package with makepkg
scripts/build-prod.sh --build-pkg
```

### Version Management

```bash
# Normal build (auto-increment: 1.0.4 → 1.0.5)
scripts/build-prod.sh

# Major version bump (1.0.4 → 2.0.0)
scripts/build-prod.sh --major

# Major bump + full release
scripts/build-prod.sh --major --release
```

### Git Operations

```bash
# Build + create git tag only (no release)
scripts/build-prod.sh --tag

# Full release with everything
scripts/build-prod.sh --release
```

### Combined Flags

```bash
# Clean build + major version + release
scripts/build-prod.sh --clean --major --release

# Clean build + create tag
scripts/build-prod.sh --clean --tag

# Build Arch package + release
scripts/build-prod.sh --build-pkg --release
```

## Typical Workflows

### Feature Release

```bash
# 1. Develop feature
git checkout -b feature/my-feature
# ... make changes ...
git commit -am "feat: add my feature"

# 2. Merge to main
git checkout main
git merge feature/my-feature

# 3. Release!
scripts/build-prod.sh --release
```

### Hotfix Release

```bash
# 1. Fix bug
git commit -am "fix: critical bug"

# 2. Quick release
scripts/build-prod.sh --release
```

### Major Version Release

```bash
# 1. Breaking changes committed
git commit -am "feat!: breaking change"

# 2. Major version release
scripts/build-prod.sh --major --release
```

## Testing the CI/CD

```bash
# Make a test change
echo "# Test" >> TEST.md
git add TEST.md
git commit -m "test: CI/CD automation"

# Run release (will create v1.0.5)
scripts/build-prod.sh --release

# Check results:
# - GitHub: New release at https://github.com/WOF-Softwares/Docura/releases
# - Website: Updated at https://wof-softwares.github.io/Docura/
# - Packages: In docs/downloads/

# Cleanup test
git rm TEST.md
git commit -m "chore: remove test file"
```

## Package Locations

After building, packages are in:

```
packaging/arch/
├── docura_1.0.4_amd64.deb          # Debian/Ubuntu
├── docura-1.0.4-1.x86_64.rpm        # Fedora/RHEL
├── docura-bin-1.0.4-1-x86_64.pkg.tar.xz  # Arch Linux
└── PKGBUILD                         # Arch build file
```

After `--release`, also copied to:

```
docs/downloads/
├── docura_1.0.4_amd64.deb
├── docura-1.0.4-1.x86_64.rpm
└── docura-bin-1.0.4-1-x86_64.pkg.tar.xz
```

## Troubleshooting

### GitHub CLI Not Authenticated

```bash
# Install gh CLI first
# Arch: sudo pacman -S github-cli
# Ubuntu: https://github.com/cli/cli#installation

# Then authenticate
gh auth login
```

### Version Conflicts

```bash
# Check current version
cat version.info

# Manually set version if needed
echo 'version = "1.0.4"' > version.info
```

### Website Not Updating

```bash
# Verify docs/index.html exists
ls -la docs/index.html

# Check if sed is working
sed --version
```

## Quick Reference

| Command | What It Does |
|---------|-------------|
| `scripts/build-prod.sh` | Build packages, auto-increment version |
| `scripts/build-prod.sh --tag` | Build + create git tag |
| `scripts/build-prod.sh --release` | **Full automation** (build, tag, release, update website) |
| `scripts/build-prod.sh --major` | Bump major version (breaking changes) |
| `scripts/build-prod.sh --clean` | Clean previous builds first |
| `scripts/build-prod.sh --build-pkg` | Also run makepkg for Arch |

## Current Version

```bash
# Check current version
cat version.info

# Check tauri.conf.json version
grep '"version"' src-tauri/tauri.conf.json
```

---

**Pro Tip:** For most releases, just use `scripts/build-prod.sh --release` - it does everything! 🚀

