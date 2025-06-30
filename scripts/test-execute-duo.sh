#!/bin/bash

echo "🧪 Testing Duo API authentication with execute-request"
echo "======================================================"

cd /Users/rmarther/src/duo/duo_api_mcp

# Test executing a Duo API request with authentication
cat << 'EOF' | node build/index.js --stdio
{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "execute-request", "arguments": {"collectionName": "Test Duo API Collection", "requestName": "Test Duo Admin API - Get Users", "environment": "Test Duo Environment"}}}
EOF

echo ""
echo "Test completed. Check output above for Duo authentication headers."
