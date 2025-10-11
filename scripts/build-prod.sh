#!/usr/bin/env bash
set -euo pipefail

# Build a Tauri AppImage and prepare an Arch PKGBUILD that packages the AppImage.
# Usage:
#   scripts/build-prod.sh            # Build AppImage and generate PKGBUILD
#   scripts/build-prod.sh --build-pkg  # Also run makepkg to produce .pkg.tar.xz
#   scripts/build-prod.sh --clean      # Remove previous build artifacts before building
#
# Notes:
# - Requires: npm, node, cargo, rustc. jq is optional (we fall back to sed if missing).
# - Produces artifacts under packaging/arch/ and target/bundle.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONF_JSON="$ROOT_DIR/src-tauri/tauri.conf.json"
PKG_DIR="$ROOT_DIR/packaging/arch"
BUNDLE_DIR="$ROOT_DIR/src-tauri/target/release/bundle/appimage"

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
APPIMAGE_NAME="${PRODUCT_NAME}-${APP_VERSION}.AppImage"

log "Product: $PRODUCT_NAME"
log "Version: $APP_VERSION"

# Optional clean
if $CLEAN_FIRST; then
  log "Cleaning previous artifacts"
  rm -rf "$ROOT_DIR/dist" "$ROOT_DIR/.vite" "$ROOT_DIR/src-tauri/target" "$PKG_DIR"/*.AppImage "$PKG_DIR"/*.pkg.tar.* || true
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

# Build AppImage with Tauri v2 CLI via npm script
log "Building Tauri AppImage"
npm run --prefix "$ROOT_DIR" tauri:build -- --bundles appimage

# Locate AppImage artifact
if [[ ! -d "$BUNDLE_DIR" ]]; then
  err "Bundle directory not found: $BUNDLE_DIR"; exit 1
fi

LATEST_APPIMAGE="$(ls -t "$BUNDLE_DIR"/*.AppImage 2>/dev/null | head -n1 || true)"
if [[ -z "$LATEST_APPIMAGE" ]]; then
  err "No AppImage found in $BUNDLE_DIR"; exit 1
fi

log "Found AppImage: $LATEST_APPIMAGE"
mkdir -p "$PKG_DIR"
cp -f "$LATEST_APPIMAGE" "$PKG_DIR/$APPIMAGE_NAME"

# Generate PKGBUILD that packages the AppImage as /opt/<name>/<name>.AppImage with a launcher in /usr/bin
PKG_NAME_APPIMAGE="${BASE_NAME_LOWER}-appimage"
cat > "$PKG_DIR/PKGBUILD" <<'EOF'
pkgname=__PKG_NAME__
pkgver=__PKG_VER__
pkgrel=1
pkgdesc="__PKG_DESC__"
arch=('x86_64')
url="__PKG_URL__"
license=('custom')
depends=()
optdepends=('fuse2: required to run some AppImages on older systems')
provides=('__BASE_NAME__')
conflicts=('__BASE_NAME__')
options=('!strip')
source=("__APPIMAGE_FILE__")
noextract=("${source[@]}")
sha256sums=('SKIP')

package() {
  install -d "${pkgdir}/opt/__BASE_NAME__"
  install -Dm755 "${srcdir}/__APPIMAGE_FILE__" "${pkgdir}/opt/__BASE_NAME__/__BASE_PROPER__.AppImage"

  # Launcher
  install -d "${pkgdir}/usr/bin"
  cat > "${pkgdir}/usr/bin/__BASE_NAME__" << 'LAUNCH'
#!/usr/bin/env bash
exec "/opt/__BASE_NAME__/__BASE_PROPER__.AppImage" "$@"
LAUNCH
  chmod 755 "${pkgdir}/usr/bin/__BASE_NAME__"
}
EOF

# Fill placeholders in PKGBUILD
PKG_DESC="$PRODUCT_NAME AppImage repackaged as an Arch package"
PKG_URL="https://github.com/WOF-Softwares/Docura"

sed -i \
  -e "s/__PKG_NAME__/$PKG_NAME_APPIMAGE/" \
  -e "s/__PKG_VER__/$APP_VERSION/" \
  -e "s|__PKG_DESC__|$PKG_DESC|" \
  -e "s|__PKG_URL__|$PKG_URL|" \
  -e "s/__BASE_NAME__/$BASE_NAME_LOWER/g" \
  -e "s/__BASE_PROPER__/$PRODUCT_NAME/g" \
  -e "s|__APPIMAGE_FILE__|$APPIMAGE_NAME|g" \
  "$PKG_DIR/PKGBUILD"

log "Generated $PKG_DIR/PKGBUILD"
log "AppImage copied to $PKG_DIR/$APPIMAGE_NAME"

cat <<INSTRUCT

Next steps:
- To build the Arch package (.pkg.tar.xz) run:
    (cd "$PKG_DIR" && PKGEXT='.pkg.tar.xz' makepkg -Ccf --noprepare --skipinteg)

Artifacts will appear in: $PKG_DIR

Tip: You can also run this script with --build-pkg to have it call makepkg for you.
INSTRUCT

if $DO_BUILD_PKG; then
  log "Building Arch package via makepkg (xz compression)"
  ( cd "$PKG_DIR" && PKGEXT='.pkg.tar.xz' makepkg -Ccf --noprepare --skipinteg )
  log "Package built. See $PKG_DIR/*.pkg.tar.xz"
fi