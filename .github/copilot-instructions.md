<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Postman Collection MCP Server

This is an MCP (Model Context Protocol) server that allows reading and executing Postman collections through MCP tools.

You can find more info and examples at https://modelcontextprotocol.io/llms-full.txt

## Project Structure

- `src/index.ts` - Main MCP server implementation
- `build/` - Compiled TypeScript output
- `package.json` - Node.js package configuration
- `tsconfig.json` - TypeScript configuration

## Key Features

- Load Postman collections from JSON files
- Execute individual requests from collections
- Support for environment variables and variable substitution
- Handle various authentication methods (Bearer, Basic, API Key)
- Support different request body formats (raw, form-data, url-encoded)

## Development Guidelines

When working on this project:

1. Follow TypeScript best practices
2. Use proper error handling for file operations and HTTP requests
3. Maintain compatibility with Postman collection format v2.1
4. Ensure proper variable resolution for {{variable}} syntax
5. Handle authentication methods as defined in Postman collections
6. Provide clear error messages and helpful tool descriptions
