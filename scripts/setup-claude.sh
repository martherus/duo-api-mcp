#!/bin/bash

# Script to configure Duo APIs MCP Server for Claude Desktop
# This script adds the MCP server configuration to Claude Desktop's config file

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the absolute path to the MCP server
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
MCP_SERVER_PATH="$PROJECT_DIR/build/index.js"

# Claude Desktop config paths for different OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    CLAUDE_CONFIG_DIR="$APPDATA/Claude"
else
    # Linux (not officially supported by Claude Desktop yet)
    echo -e "${YELLOW}Warning: Claude Desktop is not yet available on Linux${NC}"
    CLAUDE_CONFIG_DIR="$HOME/.config/claude"
fi

CLAUDE_CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"

echo -e "${GREEN}Duo APIs MCP Server Configuration Script${NC}"
echo "=================================================="
echo ""

# Check if build exists
if [ ! -f "$MCP_SERVER_PATH" ]; then
    echo -e "${RED}Error: MCP server not built. Please run 'npm run build' first.${NC}"
    exit 1
fi

echo -e "MCP Server Path: ${YELLOW}$MCP_SERVER_PATH${NC}"
echo -e "Claude Config File: ${YELLOW}$CLAUDE_CONFIG_FILE${NC}"
echo ""

# Create Claude config directory if it doesn't exist
mkdir -p "$CLAUDE_CONFIG_DIR"

# Check if config file exists
if [ ! -f "$CLAUDE_CONFIG_FILE" ]; then
    echo "Creating new Claude Desktop configuration file..."
    cat > "$CLAUDE_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "duo-apis": {
      "command": "node",
      "args": ["$MCP_SERVER_PATH"]
    }
  }
}
EOF
    echo -e "${GREEN}✓ Created new configuration file${NC}"
else
    # Backup existing config
    BACKUP_FILE="${CLAUDE_CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$CLAUDE_CONFIG_FILE" "$BACKUP_FILE"
    echo -e "${YELLOW}✓ Backed up existing config to: $(basename "$BACKUP_FILE")${NC}"
    
    # Check if the configuration already exists
    if grep -q '"duo-apis"' "$CLAUDE_CONFIG_FILE"; then
        echo -e "${YELLOW}⚠ MCP server 'duo-apis' already exists in configuration${NC}"
        echo "Would you like to update it? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            # Use jq if available, otherwise manual replacement
            if command -v jq &> /dev/null; then
                # Update using jq
                jq --arg path "$MCP_SERVER_PATH" \
                   '.mcpServers["duo-apis"] = {"command": "node", "args": [$path]}' \
                   "$CLAUDE_CONFIG_FILE" > "${CLAUDE_CONFIG_FILE}.tmp" && \
                mv "${CLAUDE_CONFIG_FILE}.tmp" "$CLAUDE_CONFIG_FILE"
                echo -e "${GREEN}✓ Updated existing configuration using jq${NC}"
            else
                echo -e "${YELLOW}⚠ jq not found. Please manually update the configuration${NC}"
                echo "Replace the postman-collection entry with:"
                echo "{\"command\": \"node\", \"args\": [\"$MCP_SERVER_PATH\"]}"
            fi
        else
            echo "Configuration unchanged."
        fi
    else
        # Add new entry to existing config
        if command -v jq &> /dev/null; then
            # Add using jq
            jq --arg path "$MCP_SERVER_PATH" \
               '.mcpServers["duo-apis"] = {"command": "node", "args": [$path]}' \
               "$CLAUDE_CONFIG_FILE" > "${CLAUDE_CONFIG_FILE}.tmp" && \
            mv "${CLAUDE_CONFIG_FILE}.tmp" "$CLAUDE_CONFIG_FILE"
            echo -e "${GREEN}✓ Added MCP server to existing configuration${NC}"
        else
            echo -e "${YELLOW}⚠ jq not found. Please manually add the following to your mcpServers section:${NC}"
            echo ""
            echo "\"duo-apis\": {"
            echo "  \"command\": \"node\","
            echo "  \"args\": [\"$MCP_SERVER_PATH\"]"
            echo "}"
        fi
    fi
fi

echo ""
echo -e "${GREEN}Configuration completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Restart Claude Desktop completely"
echo "2. Look for the MCP tools icon in Claude Desktop"
echo "3. Try loading a Duo API collection with: 'Load the collection from ./examples/sample-collection.json'"
echo ""
echo "To verify the configuration, check:"
echo "  $CLAUDE_CONFIG_FILE"
echo ""
echo -e "${YELLOW}Note: Make sure Claude Desktop is updated to the latest version for MCP support${NC}"
