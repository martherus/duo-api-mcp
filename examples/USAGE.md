# Usage Examples

This guide shows how to use the Postman Collection MCP Server. The server now **automatically loads** collections and environments at startup!

## 🚀 Auto-Loading (Recommended)

The server automatically discovers and loads collections from:
- `./collections/` directory (your main collections)
- `./examples/` directory (sample files)

### Quick Start with Auto-Loading

1. **Check what's loaded**:
   ```
   Tool: get-server-status
   ```
   This shows all auto-loaded collections and environments.

2. **Execute a request immediately**:
   ```
   Tool: execute-request
   - collectionName: Sample API Collection
   - requestName: Get All Posts
   - environment: Sample Environment
   ```

3. **Try the User Management API**:
   ```
   Tool: execute-request
   - collectionName: User Management API
   - requestName: List Users
   - environment: Development Environment
   ```

4. **Refresh collections after adding new files**:
   ```
   Tool: refresh-collections
   ```

## 📂 Directory Structure

```
mcp/
├── collections/               # Auto-loaded collections
│   ├── sample-collection.json
│   ├── user-management.json
│   └── your-api.json
├── environments/              # Auto-loaded environments  
│   ├── sample-environment.json
│   ├── dev-environment.json
│   └── prod-environment.json
└── examples/                  # Also scanned for collections
    ├── sample-collection.json
    └── sample-environment.json
```

## 🆕 Auto-Loading Examples

### Check Server Status
```
Tool: get-server-status
```
Shows all auto-loaded collections and environments.

### Execute from User Management API
```
Tool: execute-request
- collectionName: User Management API
- requestName: List Users
- environment: Development Environment
```

### Create a New User
```
Tool: execute-request
- collectionName: User Management API
- requestName: Create User
- environment: Development Environment
- overrideVars: {
    "userName": "Jane Smith",
    "userJob": "Product Manager"
  }
```

### Refresh After Adding Files
```
Tool: refresh-collections
```
Reloads all collections and environments without restarting.

## 📜 Manual Loading (Legacy)

## Quick Start

1. **Load the sample collection**:
   ```
   Tool: load-postman-collection
   - filePath: ./examples/sample-collection.json
   - collectionName: sample-api
   ```

2. **Load the sample environment**:
   ```
   Tool: load-environment
   - filePath: ./examples/sample-environment.json
   - environmentName: dev
   ```

3. **List available requests**:
   ```
   Tool: list-requests
   - collectionName: sample-api
   ```

4. **Execute a simple GET request**:
   ```
   Tool: execute-request
   - collectionName: sample-api
   - requestName: Get All Posts
   - environment: dev
   ```

5. **Execute a request with variable overrides**:
   ```
   Tool: execute-request
   - collectionName: sample-api
   - requestName: Get Post by ID
   - environment: dev
   - overrideVars: {"postId": "5"}
   ```

## Advanced Usage

### Creating a New Post
```
Tool: execute-request
- collectionName: sample-api
- requestName: Create New Post
- environment: dev
- overrideVars: {
    "postTitle": "My New Post",
    "postBody": "This is the content of my new post",
    "userId": "1"
  }
```

### Using Different Environments
You can create multiple environment files for different stages (dev, staging, prod) and switch between them by specifying different environment names when executing requests.

### Variable Override Priority
Variables are resolved in this order (highest priority first):
1. overrideVars parameter
2. Environment variables
3. Collection variables

## 🔒 SSL Certificate Issues

If you encounter SSL certificate errors, the server is configured to bypass certificate validation by default. You can check the configuration:

### Check SSL Status
```
Tool: get-server-status
```

### Configure SSL for Production
```
Tool: configure-ssl
- strictSSL: true
```

### Configure SSL for Development
```
Tool: configure-ssl
- strictSSL: false
```

## Troubleshooting

- Make sure file paths are absolute or relative to where you're running the MCP server
- Check that your JSON files are valid Postman collection/environment format
- Verify that all required variables are defined in your environment or collection
- Authentication tokens should be properly configured in your environment files
