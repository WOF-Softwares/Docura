#!/usr/bin/env bash
set -euo pipefail

# Build Tauri packages (.deb, .rpm) and prepare an Arch PKGBUILD that repackages the .deb
# Usage:
#   scripts/build-prod.sh                # Build AppImage and generate PKGBUILD
#   scripts/build-prod.sh --build-pkg      # Also run makepkg to produce .pkg.tar.xz
#   scripts/build-prod.sh --clean          # Remove previous build artifacts before building
#   scripts/build-prod.sh --major          # Bump major version (resets minor/build to 0)
#   scripts/build-prod.sh --tag            # Create and push git tag v<version>
#   scripts/build-prod.sh --release        # Create GitHub release (uses gh) and upload artifacts
#   (combine flags as needed)
#
# Notes:
# - Requires: npm, node, cargo, rustc. jq is optional (we fall back to sed if missing).
# - Produces artifacts under packaging/arch/ and target/bundle.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONF_JSON="$ROOT_DIR/src-tauri/tauri.conf.json"
PKG_DIR="$ROOT_DIR/packaging/arch"
BUNDLE_DIR="$ROOT_DIR/src-tauri/target/release/bundle/appimage"
VERSION_FILE="$ROOT_DIR/version.info"
# Number of build increments before rolling over to the next minor version.
# Defaults to 10 (as in 1.0.10 -> 1.1.0) but can be overridden by setting VERSION_BUILD_ROLLOVER.
BUILD_ROLLOVER="${VERSION_BUILD_ROLLOVER:-10}"
RPM_BUNDLE_DIR="$ROOT_DIR/src-tauri/target/release/bundle/rpm"
DEB_BUNDLE_DIR="$ROOT_DIR/src-tauri/target/release/bundle/deb"

CLEAN_FIRST=false
DO_BUILD_PKG=false
BUMP_MAJOR=false
DO_TAG=false
DO_RELEASE=false

for arg in "$@"; do
  case "$arg" in
    --clean) CLEAN_FIRST=true ;;
    --build-pkg) DO_BUILD_PKG=true ;;
    --major) BUMP_MAJOR=true ;;
    --tag) DO_TAG=true ;;
    --release) DO_RELEASE=true ;;
    *) echo "Unknown arg: $arg" >&2; exit 1 ;;
  esac
done
log() { printf "\033[1;32m==>\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m==>\033[0m %s\n" "$*"; }
err() { printf "\033[1;31m==>\033[0m %s\n" "$*"; }

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    err "Missing required command: $1"; exit 1;
  fi
}

require node
require npm
require cargo
require rustc

if [[ ! -f "$CONF_JSON" ]]; then
  err "Could not find $CONF_JSON"; exit 1
fi

# Read productName from tauri.conf.json
if command -v jq >/dev/null 2>&1; then
  PRODUCT_NAME="$(jq -r '.productName' "$CONF_JSON")"
else
  warn "jq not found; using sed to parse tauri.conf.json"
  PRODUCT_NAME="$(sed -n 's/.*"productName"\s*:\s*"\([^"]*\)".*/\1/p' "$CONF_JSON" | head -n1)"
fi

if [[ -z "$PRODUCT_NAME" ]]; then
  err "Failed to parse productName from $CONF_JSON"; exit 1
fi

# Determine and bump the version from version.info (TOML: version = "x.y.z")
CUR_VER=""
if [[ -f "$VERSION_FILE" ]]; then
  CUR_VER="$(sed -nE 's/^[[:space:]]*version[[:space:]]*=[[:space:]]*"([0-9]+\.[0-9]+\.[0-9]+)".*/\1/p' "$VERSION_FILE" | head -n1)"
fi
if [[ -z "$CUR_VER" ]]; then
  CUR_VER="1.0.1"
fi

IFS='.' read -r MAJOR MINOR BUILD <<< "$CUR_VER"

if $BUMP_MAJOR; then
  MAJOR=$((MAJOR + 1))
  MINOR=0
  BUILD=0
else
  BUILD=$((BUILD + 1))
  if [[ "$BUILD" -ge "$BUILD_ROLLOVER" ]]; then
    MINOR=$((MINOR + 1))
    BUILD=0
  fi
fi

NEW_VERSION="${MAJOR}.${MINOR}.${BUILD}"

# Persist the new version back to version.info
printf 'version = "%s"\n' "$NEW_VERSION" > "$VERSION_FILE.tmp"
mv "$VERSION_FILE.tmp" "$VERSION_FILE"

# Update tauri.conf.json's version to match NEW_VERSION
if command -v jq >/dev/null 2>&1; then
  TMP_JSON="$(mktemp)"
  jq --arg v "$NEW_VERSION" '.version = $v' "$CONF_JSON" > "$TMP_JSON"
  mv "$TMP_JSON" "$CONF_JSON"
else
  sed -i -E 's/("version"\s*:\s*")([0-9]+\.[0-9]+\.[0-9]+)(")/\1'"$NEW_VERSION"'\3/' "$CONF_JSON"
fi

# Update README.md version
README_FILE="$ROOT_DIR/README.md"
if [[ -f "$README_FILE" ]]; then
  log "Updating README.md with version $NEW_VERSION"
  # Update version in README.md (multiple patterns to catch different formats)
  sed -i -E "s/Version [0-9]+\.[0-9]+\.[0-9]+/Version $NEW_VERSION/g" "$README_FILE"
  sed -i -E "s/v[0-9]+\.[0-9]+\.[0-9]+/v$NEW_VERSION/g" "$README_FILE"
  sed -i -E "s/(\*\*Version )([0-9]+\.[0-9]+\.[0-9]+)(\*\*)/\1$NEW_VERSION\3/g" "$README_FILE"
  # Update version badge
  sed -i -E "s/(Version-)[0-9]+\.[0-9]+\.[0-9]+/\1$NEW_VERSION/g" "$README_FILE"
else
  warn "README.md not found; skipping README update"
fi

APP_VERSION="$NEW_VERSION"

# Normalize names
BASE_NAME_LOWER="$(echo "$PRODUCT_NAME" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9_-')"
DEB_NAME="${BASE_NAME_LOWER}_${APP_VERSION}_amd64.deb"
RPM_NAME="${BASE_NAME_LOWER}-${APP_VERSION}-1.x86_64.rpm"

log "Product: $PRODUCT_NAME"
log "Version: $APP_VERSION"

# Optional clean
if $CLEAN_FIRST; then
  log "Cleaning previous artifacts"
  rm -rf "$ROOT_DIR/dist" "$ROOT_DIR/.vite" "$ROOT_DIR/src-tauri/target" "$PKG_DIR"/*.deb "$PKG_DIR"/*.rpm "$PKG_DIR"/*.pkg.tar.* || true
fi

# Install frontend deps and build
log "Installing frontend dependencies"
if [[ -f "$ROOT_DIR/package-lock.json" ]]; then
  npm ci --prefix "$ROOT_DIR"
else
  npm install --prefix "$ROOT_DIR"
fi

log "Building frontend"
npm run --prefix "$ROOT_DIR" build

# Build .deb and .rpm with Tauri v2 CLI via npm script
log "Building Tauri packages (.deb and .rpm)"

# Pass Dropbox environment variables to the build if they exist
export DROPBOX_CLIENT_ID="${DROPBOX_CLIENT_ID:-}"
export DROPBOX_CLIENT_SECRET="${DROPBOX_CLIENT_SECRET:-}"
export DROPBOX_REDIRECT_URI="${DROPBOX_REDIRECT_URI:-https://wof-softwares.github.io/Docura/oauth-redirect.html}"

if [[ -n "$DROPBOX_CLIENT_ID" ]]; then
  log "Building with Dropbox credentials from environment"
else
  warn "DROPBOX_CLIENT_ID not set - Dropbox sync will not work in production build"
  warn "Set environment variables before building: DROPBOX_CLIENT_ID, DROPBOX_CLIENT_SECRET"
fi

npm run --prefix "$ROOT_DIR" tauri:build -- --bundles deb,rpm

# Locate .deb artifact
if [[ ! -d "$DEB_BUNDLE_DIR" ]]; then
  err "DEB bundle directory not found: $DEB_BUNDLE_DIR"; exit 1
fi

LATEST_DEB="$(ls -t "$DEB_BUNDLE_DIR"/*.deb 2>/dev/null | head -n1 || true)"
if [[ -z "$LATEST_DEB" ]]; then
  err "No .deb found in $DEB_BUNDLE_DIR"; exit 1
fi

log "Found .deb: $LATEST_DEB"
mkdir -p "$PKG_DIR"
cp -f "$LATEST_DEB" "$PKG_DIR/$DEB_NAME"

# Locate .rpm artifact
if [[ ! -d "$RPM_BUNDLE_DIR" ]]; then
  warn "RPM bundle directory not found: $RPM_BUNDLE_DIR (RPM may not be available on this system)"
else
  LATEST_RPM="$(ls -t "$RPM_BUNDLE_DIR"/*.rpm 2>/dev/null | head -n1 || true)"
  if [[ -z "$LATEST_RPM" ]]; then
    warn "No .rpm found in $RPM_BUNDLE_DIR"
  else
    log "Found .rpm: $LATEST_RPM"
    cp -f "$LATEST_RPM" "$PKG_DIR/$RPM_NAME"
    log ".rpm copied to $PKG_DIR/$RPM_NAME"
  fi
fi

# Generate PKGBUILD that repackages the .deb for Arch Linux
PKG_NAME_BIN="${BASE_NAME_LOWER}-bin"
cat > "$PKG_DIR/PKGBUILD" <<'EOF'
# Maintainer: Docura Team <https://github.com/WOF-Softwares/Docura>
pkgname=__PKG_NAME__
pkgver=__PKG_VER__
pkgrel=1
pkgdesc="__PKG_DESC__"
arch=('x86_64')
url="__PKG_URL__"
license=('Apache-2.0')
depends=('gtk3' 'webkit2gtk-4.1')
makedepends=()
provides=('__BASE_NAME__')
conflicts=('__BASE_NAME__')
options=('!strip' '!emptydirs')
source=("__DEB_FILE__")
noextract=("${source[@]}")
sha256sums=('SKIP')

package() {
  msg2 "Extracting .deb package..."
  cd "${srcdir}"
  
  # Extract .deb (data.tar.* contains the actual files)
  ar x "__DEB_FILE__" || {
    error "Failed to extract .deb archive"
    return 1
  }
  
  # Extract data
  tar -xf data.tar.* -C "${pkgdir}/" || {
    error "Failed to extract data.tar"
    return 1
  }
  
  msg2 "Fixing permissions..."
  # Fix permissions
  find "${pkgdir}" -type d -exec chmod 755 {} \+ 2>/dev/null || true
  find "${pkgdir}/usr/bin" -type f -exec chmod 755 {} \+ 2>/dev/null || true
  find "${pkgdir}/usr/share/applications" -type f -exec chmod 644 {} \+ 2>/dev/null || true
  find "${pkgdir}/usr/share/icons" -type f -exec chmod 644 {} \+ 2>/dev/null || true
  
  # Verify binary exists
  if [[ -f "${pkgdir}/usr/bin/__BASE_NAME__" ]]; then
    msg2 "Binary installed: /usr/bin/__BASE_NAME__"
  else
    warning "Binary not found at /usr/bin/__BASE_NAME__"
    msg2 "Searching for binary..."
    find "${pkgdir}" -type f -name "__BASE_NAME__" 2>/dev/null || true
  fi
  
  # Clean up extracted .deb components
  cd "${srcdir}"
  rm -f control.tar.* data.tar.* debian-binary 2>/dev/null || true
}
EOF

# Fill placeholders in PKGBUILD
PKG_DESC="$PRODUCT_NAME - Modern markdown editor built with Tauri"
PKG_URL="https://github.com/WOF-Softwares/Docura"

sed -i \
  -e "s/__PKG_NAME__/$PKG_NAME_BIN/" \
  -e "s/__PKG_VER__/$APP_VERSION/" \
  -e "s|__PKG_DESC__|$PKG_DESC|" \
  -e "s|__PKG_URL__|$PKG_URL|" \
  -e "s/__BASE_NAME__/$BASE_NAME_LOWER/g" \
  -e "s|__DEB_FILE__|$DEB_NAME|g" \
  "$PKG_DIR/PKGBUILD"

log "Generated $PKG_DIR/PKGBUILD"
log ".deb copied to $PKG_DIR/$DEB_NAME"

cat <<INSTRUCT

✅ Build complete!

Package files:
- Debian/Ubuntu: $PKG_DIR/$DEB_NAME
- Fedora/RHEL:   $PKG_DIR/$RPM_NAME (if built)
- Arch PKGBUILD: $PKG_DIR/PKGBUILD

Next steps:
- To build the Arch package (.pkg.tar.xz) run:
    (cd "$PKG_DIR" && PKGEXT='.pkg.tar.xz' makepkg -Ccf --noprepare --skipinteg)

Installation:
- Debian/Ubuntu: sudo dpkg -i $DEB_NAME
- Fedora/RHEL:   sudo rpm -i $RPM_NAME
- Arch Linux:    cd packaging/arch && makepkg -si

Tip: You can also run this script with --build-pkg to have it call makepkg for you.
INSTRUCT

if $DO_BUILD_PKG; then
  log "Building Arch package via makepkg (xz compression)"
  ( cd "$PKG_DIR" && PKGEXT='.pkg.tar.xz' makepkg -Ccf --noprepare --skipinteg )
  log "Package built. See $PKG_DIR/*.pkg.tar.xz"
fi

# Tag and/or release
if $DO_TAG || $DO_RELEASE; then
  require git
  (
    set -euo pipefail
    cd "$ROOT_DIR"
    if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
      err "Not a git repository; cannot tag or release"
      exit 1
    fi

    TAG="v$NEW_VERSION"

    # Commit version bump if there are staged changes to commit
    git add version.info src-tauri/tauri.conf.json README.md "$PKG_DIR/PKGBUILD" 2>/dev/null || true
    if ! git diff --cached --quiet --exit-code; then
      log "Committing release files"
      git commit -m "chore(release): $TAG"
    else
      warn "No changes to commit"
    fi

    if $DO_TAG; then
      if git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
        warn "Tag $TAG already exists; skipping tag creation"
      else
        log "Creating git tag $TAG"
        git tag -a "$TAG" -m "$TAG"
      fi
      if git remote get-url origin >/dev/null 2>&1; then
        log "Pushing branch and tag to origin"
        git push origin HEAD
        git push origin "$TAG"
      else
        warn "No git remote 'origin' found; skipping push"
      fi
    fi

    if $DO_RELEASE; then
      if ! command -v gh >/dev/null 2>&1; then
        err "gh CLI not installed; cannot create GitHub release"
        exit 1
      fi
      # Collect release assets
      ASSETS=()
      # Add .deb package
      if [[ -f "$PKG_DIR/$DEB_NAME" ]]; then
        ASSETS+=("$PKG_DIR/$DEB_NAME")
      fi
      # Add .rpm package if it exists
      if [[ -f "$PKG_DIR/$RPM_NAME" ]]; then
        ASSETS+=("$PKG_DIR/$RPM_NAME")
      fi
      # Add Arch Linux packages (.pkg.tar.xz)
      shopt -s nullglob
      for f in "$PKG_DIR"/*.pkg.tar.*; do ASSETS+=("$f"); done
      shopt -u nullglob
      log "Creating GitHub release $TAG and uploading assets"
      if ! gh release create "$TAG" "${ASSETS[@]}" -t "$TAG" -n "Release $TAG"; then
        warn "Release may already exist; attempting to upload/overwrite assets"
        for a in "${ASSETS[@]}"; do gh release upload "$TAG" "$a" --clobber || true; done
      fi
      
      # Update docs/index.html with new version and copy packages to docs/downloads
      log "Updating docs/index.html with version $NEW_VERSION"
      DOCS_DIR="$ROOT_DIR/docs"
      DOWNLOADS_DIR="$DOCS_DIR/downloads"
      
      # Create downloads directory if it doesn't exist
      mkdir -p "$DOWNLOADS_DIR"
      
      # Copy packages to docs/downloads
      if [[ -f "$PKG_DIR/$DEB_NAME" ]]; then
        cp -f "$PKG_DIR/$DEB_NAME" "$DOWNLOADS_DIR/"
        log "Copied $DEB_NAME to $DOWNLOADS_DIR"
      fi
      if [[ -f "$PKG_DIR/$RPM_NAME" ]]; then
        cp -f "$PKG_DIR/$RPM_NAME" "$DOWNLOADS_DIR/"
        log "Copied $RPM_NAME to $DOWNLOADS_DIR"
      fi
      # Copy Arch package
      shopt -s nullglob
      for f in "$PKG_DIR"/*.pkg.tar.*; do
        ARCH_PKG_NAME="${BASE_NAME_LOWER}-bin-${APP_VERSION}-1-x86_64.pkg.tar.xz"
        cp -f "$f" "$DOWNLOADS_DIR/$ARCH_PKG_NAME"
        log "Copied $(basename "$f") to $DOWNLOADS_DIR/$ARCH_PKG_NAME"
      done
      shopt -u nullglob
      
      # Update version in docs/index.html
      DOCS_HTML="$DOCS_DIR/index.html"
      if [[ -f "$DOCS_HTML" ]]; then
        # Update version numbers in meta tags and structured data
        sed -i -E "s/(\"version\":\s*\")[^\"]+(\",)/\1$NEW_VERSION\2/" "$DOCS_HTML"
        sed -i -E "s/(\"softwareVersion\":\s*\")[^\"]+(\",)/\1$NEW_VERSION\2/" "$DOCS_HTML"
        sed -i -E "s/Docura v[0-9]+\.[0-9]+\.[0-9]*/Docura v$NEW_VERSION/g" "$DOCS_HTML"
        
        # Update download links for packages (preserves target="_blank" and download attributes)
        sed -i -E "s|(href=\"downloads/${BASE_NAME_LOWER}-bin-)[0-9]+\.[0-9]+\.[0-9]+(-1-x86_64\.pkg\.tar\.[a-z]+\")|\1${APP_VERSION}\2|g" "$DOCS_HTML"
        sed -i -E "s|(href=\"downloads/${BASE_NAME_LOWER}_)[0-9]+\.[0-9]+\.[0-9]+(_amd64\.deb\")|\1${APP_VERSION}\2|g" "$DOCS_HTML"
        sed -i -E "s|(href=\"downloads/${BASE_NAME_LOWER}-)[0-9]+\.[0-9]+\.[0-9]+(-1\.x86_64\.rpm\")|\1${APP_VERSION}\2|g" "$DOCS_HTML"
        
        # Update installation commands
        sed -i -E "s|(sudo pacman -U ${BASE_NAME_LOWER}-bin-)[0-9]+\.[0-9]+\.[0-9]+(-1-x86_64\.pkg\.tar\.[a-z]+)|\1${APP_VERSION}\2|g" "$DOCS_HTML"
        sed -i -E "s|(sudo dpkg -i ${BASE_NAME_LOWER}_)[0-9]+\.[0-9]+\.[0-9]+(_amd64\.deb)|\1${APP_VERSION}\2|g" "$DOCS_HTML"
        sed -i -E "s|(sudo rpm -i ${BASE_NAME_LOWER}-)[0-9]+\.[0-9]+\.[0-9]+(-1\.x86_64\.rpm)|\1${APP_VERSION}\2|g" "$DOCS_HTML"
        
        log "Updated $DOCS_HTML with version $NEW_VERSION"
        
        # Stage the updated docs files for commit
        git add "$DOCS_HTML" "$DOWNLOADS_DIR"/*.deb "$DOWNLOADS_DIR"/*.rpm "$DOWNLOADS_DIR"/*.pkg.tar.* 2>/dev/null || true
        if ! git diff --cached --quiet --exit-code; then
          log "Committing docs updates"
          git commit -m "docs: update download links to v$NEW_VERSION"
          if git remote get-url origin >/dev/null 2>&1; then
            log "Pushing docs updates to origin"
            git push origin HEAD
          fi
        fi
      else
        warn "docs/index.html not found; skipping docs update"
      fi
    fi
  )
fi
