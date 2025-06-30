# PowerShell script to configure Duo APIs MCP Server for Claude Desktop
# This script adds the MCP server configuration to Claude Desktop's config file

param(
    [switch]$Force = $false
)

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"

# Get the absolute path to the MCP server
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$McpServerPath = Join-Path $ScriptDir "build\index.js"

# Claude Desktop config path for Windows
$ClaudeConfigDir = Join-Path $env:APPDATA "Claude"
$ClaudeConfigFile = Join-Path $ClaudeConfigDir "claude_desktop_config.json"

Write-Host "Duo APIs MCP Server Configuration Script" -ForegroundColor $Green
Write-Host "==================================================" -ForegroundColor $Green
Write-Host ""

# Check if build exists
if (-not (Test-Path $McpServerPath)) {
    Write-Host "Error: MCP server not built. Please run 'npm run build' first." -ForegroundColor $Red
    exit 1
}

Write-Host "MCP Server Path: " -NoNewline
Write-Host $McpServerPath -ForegroundColor $Yellow
Write-Host "Claude Config File: " -NoNewline
Write-Host $ClaudeConfigFile -ForegroundColor $Yellow
Write-Host ""

# Create Claude config directory if it doesn't exist
if (-not (Test-Path $ClaudeConfigDir)) {
    New-Item -ItemType Directory -Path $ClaudeConfigDir -Force | Out-Null
}

# Convert Windows path separators for JSON
$JsonPath = $McpServerPath -replace '\\', '\\'

# Check if config file exists
if (-not (Test-Path $ClaudeConfigFile)) {
    Write-Host "Creating new Claude Desktop configuration file..."
    $NewConfig = @{
        mcpServers = @{
            "duo-apis" = @{
                command = "node"
                args = @($McpServerPath)
            }
        }
    }
    $NewConfig | ConvertTo-Json -Depth 3 | Set-Content $ClaudeConfigFile -Encoding UTF8
    Write-Host "✓ Created new configuration file" -ForegroundColor $Green
} else {
    # Backup existing config
    $BackupFile = "$ClaudeConfigFile.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $ClaudeConfigFile $BackupFile
    Write-Host "✓ Backed up existing config to: " -NoNewline -ForegroundColor $Yellow
    Write-Host (Split-Path $BackupFile -Leaf) -ForegroundColor $Yellow
    
    # Read existing config
    try {
        $ExistingConfig = Get-Content $ClaudeConfigFile -Raw | ConvertFrom-Json
        
        # Ensure mcpServers exists
        if (-not $ExistingConfig.mcpServers) {
            $ExistingConfig | Add-Member -NotePropertyName "mcpServers" -NotePropertyValue @{}
        }
        
        # Check if the configuration already exists
        if ($ExistingConfig.mcpServers."duo-apis" -and -not $Force) {
            Write-Host "⚠ MCP server 'duo-apis' already exists in configuration" -ForegroundColor $Yellow
            $response = Read-Host "Would you like to update it? (y/N)"
            if ($response -match "^[Yy]$") {
                $ExistingConfig.mcpServers."duo-apis" = @{
                    command = "node"
                    args = @($McpServerPath)
                }
                $ExistingConfig | ConvertTo-Json -Depth 4 | Set-Content $ClaudeConfigFile -Encoding UTF8
                Write-Host "✓ Updated existing configuration" -ForegroundColor $Green
            } else {
                Write-Host "Configuration unchanged."
                exit 0
            }
        } else {
            # Add or update the configuration
            $ExistingConfig.mcpServers."duo-apis" = @{
                command = "node"
                args = @($McpServerPath)
            }
            $ExistingConfig | ConvertTo-Json -Depth 4 | Set-Content $ClaudeConfigFile -Encoding UTF8
            Write-Host "✓ Added MCP server to existing configuration" -ForegroundColor $Green
        }
    } catch {
        Write-Host "Error reading existing configuration: $_" -ForegroundColor $Red
        Write-Host "Please manually add the following to your Claude Desktop config:" -ForegroundColor $Yellow
        Write-Host ""
        Write-Host "`"duo-apis`": {" -ForegroundColor $Yellow
        Write-Host "  `"command`": `"node`"," -ForegroundColor $Yellow
        Write-Host "  `"args`": [`"$McpServerPath`"]" -ForegroundColor $Yellow
        Write-Host "}" -ForegroundColor $Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "Configuration completed!" -ForegroundColor $Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Restart Claude Desktop completely"
Write-Host "2. Look for the MCP tools icon in Claude Desktop"
Write-Host "3. Try loading a Postman collection with: 'Load the collection from .\examples\sample-collection.json'"
Write-Host ""
Write-Host "To verify the configuration, check:"
Write-Host "  $ClaudeConfigFile"
Write-Host ""
Write-Host "Note: Make sure Claude Desktop is updated to the latest version for MCP support" -ForegroundColor $Yellow
