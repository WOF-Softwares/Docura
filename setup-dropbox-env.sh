#!/bin/bash

# Dropbox Environment Setup Script for Docura
# This script helps you set up the required environment variables

echo "🔐 Dropbox Credentials Setup for Docura"
echo "========================================"
echo ""

# Your app credentials
CLIENT_ID="oni7s2m0zhzjqb1"
REDIRECT_URI="https://wof-softwares.github.io/Docura/oauth-redirect.html"

echo "✅ App Key (Client ID): $CLIENT_ID"
echo "✅ Redirect URI: $REDIRECT_URI"
echo ""

# Prompt for app secret
echo "🔑 Please enter your Dropbox App Secret:"
echo "(Find it at: https://www.dropbox.com/developers/apps → Click 'Show')"
read -sp "App Secret: " CLIENT_SECRET
echo ""
echo ""

# Determine shell config file
if [ -f "$HOME/.zshrc" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
    SHELL_NAME="zsh"
elif [ -f "$HOME/.bashrc" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
    SHELL_NAME="bash"
else
    SHELL_CONFIG="$HOME/.profile"
    SHELL_NAME="sh"
fi

echo "📝 Detected shell: $SHELL_NAME"
echo "📝 Config file: $SHELL_CONFIG"
echo ""

# Add to shell config
echo "# Dropbox OAuth Credentials for Docura (Added on $(date))" >> "$SHELL_CONFIG"
echo "export DROPBOX_CLIENT_ID=\"$CLIENT_ID\"" >> "$SHELL_CONFIG"
echo "export DROPBOX_CLIENT_SECRET=\"$CLIENT_SECRET\"" >> "$SHELL_CONFIG"
echo "export DROPBOX_REDIRECT_URI=\"$REDIRECT_URI\"" >> "$SHELL_CONFIG"
echo "" >> "$SHELL_CONFIG"

# Also export for current session
export DROPBOX_CLIENT_ID="$CLIENT_ID"
export DROPBOX_CLIENT_SECRET="$CLIENT_SECRET"
export DROPBOX_REDIRECT_URI="$REDIRECT_URI"

echo "✅ Environment variables added to: $SHELL_CONFIG"
echo "✅ Variables set for current session"
echo ""

# Verify
echo "🔍 Verifying setup..."
if [ -n "$DROPBOX_CLIENT_ID" ] && [ -n "$DROPBOX_CLIENT_SECRET" ] && [ -n "$DROPBOX_REDIRECT_URI" ]; then
    echo "✅ All variables are set correctly!"
    echo ""
    echo "📋 Current values:"
    echo "   DROPBOX_CLIENT_ID: $DROPBOX_CLIENT_ID"
    echo "   DROPBOX_CLIENT_SECRET: ****${CLIENT_SECRET: -4}"  # Show only last 4 chars
    echo "   DROPBOX_REDIRECT_URI: $DROPBOX_REDIRECT_URI"
    echo ""
else
    echo "❌ Error: Some variables are missing"
    exit 1
fi

echo "🎯 Next Steps:"
echo "1. Restart your terminal (or run: source $SHELL_CONFIG)"
echo "2. Build Docura: npm run tauri dev"
echo "3. Test OAuth: Settings → Cloud Sync → Connect Dropbox"
echo ""
echo "📚 Documentation: ./DROPBOX_CREDENTIALS_SETUP.md"
echo ""
echo "✨ Setup complete!"

