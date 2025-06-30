#!/bin/bash

# Test script to verify the MCP server setup
# This script performs basic validation of the installation

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Postman Collection MCP Server - Setup Verification${NC}"
echo "=================================================="
echo ""

# Check if Node.js is installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "✓ Node.js: ${GREEN}$NODE_VERSION${NC}"
else
    echo -e "✗ Node.js: ${RED}Not found${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "✓ npm: ${GREEN}$NPM_VERSION${NC}"
else
    echo -e "✗ npm: ${RED}Not found${NC}"
    exit 1
fi

# Check if dependencies are installed
if [ -d "node_modules" ]; then
    echo -e "✓ Dependencies: ${GREEN}Installed${NC}"
else
    echo -e "✗ Dependencies: ${RED}Not installed${NC}"
    echo "Run 'npm install' to install dependencies"
    exit 1
fi

# Check if TypeScript compiled successfully
if [ -f "build/index.js" ]; then
    echo -e "✓ Build: ${GREEN}Compiled${NC}"
else
    echo -e "✗ Build: ${RED}Not found${NC}"
    echo "Run 'npm run build' to compile the project"
    exit 1
fi

# Check if the compiled file is executable
if [ -x "build/index.js" ]; then
    echo -e "✓ Executable: ${GREEN}Yes${NC}"
else
    echo -e "✗ Executable: ${RED}No${NC}"
    echo "Run 'chmod +x build/index.js' to make it executable"
fi

# Test if the server starts (quick test)
echo ""
echo "Testing server startup..."
timeout 3s node build/index.js > /dev/null 2>&1 &
PID=$!
sleep 1

if kill -0 $PID 2>/dev/null; then
    echo -e "✓ Server startup: ${GREEN}Success${NC}"
    kill $PID 2>/dev/null || true
    wait $PID 2>/dev/null || true
else
    echo -e "✗ Server startup: ${RED}Failed${NC}"
fi

# Check Claude Desktop config
CLAUDE_CONFIG_DIR=""
if [[ "$OSTYPE" == "darwin"* ]]; then
    CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    CLAUDE_CONFIG_DIR="$APPDATA/Claude"
else
    CLAUDE_CONFIG_DIR="$HOME/.config/claude"
fi

CLAUDE_CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"

if [ -f "$CLAUDE_CONFIG_FILE" ]; then
    if grep -q "postman-collection" "$CLAUDE_CONFIG_FILE"; then
        echo -e "✓ Claude Config: ${GREEN}Configured${NC}"
    else
        echo -e "⚠ Claude Config: ${YELLOW}File exists but MCP server not configured${NC}"
        echo "Run 'npm run setup-claude' to configure Claude Desktop"
    fi
else
    echo -e "⚠ Claude Config: ${YELLOW}Not found${NC}"
    echo "Run 'npm run setup-claude' to configure Claude Desktop"
fi

# Check example files
if [ -f "examples/sample-collection.json" ] && [ -f "examples/sample-environment.json" ]; then
    echo -e "✓ Examples: ${GREEN}Available${NC}"
else
    echo -e "⚠ Examples: ${YELLOW}Missing some files${NC}"
fi

echo ""
echo -e "${GREEN}Setup verification complete!${NC}"
echo ""
echo "To complete the setup:"
echo "1. Run 'npm run setup-claude' if not already done"
echo "2. Restart Claude Desktop"
echo "3. Test with: 'Load the collection from ./examples/sample-collection.json'"
