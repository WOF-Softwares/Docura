#!/usr/bin/env bash
set -euo pipefail

# Build Tauri packages (.deb, .rpm) and prepare an Arch PKGBUILD that repackages the .deb
# Usage:
#   scripts/build-prod.sh            # Build .deb, .rpm and generate PKGBUILD
#   scripts/build-prod.sh --build-pkg  # Also run makepkg to produce .pkg.tar.xz
#   scripts/build-prod.sh --clean      # Remove previous build artifacts before building
#
# Notes:
# - Requires: npm, node, cargo, rustc. jq is optional (we fall back to sed if missing).
# - Produces artifacts under packaging/arch/ and target/bundle.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONF_JSON="$ROOT_DIR/src-tauri/tauri.conf.json"
PKG_DIR="$ROOT_DIR/packaging/arch"
DEB_BUNDLE_DIR="$ROOT_DIR/src-tauri/target/release/bundle/deb"
RPM_BUNDLE_DIR="$ROOT_DIR/src-tauri/target/release/bundle/rpm"

CLEAN_FIRST=false
DO_BUILD_PKG=false

for arg in "$@"; do
  case "$arg" in
    --clean) CLEAN_FIRST=true ;;
    --build-pkg) DO_BUILD_PKG=true ;;
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

# Read productName and version from tauri.conf.json
if command -v jq >/dev/null 2>&1; then
  PRODUCT_NAME="$(jq -r '.productName' "$CONF_JSON")"
  APP_VERSION="$(jq -r '.version' "$CONF_JSON")"
else
  warn "jq not found; using sed to parse tauri.conf.json"
  PRODUCT_NAME="$(sed -n 's/.*"productName"\s*:\s*"\([^"]*\)".*/\1/p' "$CONF_JSON" | head -n1)"
  APP_VERSION="$(sed -n 's/.*"version"\s*:\s*"\([^"]*\)".*/\1/p' "$CONF_JSON" | head -n1)"
fi

if [[ -z "$PRODUCT_NAME" || -z "$APP_VERSION" ]]; then
  err "Failed to parse productName or version from $CONF_JSON"; exit 1
fi

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
pkgname=__PKG_NAME__
pkgver=__PKG_VER__
pkgrel=1
pkgdesc="__PKG_DESC__"
arch=('x86_64')
url="__PKG_URL__"
license=('Apache')
depends=('gtk3' 'webkit2gtk')
provides=('__BASE_NAME__')
conflicts=('__BASE_NAME__')
options=('!strip')
source=("__DEB_FILE__")
noextract=("${source[@]}")
sha256sums=('SKIP')

package() {
  # Extract .deb (data.tar.* contains the actual files)
  cd "${srcdir}"
  ar x "__DEB_FILE__"
  tar -xf data.tar.* -C "${pkgdir}/"
  
  # Fix permissions
  find "${pkgdir}" -type d -exec chmod 755 {} \;
  find "${pkgdir}/usr/bin" -type f -exec chmod 755 {} \; 2>/dev/null || true
  
  # Verify binary exists
  if [[ ! -f "${pkgdir}/usr/bin/__BASE_NAME__" ]]; then
    echo "Warning: Binary not found at expected location"
    find "${pkgdir}" -type f -name "__BASE_NAME__" || true
  fi
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