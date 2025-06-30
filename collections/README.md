# Collections Directory

This directory contains Postman collection JSON files that are automatically loaded when the MCP server starts.

**Path Resolution**: The server finds this directory relative to its own location (`/path/to/mcp/collections/`), not relative to Claude Desktop's working directory.

## Auto-Loading Behavior

- All `.json` files in this directory are scanned at startup
- Files must be valid Postman collection format (v2.1+)
- Collections are identified by having `info` and `item` properties
- Environment files are ignored (should not contain "environment" in filename)

## Naming Convention

- Use descriptive names: `api-endpoints.json`, `user-management.json`
- Avoid "environment" in collection filenames
- Collection names will be derived from the `info.name` field or filename

## Supported Features

- ✅ Collection variables
- ✅ Authentication (Bearer, Basic, API Key)
- ✅ Request headers and bodies
- ✅ Variable substitution with {{variable}} syntax
- ✅ Multiple HTTP methods (GET, POST, PUT, DELETE, etc.)

## Adding New Collections

1. Place your `.json` collection file in this directory
2. Use the `refresh-collections` tool to reload without restarting
3. Or restart the MCP server to auto-discover new files

## Example Structure

Your collection should follow this basic structure:

```json
{
  "info": {
    "name": "My API Collection",
    "description": "Description of the API collection"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://api.example.com"
    }
  ],
  "item": [
    {
      "name": "Get Users",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/users"
      }
    }
  ]
}
```
