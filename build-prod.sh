#!/bin/bash

# Docura Production Build Script
# This script builds the complete production-ready Tauri application

set -e  # Exit on any error

echo "🚀 Building Docura for Production..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Build frontend
echo -e "${BLUE}📦 Step 1: Building frontend with Vite...${NC}"
npm run build

echo ""
echo -e "${GREEN}✅ Frontend build complete!${NC}"
echo ""

# Step 2: Build Tauri app
echo -e "${BLUE}🦀 Step 2: Building Tauri application...${NC}"
echo -e "${YELLOW}⏳ This may take a few minutes...${NC}"
npm run tauri:build

echo ""
echo -e "${GREEN}✅ Production build complete!${NC}"
echo ""
echo "📦 Your application binaries are in: src-tauri/target/release/"
echo "🎉 Docura is ready for distribution!"

