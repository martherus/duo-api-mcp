#!/bin/bash

echo "🧪 Testing with actual Duo Admin API collection"
echo "=============================================="

cd /Users/rmarther/src/duo/duo_api_mcp

# Test with the actual Duo Admin API collection
cat << 'EOF' | node build/index.js --stdio
{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "list-requests", "arguments": {"collectionName": "Duo Admin API"}}}
{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "execute-request", "arguments": {"collectionName": "Duo Admin API", "requestName": "Retrieve Users", "environment": "Test Duo Environment"}}}
EOF

echo ""
echo "✅ Test completed. Check output above for:"
echo "   1. List of requests in Duo Admin API collection" 
echo "   2. Execution with Duo authentication headers"
