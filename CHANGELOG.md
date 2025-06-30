# Changelog

All notable changes to the Duo API MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-06-30

### Initial Release

#### Added
- **Core MCP Server Implementation**
  - Complete MCP (Model Context Protocol) server for Duo API integration
  - Built-in HMAC-SHA512 authentication for all Duo API calls
  - Support for Admin API, Auth API, and Accounts API

- **Auto-Loading System**
  - Automatic discovery and loading of API collections at startup
  - Environment file auto-loading with validation
  - Support for both Postman format and simple key-value environments

- **MCP Tools**
  - `list-available-apis`: Browse all available API collections
  - `list-api-endpoints`: View endpoints within specific collections
  - `call-api`: Execute API calls with automatic authentication
  - `get-server-status`: Monitor server status and configuration
  - `refresh-api-collections`: Reload collections without restart
  - `configure-ssl`: Manage SSL certificate validation settings
  - `load-environment`: Manual environment loading
  - `list-environments`: View loaded environment configurations

- **API Collections**
  - Duo Admin API v4.1.0 (700+ endpoints)
  - Duo Auth API v3.2.0 (80+ endpoints)
  - Duo Accounts API v3.2.0 (20+ endpoints)
  - Duo Generic OIDC Integration v1.1.0
  - Duo OIDC Auth API
  - Duo UNIX collection

- **Authentication Features**
  - Automatic Duo API request detection
  - HMAC-SHA512 signature generation
  - Variable substitution for credentials
  - Support for Bearer tokens, Basic auth, API keys
  - Enhanced error handling with Duo-specific diagnostics

- **Deployment & Configuration**
  - Comprehensive setup documentation
  - Automated setup script (`setup.sh`)
  - PM2 service configuration
  - systemd service configuration
  - Claude Desktop integration guide
  - Multiple environment support (dev/staging/prod)

- **Developer Experience**
  - TypeScript implementation with full type safety
  - Comprehensive error handling and logging
  - Debug mode with verbose output
  - Validation commands for troubleshooting
  - Template files for easy credential setup

- **Documentation**
  - Complete README.md with setup instructions
  - Troubleshooting guide with common solutions
  - Environment configuration guide
  - Collection management documentation
  - Service deployment instructions
  - Client integration examples

#### Technical Details
- **Dependencies**: Model Context Protocol SDK, Axios, Zod, CryptoJS, Moment
- **Build System**: TypeScript with automated builds
- **Package Management**: npm with lock file
- **Code Quality**: ESLint-ready structure, comprehensive error handling
- **Security**: Credential template system, .gitignore for sensitive files

#### Supported Features
- ✅ Postman Collection format v2.1+
- ✅ Variable substitution with {{variable}} syntax
- ✅ Multiple request body formats (raw, form-data, url-encoded)
- ✅ Custom headers and query parameters
- ✅ SSL certificate validation configuration
- ✅ Background service deployment
- ✅ Auto-discovery of collections and environments
- ✅ Real-time collection refresh without restart

### Changed
- N/A (Initial release)

### Deprecated
- N/A (Initial release)

### Removed
- N/A (Initial release)

### Fixed
- N/A (Initial release)

### Security
- Implemented secure credential handling with template system
- Added .gitignore rules to prevent credential exposure
- HMAC-SHA512 authentication for Duo API security compliance

---

## Future Plans

### Planned Features
- [ ] Web-based management interface
- [ ] Collection editor and validator
- [ ] Advanced authentication methods
- [ ] Request caching and rate limiting
- [ ] Webhook support for collection updates
- [ ] Integration with other identity providers
- [ ] Performance monitoring and metrics
- [ ] Automated testing framework

### Potential Improvements
- [ ] GraphQL endpoint support
- [ ] WebSocket connections for real-time updates
- [ ] Plugin system for custom authentication
- [ ] Collection versioning and rollback
- [ ] Enhanced logging and audit trails
- [ ] Multi-tenant support
- [ ] Configuration management UI
- [ ] Automated documentation generation

---

## Release Notes Format

For future releases, each entry should include:
- **Version number** and release date
- **Added**: New features and capabilities
- **Changed**: Modifications to existing functionality
- **Deprecated**: Features marked for future removal
- **Removed**: Features removed in this version
- **Fixed**: Bug fixes and corrections
- **Security**: Security-related changes and improvements

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on contributing to this project.

## Support

For questions about releases or to report issues:
- Check the troubleshooting section in README.md
- Review existing GitHub issues
- Create a new issue with detailed information
