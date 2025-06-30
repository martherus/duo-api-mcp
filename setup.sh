#!/bin/bash

# Duo API MCP Server Setup Script
# This script helps with initial setup and configuration

set -e

echo "🚀 Duo API MCP Server Setup"
echo "================================"

# Check Node.js version
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and npm."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js 16+."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Build the project
echo ""
echo "🔨 Building TypeScript project..."
npm run build

# Check if environment file exists
echo ""
echo "🔧 Checking environment configuration..."
if [ ! -f "environments/duo_api_env.json" ]; then
    echo "⚠️  Environment file not found. Creating from template..."
    mkdir -p environments
    
    # Use template if available, otherwise create basic template
    if [ -f "environments/duo_api_env.template.json" ]; then
        cp "environments/duo_api_env.template.json" "environments/duo_api_env.json"
        echo "📝 Environment file created from template: environments/duo_api_env.json"
    else
        cat > environments/duo_api_env.json << 'EOF'
{
  "name": "Duo API Environment",
  "values": [
    {
      "key": "ikey",
      "value": "YOUR_INTEGRATION_KEY",
      "type": "default",
      "enabled": true
    },
    {
      "key": "skey",
      "value": "YOUR_SECRET_KEY",
      "type": "secret",
      "enabled": true
    },
    {
      "key": "apihost",
      "value": "api-xxxxxxxx.duosecurity.com",
      "type": "default",
      "enabled": true
    }
  ]
}
EOF
        echo "📝 Basic environment file created: environments/duo_api_env.json"
    fi
    echo "⚠️  Please edit this file with your actual Duo API credentials!"
else
    echo "✅ Environment file found"
    
    # Validate environment file
    if node -e "JSON.parse(require('fs').readFileSync('environments/duo_api_env.json'))" 2>/dev/null; then
        echo "✅ Environment file is valid JSON"
        
        # Check for demo credentials
        if grep -q "YOUR_INTEGRATION_KEY\|deadbeef\|DIWHV33JEFGR9STQZ8IU" environments/duo_api_env.json; then
            echo "⚠️  WARNING: Demo/template credentials detected in environment file"
            echo "   Please update environments/duo_api_env.json with real Duo API credentials"
        else
            echo "✅ Environment file appears to have real credentials"
        fi
    else
        echo "❌ Environment file has invalid JSON syntax"
        echo "   Please check environments/duo_api_env.json for syntax errors"
    fi
fi

# Check collections directory
echo ""
echo "📚 Checking API collections..."
if [ ! -d "collections" ] || [ -z "$(ls -A collections/*.json 2>/dev/null)" ]; then
    echo "⚠️  No API collection files found in collections/ directory"
    echo "   Add your Postman collection .json files to the collections/ directory"
else
    COLLECTION_COUNT=$(ls collections/*.json 2>/dev/null | wc -l)
    echo "✅ Found $COLLECTION_COUNT collection file(s)"
fi

# Test the server briefly
echo ""
echo "🧪 Testing server startup..."
if timeout 3s node build/index.js 2>&1 | grep -q "Starting Duo API MCP Server"; then
    echo "✅ Server starts successfully"
else
    echo "⚠️  Server test inconclusive (timeout after 3s)"
fi

# Provide next steps
echo ""
echo "🎉 Setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update environments/duo_api_env.json with your real Duo API credentials"
echo "2. Add your Postman collection .json files to the collections/ directory"
echo "3. Configure Claude Desktop or your MCP client:"
echo ""
echo "   Add to claude_desktop_config.json:"
echo '   {'
echo '     "mcpServers": {'
echo '       "duo-api": {'
echo '         "command": "node",'
echo "         \"args\": [\"$(pwd)/build/index.js\"]"
echo '       }'
echo '     }'
echo '   }'
echo ""
echo "📖 For detailed instructions, see README.md"
echo ""
echo "🚀 To start the server: npm start"
echo "🔧 To run in dev mode: npm run dev"
