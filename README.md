# Duo API MCP Server

An MCP (Model Context Protocol) server for seamless Duo API integration with automatic authentication. **Built-in Duo API authentication with HMAC-SHA512 signing.**

## � Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Duo API credentials** (Integration Key, Secret Key, API Hostname)
- **Claude Desktop** or other MCP-compatible client

### 1. Setup Development Environment

```bash
# Clone or download this repository
cd duo-api-mcp

# Install dependencies
npm install

# Build the TypeScript project
npm run build
```

### 2. Configure Duo API Credentials

Create or edit `environments/duo_api_env.json`:

```json
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
```

**Where to get these credentials:**
1. Log into your **Duo Admin Panel**
2. Go to **Applications** → **Protect an Application**
3. Search for **Admin API** (or Auth API/Accounts API as needed)
4. Note the **Integration Key**, **Secret Key**, and **API Hostname**

### 3. Test the Server

```bash
# Test build and basic functionality
npm run dev

# You should see output like:
# 🚀 Starting Duo API MCP Server...
# 📚 Total API collections loaded: 5
# 🌐 Total environments loaded: 1
# ✅ Duo API MCP Server running on stdio
```

## 🔧 Installation & Configuration

### Local Development Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode (rebuilds and runs)
npm run dev

# Run production build
npm start
```

### Running as a Service

#### Option 1: Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the service
pm2 start build/index.js --name "duo-api-mcp"

# Save PM2 configuration
pm2 save

# Setup auto-start on boot
pm2 startup

# Monitor the service
pm2 status
pm2 logs duo-api-mcp
```

#### Option 2: Using systemd (Linux)

Create `/etc/systemd/system/duo-api-mcp.service`:

```ini
[Unit]
Description=Duo API MCP Server
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/duo-api-mcp
ExecStart=/usr/bin/node build/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start the service
sudo systemctl enable duo-api-mcp
sudo systemctl start duo-api-mcp
sudo systemctl status duo-api-mcp
```

## 🖥️ Client Configuration

### Claude Desktop Configuration

Add to your Claude Desktop `claude_desktop_config.json`:

#### Local Development
```json
{
  "mcpServers": {
    "duo-api": {
      "command": "node",
      "args": ["/absolute/path/to/duo-api-mcp/build/index.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

#### Production Service
```json
{
  "mcpServers": {
    "duo-api": {
      "command": "node",
      "args": ["/absolute/path/to/duo-api-mcp/build/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**Claude Desktop config file locations:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Other MCP Clients

For other MCP-compatible clients, use the stdio transport:

```bash
# Direct execution
node /path/to/duo-api-mcp/build/index.js

# With environment variables
NODE_ENV=production node /path/to/duo-api-mcp/build/index.js
```

## �🔐 Duo API Authentication

This server provides **automatic Duo API authentication** that handles all the complex signing requirements for Duo's API security.

- ✅ **Auto-detection** of Duo API requests
- ✅ **HMAC-SHA512** signature generation  
- ✅ **Variable substitution** for credentials
- ✅ **Compatible** with all Duo APIs (Admin, Auth, Accounts)

**📖 See [DUO_AUTHENTICATION.md](./DUO_AUTHENTICATION.md) for detailed setup and usage.**

## 🔒 SSL Certificate Handling

By default, the server **disables SSL certificate validation** to avoid issues with self-signed certificates or development environments. This configuration can be changed:

### Default Behavior
- ⚠️  **SSL validation disabled** (development mode)
- Works with self-signed certificates
- Bypasses certificate authority validation
- Suitable for development and testing

### Enabling Strict SSL (Production)
Use the `configure-ssl` tool to enable strict certificate validation:
```
Tool: configure-ssl
- strictSSL: true
```

### Current SSL Status
Check current SSL configuration with:
```
Tool: get-server-status
```

## 🔄 Auto-Loading API Collections & Environments

The server automatically discovers and loads API collections and environments at startup:

### Directory Structure
```
duo-api-mcp/
├── collections/          # Place your API collection .json files here
├── environments/         # Place your environment .json files here  
└── examples/            # Sample files (also scanned)
```

**Important**: The server looks for collections relative to its own installation directory, not relative to Claude Desktop's working directory. This ensures collections are found regardless of where Claude Desktop is running from.

### What Gets Auto-Loaded
- **API Collections**: All `.json` files in `./collections/` and `./examples/` directories (relative to server)
- **Environments**: Files containing "environment" or "env" in the filename
- **Validation**: Only valid collection/environment formats are loaded

## Features

## Features

- **Auto-Discovery**: Automatically loads all API collections and environments at startup
- **Duo API Authentication**: Built-in HMAC-SHA512 signing for all Duo API calls
- **Multiple APIs**: Support for Admin API, Auth API, and Accounts API
- **Environment Management**: Auto-load configuration from JSON files
- **Variable Resolution**: Automatic substitution of {{variable}} syntax
- **Error Handling**: Enhanced error reporting with Duo-specific diagnostics
- **SSL Flexibility**: Configurable certificate validation for dev/prod environments

## Available Tools

### Core API Tools

#### `list-available-apis`
Shows all available API collections and their endpoints.

#### `list-api-endpoints`
List all endpoints in a specific API collection.
- `collectionName`: Name of the API collection to list endpoints from

#### `call-api`
Execute an API call to a specific endpoint.
- `collectionName`: Name of the API collection
- `endpointName`: Name of the API endpoint to call
- `environment`: Optional environment name for configuration
- `variables`: Optional variables to override for this API call

### Management Tools

#### `get-server-status`
Shows current server status including all auto-loaded collections and environments.

#### `refresh-api-collections`
Refresh and reload all API collections and environments without restarting the server.

#### `configure-ssl`
Configure SSL certificate validation settings.
- `strictSSL`: Enable (true) or disable (false) SSL certificate validation

### Environment Management

#### `load-environment` (Manual)
Load environment configuration from a JSON file (alternative to auto-loading).
- `filePath`: Path to the environment JSON file
- `environmentName`: Name to reference this environment

#### `list-environments`
List all loaded environment configurations.

## Basic Usage

### Example Workflow
1. **Check available APIs**:
   ```
   Tool: list-available-apis
   ```

2. **List endpoints in a collection**:
   ```
   Tool: list-api-endpoints
   - collectionName: "Duo Admin API"
   ```

3. **Execute an API call**:
   ```
   Tool: call-api
   - collectionName: "Duo Admin API"
   - endpointName: "Get Users"
   - environment: "Duo API Environment"
   ```
2. **Add environments** (optional): Place environment files in `./environments/` directory  
3. **Start the server**: Collections are automatically loaded at startup
4. **Check status**: Use `get-server-status` tool to see what was loaded
5. **Browse APIs**: Use `list-available-apis` to see available collections
6. **Execute calls**: Use `call-api` tool with the desired endpoint

### Example Workflow
1. **Check available APIs**:
   ```
   Tool: list-available-apis
   ```

2. **List endpoints in a collection**:
   ```
   Tool: list-api-endpoints
   - collectionName: "Duo Admin API v4.1.0"
   ```

3. **Execute an API call**:
   ```
   Tool: call-api
   - collectionName: "Duo Admin API v4.1.0"
   - endpointName: "Get Users"
   - environment: "dev-environment"
   ```

## Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run the compiled API server
- `npm run dev` - Build and run in development mode
- `npm run setup-claude` - Automatically configure Claude Desktop (macOS/Linux)
- `npm run test-setup` - Verify installation and setup

## Installation and Setup

1. Build the project:
   ```bash
   npm run build
   ```

2. Configure your MCP client to use this server:
   ```json
   {
     "mcpServers": {
       "duo-apis": {
         "command": "node",
         "args": ["/absolute/path/to/build/index.js"]
       }
     }
   }
   ```

## Quick Setup

### Automatic Setup (Recommended)

Run the automated setup script to build the project and configure Claude Desktop:

```bash
# On macOS/Linux
npm run setup-claude

# On Windows (PowerShell)
npm run build
.\scripts\setup-claude.ps1
```

This script will:
- Build the TypeScript project
- Create or update your Claude Desktop configuration
- Backup any existing configuration
- Provide next steps for testing

### Manual Setup

## Claude Desktop Configuration

To use this MCP server with Claude Desktop, add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "duo-apis": {
      "command": "node",
      "args": ["/Users/rmarther/src/duo/duo_api_mcp/build/index.js"]
    }
  }
}
```

**Note**: Update the path in the `args` array to match your actual installation directory.

## Supported Postman Features

- ✅ Collection variables
- ✅ Environment variables
- ✅ Variable substitution with {{variable}} syntax
- ✅ Bearer token authentication
- ✅ Basic authentication
- ✅ API key authentication
- ✅ Raw request bodies
- ✅ Form-data bodies
- ✅ URL-encoded bodies
- ✅ Custom headers
- ✅ Query parameters

## Requirements

- Node.js 18+
- TypeScript
- Postman collection format v2.1+

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

## License

ISC

## 🛠️ Troubleshooting

### Common Issues

#### "User API client not available"
This error typically indicates credential issues:

1. **Check credentials**: Verify your `ikey`, `skey`, and `apihost` in the environment file
2. **Real vs test credentials**: Ensure you're not using demo/example credentials
3. **API permissions**: Verify your integration has permission for the endpoint
4. **Network connectivity**: Test if you can reach the API hostname

```bash
# Test credentials manually
curl -H "Authorization: Basic $(echo -n 'ikey:skey' | base64)" \
     https://your-api-host/admin/v1/info
```

#### "Collection not found"
- Run `refresh-api-collections` tool to reload collections
- Check that `.json` files are in the `collections/` directory
- Verify JSON syntax with: `node -e "JSON.parse(require('fs').readFileSync('collections/your-file.json'))"`

#### "Environment not loaded"
- Environment files must contain "environment" or "env" in filename
- Check JSON syntax: missing commas, trailing commas, etc.
- Use `list-environments` tool to see what's loaded

#### Claude Desktop Connection Issues
- Verify the absolute path in `claude_desktop_config.json`
- Check that the build directory exists: `ls -la build/index.js`
- Restart Claude Desktop after configuration changes
- Check Claude Desktop logs for connection errors

### Debug Mode

Enable verbose logging by setting environment variables:

```bash
# Development mode with extra logging
NODE_ENV=development DEBUG=* node build/index.js

# Check what collections/environments are loaded
node build/index.js 2>&1 | grep -E "(Loaded|collections|environments)"
```

### Validation Commands

```bash
# Verify build
npm run build && echo "✅ Build successful" || echo "❌ Build failed"

# Test environment file syntax
node -e "console.log('✅ Environment valid:', JSON.parse(require('fs').readFileSync('environments/duo_api_env.json')))"

# List all available endpoints
node -e "
const fs = require('fs');
const files = fs.readdirSync('collections').filter(f => f.endsWith('.json'));
files.forEach(f => {
  try {
    const c = JSON.parse(fs.readFileSync(\`collections/\${f}\`));
    console.log(\`📚 \${c.info.name}: \${c.item.length} items\`);
  } catch(e) { console.log(\`❌ \${f}: \${e.message}\`); }
});
"
```

## 📊 Monitoring & Logs

### Server Status
Use the built-in tools to monitor the server:

```
Tool: get-server-status
```

Shows:
- Loaded collections and environments
- SSL configuration
- Search directories
- Configuration summary

### Log Locations

#### Development
Logs are output to stderr when running directly:
```bash
node build/index.js 2> server.log
```

#### PM2 Service
```bash
pm2 logs duo-api-mcp
pm2 logs duo-api-mcp --lines 100
```

#### Systemd Service
```bash
sudo journalctl -u duo-api-mcp -f
sudo journalctl -u duo-api-mcp --since "1 hour ago"
```

## 🔄 Updates & Maintenance

### Updating the Server
```bash
# Pull latest changes (if using git)
git pull

# Reinstall dependencies
npm install

# Rebuild
npm run build

# Restart service
pm2 restart duo-api-mcp
# OR
sudo systemctl restart duo-api-mcp
```

### Adding New API Collections
1. Place `.json` collection files in `collections/` directory
2. Use `refresh-api-collections` tool to reload without restart
3. Verify with `list-available-apis` tool

### Environment Updates
1. Edit files in `environments/` directory
2. Use `refresh-api-collections` tool to reload
3. Verify with `list-environments` tool

## 📋 Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run the compiled API server
- `npm run dev` - Build and run in development mode
- `npm run setup-claude` - Automated Claude Desktop setup (if available)
- `npm test` - Run tests (if configured)

## 🔗 Related Documentation

- [DUO_AUTHENTICATION.md](./DUO_AUTHENTICATION.md) - Detailed authentication guide
- [POSTMAN_ABSTRACTION.md](./POSTMAN_ABSTRACTION.md) - Technical implementation details
- [collections/README.md](./collections/README.md) - Collection management
- [environments/README.md](./environments/README.md) - Environment configuration

## 📝 License

ISC

## 🆘 Support

For issues with:
- **Duo API**: Check [Duo's official documentation](https://duo.com/docs/adminapi)
- **MCP Protocol**: See [Model Context Protocol documentation](https://modelcontextprotocol.io/)
- **This server**: Check the troubleshooting section above or create an issue
