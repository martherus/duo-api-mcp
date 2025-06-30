#!/bin/bash

# Test script for Duo API authentication
echo "🧪 Testing Postman Collection MCP Server with Duo API authentication"
echo "=================================================================="

# Build the project first
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Test server startup and auto-loading
echo "🚀 Testing server startup and auto-loading..."
timeout 10s node build/index.js --stdio <<EOF 2>&1 | tee server_test_output.log &
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}

{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get-server-status",
    "arguments": {}
  }
}

{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "list-collections",
    "arguments": {}
  }
}

{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "list-environments",
    "arguments": {}
  }
}
EOF

sleep 5
wait

echo ""
echo "📊 Test Results:"
echo "================"

if grep -q "Test Duo API Collection" server_test_output.log; then
    echo "✅ Auto-loading of collections: PASSED"
else
    echo "❌ Auto-loading of collections: FAILED"
fi

if grep -q "Test Duo Environment" server_test_output.log; then
    echo "✅ Auto-loading of environments: PASSED"
else
    echo "❌ Auto-loading of environments: FAILED"
fi

if grep -q "execute-request" server_test_output.log; then
    echo "✅ MCP tools registration: PASSED"
else
    echo "❌ MCP tools registration: FAILED"
fi

echo ""
echo "📄 Full server output saved to: server_test_output.log"
echo ""
echo "🔍 To manually test Duo authentication, run:"
echo "   node build/index.js --stdio"
echo ""
echo "   Then send JSON-RPC requests to test Duo API authentication."
echo ""
echo "⚠️  Note: Actual Duo API calls will fail with test credentials,"
echo "   but authentication headers should be generated correctly."
