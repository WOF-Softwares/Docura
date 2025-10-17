#!/bin/bash

# Script to install dependencies for building Docura on Debian/Ubuntu systems
# This script installs the required system libraries for Tauri development

set -e

echo "Updating package list..."
apt-get update

echo "Installing required dependencies..."
apt-get install -y \
    libwebkit2gtk-4.1-dev \
    libsoup-3.0-dev \
    libgtk-3-dev \
    libglib2.0-dev \
    libgdk-pixbuf2.0-dev \
    libcairo-gobject2 \
    libpango1.0-dev \
    libatk1.0-dev \
    libcairo2-dev \
    libgdk-pixbuf2.0-dev \
    libgtk-3-dev \
    libglib2.0-dev \
    build-essential \
    curl \
    wget \
    pkg-config

echo "Dependencies installed successfully!"
echo "You can now run 'npm run tauri build' or 'npm run tauri dev' to build the application."