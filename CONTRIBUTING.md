# Contributing to Duo API MCP Server

Thank you for your interest in contributing to the Duo API MCP Server! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Git
- Basic familiarity with TypeScript and MCP protocol

### Development Setup
```bash
# Clone the repository
git clone https://github.com/cisco-sbg/duo-api-mcp.git
cd duo-api-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Run the setup script
npm run setup
```

## 🔧 Development Workflow

### Making Changes
1. **Fork the repository** (if external contributor)
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** following the coding standards below
4. **Test your changes** thoroughly
5. **Commit with descriptive messages**
6. **Push and create a pull request**

### Branch Naming Convention
- `feature/description` - New features
- `fix/description` - Bug fixes  
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

## 📝 Coding Standards

### TypeScript Guidelines
- Use TypeScript strict mode
- Provide proper type annotations
- Follow existing code style and patterns
- Use meaningful variable and function names

### Code Structure
- Keep functions focused and small
- Add JSDoc comments for public APIs
- Handle errors appropriately
- Use consistent naming conventions

### Testing
- Test new features and bug fixes
- Ensure existing tests continue to pass
- Add integration tests for new MCP tools
- Test with actual Duo API collections

## 🛠️ Common Contribution Areas

### 1. New MCP Tools
When adding new tools:
- Follow the existing tool pattern in `src/index.ts`
- Add proper parameter validation with Zod schemas
- Include comprehensive error handling
- Update documentation in README.md

Example tool structure:
```typescript
server.tool(
  "tool-name",
  "Description of what the tool does",
  {
    parameter: z.string().describe("Parameter description")
  },
  async ({ parameter }) => {
    // Implementation
    return {
      content: [{ type: "text", text: "Result" }]
    };
  }
);
```

### 2. Authentication Improvements
- Enhance Duo API authentication logic
- Add support for new authentication methods
- Improve error messages and debugging

### 3. Collection Support
- Add support for additional Postman collection features
- Improve collection parsing and validation
- Enhance variable resolution

### 4. Documentation
- Update README.md for new features
- Add troubleshooting guides
- Create example usage scenarios
- Improve setup instructions

## 🧪 Testing Guidelines

### Manual Testing
```bash
# Build and test basic functionality
npm run build
npm run dev

# Test with Claude Desktop integration
# Add test collections and environments
# Verify all tools work correctly
```

### API Testing
- Test with real Duo API credentials when possible
- Validate authentication works correctly
- Test error handling with invalid credentials
- Verify all supported collection formats

## 📚 Documentation Updates

When updating documentation:
- Keep README.md up to date with new features
- Update tool descriptions and parameters
- Add troubleshooting sections for new issues
- Include examples for new functionality

## 🐛 Bug Reports

When reporting bugs:
- Use the issue template (if available)
- Include steps to reproduce
- Provide relevant log output
- Specify environment details (Node.js version, OS, etc.)
- Include collection/environment files if relevant (remove sensitive data)

## 💡 Feature Requests

For new features:
- Clearly describe the use case
- Explain the expected behavior
- Consider backward compatibility
- Discuss implementation approach if applicable

## 🔒 Security Considerations

- Never commit real API credentials
- Use template files for credential examples
- Validate input parameters properly
- Handle sensitive data appropriately
- Report security issues privately

## 📋 Pull Request Process

1. **Update documentation** for any user-facing changes
2. **Add or update tests** as needed
3. **Ensure all tests pass** and code builds successfully
4. **Update CHANGELOG.md** (if it exists) with your changes
5. **Request review** from maintainers

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Tested manually
- [ ] Added/updated tests
- [ ] Tested with real Duo APIs

## Documentation
- [ ] Updated README.md
- [ ] Updated tool descriptions
- [ ] Added troubleshooting info
```

## 🎯 Release Process

For maintainers:
1. Update version in package.json
2. Update CHANGELOG.md
3. Create release tag
4. Update documentation as needed

## 📞 Getting Help

- Check existing issues and documentation first
- Create an issue for questions or problems
- Be specific about your environment and use case
- Include relevant configuration (without sensitive data)

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (ISC License).

Thank you for contributing! 🎉
