# Environments Directory

This directory contains Postman environment JSON files that are automatically loaded when the MCP server starts.

**Path Resolution**: The server finds this directory relative to its own location (`/path/to/mcp/environments/`), not relative to Claude Desktop's working directory.

## Auto-Loading Behavior

- All `.json` files containing "environment" or "env" in the filename are loaded
- Files must be valid Postman environment format or simple key-value JSON
- Variables with `enabled: false` are ignored (Postman format)

## Naming Convention

- Include "environment" or "env" in filename: `dev-environment.json`, `prod-env.json`
- Use descriptive names: `local-environment.json`, `staging-env.json`

## Supported Formats

### Postman Environment Format
```json
{
  "name": "Development",
  "values": [
    {
      "key": "apiUrl",
      "value": "https://dev-api.example.com",
      "enabled": true
    },
    {
      "key": "apiKey",
      "value": "dev-key-123",
      "enabled": true
    }
  ]
}
```

### Simple Key-Value Format
```json
{
  "apiUrl": "https://dev-api.example.com",
  "apiKey": "dev-key-123",
  "userId": "12345"
}
```

## Variable Priority

When executing requests, variables are resolved in this order:
1. Override variables (passed in execute-request)
2. Environment variables
3. Collection variables

## Adding New Environments

1. Place your environment file in this directory
2. Ensure filename contains "environment" or "env"
3. Use the `refresh-collections` tool to reload
4. Or restart the MCP server

## Usage

Specify environment when executing requests:
- `environment: "Development"` (uses the name from the file)
- `environment: "dev-environment"` (uses the filename without extension)
