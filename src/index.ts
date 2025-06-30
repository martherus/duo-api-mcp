#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { promises as fs } from "fs";
import * as path from "path";
import https from "https";
import CryptoJS from 'crypto-js';
import moment from 'moment';

// Configuration options
const CONFIG = {
  // Disable certificate validation for development/testing environments
  // Set to true to enable strict certificate validation
  strictSSL: false,
  timeout: 30000,
  maxResponseSize: 10 * 1024 * 1024, // 10MB
};

// Postman Collection Types
interface PostmanCollection {
  info: {
    name: string;
    description?: string;
    version?: string;
  };
  item: PostmanItem[];
  variable?: PostmanVariable[];
  auth?: PostmanAuth;
}

interface PostmanItem {
  name: string;
  request?: PostmanRequest;  // Optional for folders
  item?: PostmanItem[];      // For nested folders/groups
  response?: any[];
  event?: PostmanEvent[];
}

interface PostmanRequest {
  method: string;
  header?: PostmanHeader[];
  body?: PostmanBody;
  url: PostmanUrl | string;
  auth?: PostmanAuth;
  description?: string;
}

interface PostmanHeader {
  key: string;
  value: string;
  disabled?: boolean;
}

interface PostmanBody {
  mode: string;
  raw?: string;
  formdata?: Array<{
    key: string;
    value: string;
    type?: string;
  }>;
  urlencoded?: Array<{
    key: string;
    value: string;
  }>;
}

interface PostmanUrl {
  raw: string;
  protocol?: string;
  host?: string[];
  port?: string;
  path?: string[];
  query?: Array<{
    key: string;
    value: string;
  }>;
}

interface PostmanVariable {
  key: string;
  value: string;
  type?: string;
}

interface PostmanAuth {
  type: string;
  bearer?: Array<{
    key: string;
    value: string;
    type: string;
  }>;
  basic?: Array<{
    key: string;
    value: string;
    type: string;
  }>;
  apikey?: Array<{
    key: string;
    value: string;
    type: string;
  }>;
}

interface PostmanEvent {
  listen: string;
  script: {
    type: string;
    exec: string[];
  };
}

// MCP Server instance
const server = new McpServer({
  name: "duo-api-mcp-server",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Auto-discovery functions
async function discoverCollections(): Promise<void> {
  console.error("🔍 Discovering API collections...");
  
  // Get the directory where this script is located
  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const projectDir = path.resolve(scriptDir, '..');
  
  const collectionsDir = path.join(projectDir, "collections");
  const examplesDir = path.join(projectDir, "examples");
  
  console.error(`  📂 Searching in: ${collectionsDir}`);
  console.error(`  📂 Searching in: ${examplesDir}`);
  
  const searchDirs = [collectionsDir, examplesDir];
  
  for (const dir of searchDirs) {
    try {
      const files = await fs.readdir(dir);
      const jsonFiles = files.filter(file => file.endsWith('.json') && !file.includes('environment'));
      
      for (const file of jsonFiles) {
        const filePath = path.join(dir, file);
        try {
          const fileContent = await fs.readFile(filePath, 'utf-8');
          const collection: PostmanCollection = JSON.parse(fileContent);
          
          // Validate it's a collection
          if (collection.info && collection.item) {
            const collectionName = collection.info.name || path.basename(file, '.json');
            loadedCollections.set(collectionName, collection);
            console.error(`  ✅ Loaded API collection: ${collectionName} (${collection.item.length} endpoints)`);
          }
        } catch (error) {
          console.error(`  ⚠️  Failed to load ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error(`  📂 Directory not found: ${dir}`);
    }
  }
  
  console.error(`📚 Total API collections loaded: ${loadedCollections.size}`);
}

async function discoverEnvironments(): Promise<void> {
  console.error("🌍 Discovering environment files...");
  
  // Get the directory where this script is located
  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const projectDir = path.resolve(scriptDir, '..');
  
  const environmentsDir = path.join(projectDir, "environments");
  const examplesDir = path.join(projectDir, "examples");
  
  console.error(`  📂 Searching in: ${environmentsDir}`);
  console.error(`  📂 Searching in: ${examplesDir}`);
  
  const searchDirs = [environmentsDir, examplesDir];
  
  for (const dir of searchDirs) {
    try {
      const files = await fs.readdir(dir);
      const envFiles = files.filter(file => 
        file.endsWith('.json') && 
        (file.includes('environment') || file.includes('env'))
      );
      
      for (const file of envFiles) {
        const filePath = path.join(dir, file);
        try {
          const fileContent = await fs.readFile(filePath, 'utf-8');
          const envData = JSON.parse(fileContent);
          
          const envVars = new Map<string, string>();
          
          // Handle collection format
          if (envData.values) {
            envData.values.forEach((item: any) => {
              if (item.enabled !== false) {
                envVars.set(item.key, item.value);
              }
            });
          } else {
            // Handle simple key-value format
            Object.entries(envData).forEach(([key, value]) => {
              envVars.set(key, String(value));
            });
          }
          
          const envName = envData.name || path.basename(file, '.json');
          environments.set(envName, envVars);
          console.error(`  ✅ Loaded environment: ${envName} (${envVars.size} variables)`);
          
        } catch (error) {
          console.error(`  ⚠️  Failed to load ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error(`  📂 Directory not found: ${dir}`);
    }
  }
  
  console.error(`🌐 Total environments loaded: ${environments.size}`);
}

// Global variables to store collections and environments
let loadedCollections: Map<string, PostmanCollection> = new Map();
let environments: Map<string, Map<string, string>> = new Map();

// Helper function to resolve variables in strings
function resolveVariables(text: string, collectionVars: Map<string, string>, envVars: Map<string, string>): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
    return envVars.get(varName) || collectionVars.get(varName) || match;
  });
}

// Helper function to parse URL
function parseUrl(url: PostmanUrl | string): string {
  if (typeof url === 'string') {
    return url;
  }
  
  if (url.raw) {
    return url.raw;
  }
  
  // Fallback: construct URL from parts
  if (url.protocol && url.host && url.path) {
    const hostStr = Array.isArray(url.host) ? url.host.join('.') : url.host;
    const pathStr = Array.isArray(url.path) ? '/' + url.path.join('/') : url.path;
    return `${url.protocol}://${hostStr}${pathStr}`;
  }
  
  return 'Unknown URL format';
}

// Helper function to build headers
function buildHeaders(headers: PostmanHeader[] = [], auth?: PostmanAuth): Record<string, string> {
  const headerMap: Record<string, string> = {};
  
  // Add regular headers
  headers.forEach(header => {
    if (!header.disabled) {
      headerMap[header.key] = header.value;
    }
  });

  // Add auth headers
  if (auth) {
    switch (auth.type) {
      case 'bearer':
        const bearerToken = auth.bearer?.find(item => item.key === 'token')?.value;
        if (bearerToken) {
          headerMap['Authorization'] = `Bearer ${bearerToken}`;
        }
        break;
      case 'basic':
        const username = auth.basic?.find(item => item.key === 'username')?.value || '';
        const password = auth.basic?.find(item => item.key === 'password')?.value || '';
        const credentials = Buffer.from(`${username}:${password}`).toString('base64');
        headerMap['Authorization'] = `Basic ${credentials}`;
        break;
      case 'apikey':
        const key = auth.apikey?.find(item => item.key === 'key')?.value;
        const value = auth.apikey?.find(item => item.key === 'value')?.value;
        const inHeader = auth.apikey?.find(item => item.key === 'in')?.value === 'header';
        if (key && value && inHeader) {
          headerMap[key] = value;
        }
        break;
    }
  }

  return headerMap;
}

// Register MCP tools
server.tool(
  "list-available-apis",
  "List all available API collections and their endpoints",
  {},
  async () => {
    const collections = Array.from(loadedCollections.entries()).map(([name, collection]) => {
      const requestCount = flattenCollectionItems(collection.item).length;
      return `• ${name}: ${collection.info.description || 'No description'} (${requestCount} endpoints)`;
    });
    
    return {
      content: [
        {
          type: "text",
          text: collections.length > 0 
            ? `Available API collections:\n${collections.join('\n')}\n\nUse 'list-api-endpoints' to see specific endpoints in a collection.`
            : "No API collections available."
        }
      ]
    };
  }
);
server.tool(
  "list-api-endpoints", 
  "List all endpoints in a specific API collection",
  {
    collectionName: z.string().describe("Name of the API collection to list endpoints from")
  },
  async ({ collectionName }) => {
    const collection = loadedCollections.get(collectionName);
    if (!collection) {
      return {
        content: [
          {
            type: "text",
            text: `API collection '${collectionName}' not found. Available collections: ${Array.from(loadedCollections.keys()).join(', ')}`
          }
        ]
      };
    }
    
    const flattened = flattenCollectionItems(collection.item);
    const endpoints = flattened.map((item, index) => {
      if (!item.item.request) return `${index + 1}. ${item.path} - (Folder)`;
      
      try {
        const url = parseUrl(item.item.request.url);
        return `${index + 1}. ${item.path}\n   Method: ${item.item.request.method}\n   URL: ${url}\n   Description: ${item.item.request.description || 'No description'}`;
      } catch (error) {
        return `${index + 1}. ${item.path}\n   Method: ${item.item.request.method}\n   URL: [URL parsing error]\n   Description: ${item.item.request.description || 'No description'}`;
      }
    }).filter(Boolean);
    
    return {
      content: [
        {
          type: "text",
          text: `Endpoints in '${collectionName}':\n\n${endpoints.join('\n\n')}`
        }
      ]
    };
  }
);

server.tool(
  "call-api",
  "Execute an API call to a specific endpoint",
  {
    collectionName: z.string().describe("Name of the API collection"),
    endpointName: z.string().describe("Name of the API endpoint to call"),
    environment: z.string().optional().describe("Optional environment name to use for configuration"),
    variables: z.record(z.string()).optional().describe("Optional variables to override for this API call")
  },
  async ({ collectionName, endpointName, environment, variables = {} }) => {
    try {
      const collection = loadedCollections.get(collectionName);
      if (!collection) {
        return {
          content: [
            {
              type: "text",
              text: `Collection '${collectionName}' not found.`
            }
          ]
        };
      }
      
      const request = findRequestInCollection(collection, endpointName);
      if (!request || !request.request) {
        return {
          content: [
            {
              type: "text",
              text: `API endpoint '${endpointName}' not found in collection '${collectionName}'.`
            }
          ]
        };
      }
      
      // Prepare variables
      const collectionVars = new Map<string, string>();
      collection.variable?.forEach(variable => {
        collectionVars.set(variable.key, variable.value);
      });
      
      const envVars = environment ? (environments.get(environment) || new Map()) : new Map();
      
      // Add override variables
      Object.entries(variables).forEach(([key, value]) => {
        envVars.set(key, value);
      });
      
      // Resolve URL
      const rawUrl = parseUrl(request.request.url);
      const resolvedUrl = resolveVariables(rawUrl, collectionVars, envVars);
      
      // Build headers
      const headers = buildHeaders(request.request.header, request.request.auth || collection.auth);
      
      // Resolve headers
      const resolvedHeaders: Record<string, string> = {};
      Object.entries(headers).forEach(([key, value]) => {
        resolvedHeaders[key] = resolveVariables(value, collectionVars, envVars);
      });
      
      // Check if this is a Duo API request and apply authentication
      if (isDuoApiRequest(resolvedUrl, resolvedHeaders, envVars)) {
        console.error(`🔐 Detected Duo API request, applying HMAC-SHA512 authentication`);
        console.error(`🔍 Available environment variables: ${Array.from(envVars.keys()).join(', ')}`);
        console.error(`🔍 Available collection variables: ${Array.from(collectionVars.keys()).join(', ')}`);
        
        const ikey = envVars.get('ikey') || collectionVars.get('ikey');
        const skey = envVars.get('skey') || collectionVars.get('skey');
        const apihost = envVars.get('apihost') || collectionVars.get('apihost');
        
        console.error(`🔑 Credential check:`);
        console.error(`  - ikey: ${ikey ? '✅ Found' : '❌ Missing'}`);
        console.error(`  - skey: ${skey ? '✅ Found' : '❌ Missing'}`);
        console.error(`  - apihost: ${apihost ? '✅ Found' : '❌ Missing'}`);
        
        if (!ikey || !skey || !apihost) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Duo API authentication required but missing credentials:
- ikey: ${ikey ? '✅ Found' : '❌ Missing'}
- skey: ${skey ? '✅ Found' : '❌ Missing'}  
- apihost: ${apihost ? '✅ Found' : '❌ Missing'}

Available environment variables: ${Array.from(envVars.keys()).join(', ')}
Available collection variables: ${Array.from(collectionVars.keys()).join(', ')}

Please ensure these variables are set in your environment or collection variables.`
              }
            ]
          };
        }
        
        // Add warning for test/demo credentials
        if (ikey === 'DIWHV33JEFGR9STQZ8IU' || apihost.includes('deadbeef') || apihost.includes('.test')) {
          console.error(`⚠️  WARNING: Detected test/demo credentials!`);
          console.error(`   - Integration Key: ${ikey}`);
          console.error(`   - API Host: ${apihost}`);
          console.error(`   - These may be example values that won't work with real APIs`);
        }
        
        // Parse URL to extract path and query string
        const urlObj = new URL(resolvedUrl);
        const path = urlObj.pathname;
        const queryString = urlObj.search.substring(1); // Remove the '?' prefix
        
        // Prepare body for Duo auth calculation
        let bodyForAuth: string | undefined;
        if (request.request.body && ['POST', 'PUT'].includes(request.request.method)) {
          switch (request.request.body.mode) {
            case 'raw':
              bodyForAuth = resolveVariables(request.request.body.raw || '', collectionVars, envVars);
              break;
            default:
              bodyForAuth = '';
          }
        }
        
        // Generate Duo authentication
        const duoAuth = generateDuoAuthHeader({
          ikey,
          skey,
          apihost,
          method: request.request.method,
          path,
          queryString,
          body: bodyForAuth
        });
        
        // Apply Duo authentication headers
        resolvedHeaders['Authorization'] = duoAuth.authorization;
        resolvedHeaders['Date'] = duoAuth.date;
        resolvedHeaders['Content-Type'] = 'application/json';
        
        console.error(`🔐 Duo authentication headers applied successfully`);
      }
      
      // Prepare request config
      const axiosConfig: AxiosRequestConfig = {
        method: request.request.method.toLowerCase() as any,
        url: resolvedUrl,
        headers: resolvedHeaders,
        timeout: CONFIG.timeout,
        maxContentLength: CONFIG.maxResponseSize,
        maxBodyLength: CONFIG.maxResponseSize,
      };
      
      // Configure SSL certificate validation
      if (!CONFIG.strictSSL) {
        axiosConfig.httpsAgent = new https.Agent({
          rejectUnauthorized: false
        });
        console.error(`⚠️  SSL certificate validation disabled for: ${resolvedUrl}`);
      }
      
      // Add body if present
      if (request.request.body) {
        switch (request.request.body.mode) {
          case 'raw':
            axiosConfig.data = resolveVariables(request.request.body.raw || '', collectionVars, envVars);
            break;
          case 'formdata':
            const formData = new FormData();
            request.request.body.formdata?.forEach(item => {
              formData.append(item.key, resolveVariables(item.value, collectionVars, envVars));
            });
            axiosConfig.data = formData;
            break;
          case 'urlencoded':
            const urlEncodedData = new URLSearchParams();
            request.request.body.urlencoded?.forEach(item => {
              urlEncodedData.append(item.key, resolveVariables(item.value, collectionVars, envVars));
            });
            axiosConfig.data = urlEncodedData;
            break;
        }
      }
      
      // Execute request
      const startTime = Date.now();
      const response: AxiosResponse = await axios(axiosConfig);
      const endTime = Date.now();
      
      // Format response
      const responseText = `Request executed successfully!

📝 Request Details:
   Method: ${request.request.method}
   URL: ${resolvedUrl}
   Headers: ${JSON.stringify(resolvedHeaders, null, 2)}

⚡ Response:
   Status: ${response.status} ${response.statusText}
   Time: ${endTime - startTime}ms
   Headers: ${JSON.stringify(response.headers, null, 2)}
   
📄 Response Body:
${typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data}`;
      
      return {
        content: [
          {
            type: "text",
            text: responseText
          }
        ]
      };
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        let errorDetails = `Request failed!

❌ Error Details:
   Status: ${error.response?.status} ${error.response?.statusText || 'Unknown'}
   Message: ${error.message}
   URL: ${error.config?.url || 'Unknown'}`;

        // Add specific Duo API error handling
        if (error.response?.data) {
          const errorData = error.response.data;
          if (typeof errorData === 'object') {
            // Duo API typically returns errors in specific format
            if (errorData.stat === 'FAIL' && errorData.code && errorData.message) {
              errorDetails += `
              
🔍 Duo API Error:
   Code: ${errorData.code}
   Message: ${errorData.message}
   Stat: ${errorData.stat}`;
              
              // Add specific guidance for common errors
              if (errorData.message.includes('User API client not available')) {
                errorDetails += `
                
💡 Troubleshooting "User API client not available":
   1. Check if your integration key (ikey) is correct
   2. Verify your secret key (skey) is valid and not expired  
   3. Ensure your API hostname (apihost) is correct
   4. Confirm the integration has permission for this endpoint
   5. Check if you're using test vs production credentials correctly
   
🔧 Current Configuration:
   - API Host: ${error.config?.url ? new URL(error.config.url).hostname : 'Unknown'}
   - Integration Key: ${error.config?.headers?.Authorization ? 'Present (Basic auth detected)' : 'Missing'}`;
              }
            } else {
              errorDetails += `
              
📄 Raw Error Response:
${JSON.stringify(errorData, null, 2)}`;
            }
          } else {
            errorDetails += `
            
📄 Error Response:
${errorData}`;
          }
        } else {
          errorDetails += `
          
📄 No response body received`;
        }
        
        return {
          content: [
            {
              type: "text",
              text: errorDetails
            }
          ]
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `Error executing request: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ]
        };
      }
    }
  }
);

server.tool(
  "load-environment",
  "Load environment configuration from a JSON file",
  {
    filePath: z.string().describe("Path to the environment JSON file"),
    environmentName: z.string().describe("Name to reference this environment")
  },
  async ({ filePath, environmentName }) => {
    try {
      const fullPath = path.resolve(filePath);
      const fileContent = await fs.readFile(fullPath, 'utf-8');
      const envData = JSON.parse(fileContent);
      
      const envVars = new Map<string, string>();
      
      // Handle environment format
      if (envData.values) {
        envData.values.forEach((item: any) => {
          envVars.set(item.key, item.value);
        });
      } else {
        // Handle simple key-value format
        Object.entries(envData).forEach(([key, value]) => {
          envVars.set(key, String(value));
        });
      }
      
      environments.set(environmentName, envVars);
      
      return {
        content: [
          {
            type: "text",
            text: `Successfully loaded environment '${environmentName}' with ${envVars.size} variables:\n${Array.from(envVars.keys()).map(key => `• ${key}`).join('\n')}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error loading environment: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ]
      };
    }
  }
);

server.tool(
  "list-environments",
  "List all loaded environment configurations",
  {},
  async () => {
    const envList = Array.from(environments.entries()).map(([name, vars]) => {
      return `• ${name}: ${vars.size} variables`;
    });
    
    return {
      content: [
        {
          type: "text",
          text: envList.length > 0 
            ? `Available environments:\n${envList.join('\n')}`
            : "No environments loaded."
        }
      ]
    };
  }
);

server.tool(
  "refresh-api-collections",
  "Refresh and reload all API collections and environments from the file system",
  {},
  async () => {
    try {
      // Clear existing collections and environments
      loadedCollections.clear();
      environments.clear();
      
      // Rediscover everything
      await discoverCollections();
      await discoverEnvironments();
      
      // Get the actual search paths for the report
      const scriptDir = path.dirname(new URL(import.meta.url).pathname);
      const projectDir = path.resolve(scriptDir, '..');
      
      const summary = `🔄 Refresh completed!

📚 API Collections: ${loadedCollections.size} loaded
🌐 Environments: ${environments.size} loaded

📂 Searched directories:
  ${path.join(projectDir, "collections")}
  ${path.join(projectDir, "examples")}
  ${path.join(projectDir, "environments")}

Available API collections:
${Array.from(loadedCollections.entries()).map(([name, collection]) => 
  `• ${name}: ${collection.item.length} endpoints`
).join('\n') || '  None found'}

Available environments:
${Array.from(environments.entries()).map(([name, vars]) => 
  `• ${name}: ${vars.size} variables`
).join('\n') || '  None found'}`;
      
      return {
        content: [
          {
            type: "text",
            text: summary
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error refreshing API collections: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ]
      };
    }
  }
);

server.tool(
  "configure-ssl",
  "Configure SSL certificate validation settings",
  {
    strictSSL: z.boolean().describe("Enable strict SSL certificate validation (true) or disable for development (false)")
  },
  async ({ strictSSL }) => {
    CONFIG.strictSSL = strictSSL;
    
    const status = strictSSL 
      ? "🔒 SSL certificate validation enabled (production mode)"
      : "⚠️  SSL certificate validation disabled (development mode)";
    
    return {
      content: [
        {
          type: "text",
          text: `SSL configuration updated: ${status}`
        }
      ]
    };
  }
);

server.tool(
  "get-server-status",
  "Get the current status of the API server including auto-loaded collections and environments",
  {},
  async () => {
    // Get the actual search paths
    const scriptDir = path.dirname(new URL(import.meta.url).pathname);
    const projectDir = path.resolve(scriptDir, '..');
    const collectionsDir = path.join(projectDir, "collections");
    const environmentsDir = path.join(projectDir, "environments");
    const examplesDir = path.join(projectDir, "examples");
    
    const collectionsList = Array.from(loadedCollections.entries()).map(([name, collection]) => {
      return `📁 ${name}: ${collection.info.description || 'No description'} (${collection.item.length} endpoints)`;
    });
    
    const environmentsList = Array.from(environments.entries()).map(([name, vars]) => {
      return `🌍 ${name}: ${vars.size} variables`;
    });
    
    const status = `🚀 Duo API Server Status

📚 Available API Collections (${loadedCollections.size}):
${collectionsList.length > 0 ? collectionsList.join('\n') : '  No API collections found'}

🌐 Available Environments (${environments.size}):
${environmentsList.length > 0 ? environmentsList.join('\n') : '  No environments found'}

⚙️  Configuration:
  SSL Certificate Validation: ${CONFIG.strictSSL ? '🔒 Enabled (production)' : '⚠️  Disabled (development)'}
  Request Timeout: ${CONFIG.timeout}ms
  Max Response Size: ${Math.round(CONFIG.maxResponseSize / 1024 / 1024)}MB

📂 Search Directories (relative to API server):
  Collections: ${collectionsDir}
  Collections: ${examplesDir}
  Environments: ${environmentsDir}
  Environments: ${examplesDir}

💡 Tip: Add your API collection files to the collections/ directory relative to the server
They will be automatically loaded when the server starts!`;
    
    return {
      content: [
        {
          type: "text",
          text: status
        }
      ]
    };
  }
);

// Helper function to flatten nested collection items
function flattenCollectionItems(items: PostmanItem[]): Array<{ item: PostmanItem; path: string }> {
  const flattened: Array<{ item: PostmanItem; path: string }> = [];
  
  function traverse(items: PostmanItem[], parentPath: string = '') {
    items.forEach(item => {
      const currentPath = parentPath ? `${parentPath} > ${item.name}` : item.name;
      
      if (item.request) {
        // This is a request item
        flattened.push({ item, path: currentPath });
      } else if (item.item) {
        // This is a folder/group with nested items
        traverse(item.item, currentPath);
      }
    });
  }
  
  traverse(items);
  return flattened;
}

// Helper function to find a request by name in a nested collection
function findRequestInCollection(collection: PostmanCollection, requestName: string): PostmanItem | null {
  const flattened = flattenCollectionItems(collection.item);
  
  // First try exact match
  let found = flattened.find(({ item }) => item.name === requestName);
  if (found) return found.item;
  
  // Then try case-insensitive match
  found = flattened.find(({ item }) => item.name.toLowerCase() === requestName.toLowerCase());
  if (found) return found.item;
  
  // Finally try partial match
  found = flattened.find(({ item }) => item.name.toLowerCase().includes(requestName.toLowerCase()));
  if (found) return found.item;
  
  return null;
}

// Duo API Authentication Functions
interface DuoAuthParams {
  ikey: string;
  skey: string;
  apihost: string;
  method: string;
  path: string;
  queryString: string;
  body?: string;
}

function generateDuoAuthHeader(params: DuoAuthParams): { authorization: string; date: string } {
  console.error(`🔐 Generating Duo API authentication for ${params.method} ${params.path}`);
  
  // Generate timestamp using moment
  const timestamp = moment().format('ddd, DD MMM YYYY HH:mm:ss ZZ');
  
  let requestData: string;
  let encodedParams = '';
  
  // Handle POST/PUT requests with body
  if (['POST', 'PUT'].includes(params.method) && params.body) {
    try {
      const jsonData = JSON.parse(params.body);
      encodedParams = JSON.stringify(jsonData);
      requestData = [
        timestamp,
        params.method,
        params.apihost,
        params.path,
        '',
        CryptoJS.SHA512(encodedParams).toString(CryptoJS.enc.Hex),
        CryptoJS.SHA512('').toString(CryptoJS.enc.Hex)
      ].join('\n');
    } catch (error) {
      console.error(`⚠️  Failed to parse JSON body: ${error}`);
      // Fallback for non-JSON bodies
      requestData = [
        timestamp,
        params.method,
        params.apihost,
        params.path,
        params.queryString || '',
        CryptoJS.SHA512('').toString(),
        CryptoJS.SHA512('').toString()
      ].join('\n');
    }
  } else {
    // Handle GET and other requests
    if (params.queryString) {
      // Sort query parameters
      const paramsArray = params.queryString.split('&');
      paramsArray.sort();
      encodedParams = paramsArray.map(param => {
        const [key, value] = param.split('=');
        return `${key}=${encodeURIComponent(value || '')}`;
      }).join('&');
    }
    
    requestData = [
      timestamp,
      params.method,
      params.apihost,
      params.path,
      encodedParams,
      CryptoJS.SHA512('').toString(CryptoJS.enc.Hex),
      CryptoJS.SHA512('').toString(CryptoJS.enc.Hex)
    ].join('\n');
  }
  
  // Calculate HMAC-SHA512
  const hmacDigest = CryptoJS.HmacSHA512(requestData, params.skey).toString(CryptoJS.enc.Hex);
  
  // Create authorization header (Basic auth with ikey:hmac)
  const prebase = `${params.ikey}:${hmacDigest}`;
  const baseComplete = Buffer.from(prebase).toString('base64');
  const authHeader = `Basic ${baseComplete}`;
  
  console.error(`🔐 Duo auth header generated successfully`);
  
  return {
    authorization: authHeader,
    date: timestamp
  };
}

function isDuoApiRequest(url: string, headers: Record<string, string>, envVars: Map<string, string>): boolean {
  console.error(`🔍 Checking if this is a Duo API request: ${url}`);
  
  // Check if this is a Duo API request by looking for Duo-specific patterns
  const duoPatterns = [
    /api\.duosecurity\.com/,
    /api-[a-f0-9]+\.duosecurity\.com/,
    /{{apihost}}/,
    /api-.*\.duo\.test/,  // Added for test environments
    /\/admin\/v\d+\//,    // Admin API path pattern
    /\/auth\/v\d+\//,     // Auth API path pattern
    /\/accounts\/v\d+\//  // Accounts API path pattern
  ];
  
  // Check URL patterns
  const hasApiHost = envVars.has('apihost') || envVars.has('APIHOST');
  const hasDuoKeys = envVars.has('ikey') && envVars.has('skey');
  const urlContainsDuo = duoPatterns.some(pattern => {
    const matches = pattern.test(url);
    if (matches) {
      console.error(`  ✅ URL matches Duo pattern: ${pattern}`);
    }
    return matches;
  });
  
  console.error(`  📊 Detection results:`);
  console.error(`    - Has apihost variable: ${hasApiHost}`);
  console.error(`    - Has Duo keys (ikey & skey): ${hasDuoKeys}`);
  console.error(`    - URL contains Duo patterns: ${urlContainsDuo}`);
  
  const isDuoRequest = (hasApiHost && hasDuoKeys) || urlContainsDuo;
  console.error(`  🎯 Final result: ${isDuoRequest ? 'IS' : 'NOT'} a Duo API request`);
  
  return isDuoRequest;
}

// Main function to run the server
async function main() {
  console.error("🚀 Starting Duo API MCP Server...");
  
  // Log SSL configuration
  const sslStatus = CONFIG.strictSSL ? "🔒 SSL validation enabled" : "⚠️  SSL validation disabled (development mode)";
  console.error(`⚙️  Configuration: ${sslStatus}`);
  
  // Auto-discover and load collections and environments
  await discoverCollections();
  await discoverEnvironments();
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("✅ Duo API MCP Server running on stdio");
  
  if (loadedCollections.size > 0) {
    console.error(`📋 Ready to execute ${Array.from(loadedCollections.values()).reduce((total, col) => total + col.item.length, 0)} API endpoints from ${loadedCollections.size} collections`);
  } else {
    console.error("💡 No API collections found. Add .json files to ./collections/ or ./examples/ directories");
  }
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
