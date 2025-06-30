#!/bin/bash

echo "🧪 Testing list-requests function specifically"
echo "============================================="

cd /Users/rmarther/src/duo/duo_api_mcp

# Test with the actual Duo Admin API collection
cat << 'EOF' | node build/index.js --stdio
{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "list-requests", "arguments": {"collectionName": "Duo Admin API"}}}
EOF
