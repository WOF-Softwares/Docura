#!/bin/bash

# Docura Build Script
# This script builds the frontend and then runs Tauri in development mode

set -e  # Exit on any error

echo "🚀 Building Docura..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Build frontend
echo -e "${BLUE}📦 Step 1: Building frontend with Vite...${NC}"
npm run build

echo ""
echo -e "${GREEN}✅ Frontend build complete!${NC}"
echo ""

# Step 2: Run Tauri in dev mode
echo -e "${BLUE}🦀 Step 2: Starting Tauri development server...${NC}"
npm run tauri:dev

