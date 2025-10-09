# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Build & Run

```bash
# Regular development build and run
cargo run

# Release build
cargo build --release

# Run tests
cargo test

# Run specific test
cargo test test_name

# Check formatting
cargo fmt --check

# Apply formatting
cargo fmt

# Run clippy for linting
cargo clippy

# Run clippy with all checks
cargo clippy -- -W clippy::all -W clippy::pedantic

# Build documentation
cargo doc --no-deps --open
```

## Architecture Overview

Docura is a desktop document viewer/editor built with Rust, using a layered architecture:

1. **GUI Layer** (Iced)
   - Handles all UI rendering and user interactions
   - Uses Iced's widget system for composable UI components
   - Implements custom theme management

2. **Document Processing**
   - Markdown: Uses pulldown-cmark/comrak for parsing and rendering
   - PDF: Integrates with poppler-rs/pdfium-render for PDF handling
   - Implements common interface for different document types

3. **File System Layer**
   - Async I/O operations using tokio/async-std
   - Project-based file management
   - Document caching and indexing

4. **State Management**
   - Central application state
   - Document state tracking
   - UI state synchronization

5. **Theme System**
   - Custom Iced styles
   - Theme configuration and switching
   - User-defined theme support

### Key Architecture Decisions

- Document operations are async by default
- UI updates follow Iced's subscription model
- All file operations use absolute paths
- Theme changes persist across sessions
- PDF rendering is done natively without web dependencies

### File Structure (Planned)

```
src/
├── main.rs           # Application entry point
├── app/              # Core application logic
├── document/         # Document handling
│   ├── markdown/     # Markdown implementation
│   └── pdf/         # PDF implementation
├── ui/              # UI components and widgets 
├── theme/           # Theme management
└── fs/              # File system operations
```

## Environment Setup

### Required Dependencies

For PDF support:
```bash
# Arch Linux
pacman -S poppler poppler-glib

# Ubuntu/Debian
apt install libpoppler-dev libpoppler-glib-dev

# Fedora/RHEL
dnf install poppler-devel poppler-glib-devel
```

## Project-Specific Guidelines

- LDAP Authentication Configuration
  - Using LDAP for user authentication with these settings:
    - LDAP_SYNC_PASSWORDS=false
    - LDAP_LOGIN_FALLBACK=false
    - LDAP_LOGIN_ATTRIBUTE=samaccountname
    - LDAP_LOCATE_USERS_BY=samaccountname
    - LDAP_BIND_USER_BY=distinguishedname
    - LDAP_USER_FILTER="(&(objectclass=user)(samaccountname=*))"
  - Logging and caching configuration:
    - LDAP_LOGGING=true
    - LDAP_LOG_CHANNEL=stack
    - LDAP_CACHE=false
    - LDAP_CACHE_TTL=300
  - SSL settings:
    - LDAP_TLS_REQUIRE_CERT=LDAP_OPT_X_TLS_NEVER (for testing)