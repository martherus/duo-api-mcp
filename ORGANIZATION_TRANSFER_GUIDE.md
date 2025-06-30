# 🏢 Transferring Repository to cisco-sbg Organization

## Current Situation
- Repository: `martherus/duo-api-mcp`
- Target: `cisco-sbg/duo-api-mcp`
- Issue: Insufficient permissions for direct transfer/creation

## 🔑 Required Steps

### Option 1: Request Organization Admin to Create Repository
Contact a cisco-sbg organization administrator to:

1. **Create the repository** in cisco-sbg organization:
   ```bash
   gh repo create cisco-sbg/duo-api-mcp --public --description "MCP (Model Context Protocol) server for Duo Security APIs, providing secure access to Duo Admin, Auth, and Accounts APIs through standardized tools."
   ```

2. **Add you as collaborator** with admin permissions

3. **You can then push** your existing code:
   ```bash
   git remote set-url origin https://github.com/cisco-sbg/duo-api-mcp.git
   git push -u origin main
   ```

### Option 2: Request Repository Transfer
Ask a cisco-sbg organization admin to:

1. **Accept transfer** from your personal account
2. **Navigate** to Settings → General → Danger Zone → Transfer Repository
3. **Enter** cisco-sbg as the new owner
4. **Confirm** the transfer

### Option 3: Organization Admin Creates and You Migrate
If admins prefer to create fresh:

1. **Admin creates** `cisco-sbg/duo-api-mcp`
2. **Admin adds you** as collaborator
3. **You migrate** the code:
   ```bash
   # Add new remote
   git remote add cisco https://github.com/cisco-sbg/duo-api-mcp.git
   
   # Push to new remote
   git push cisco main
   
   # Update origin
   git remote set-url origin https://github.com/cisco-sbg/duo-api-mcp.git
   ```

## 📋 Information for Organization Admin

### Repository Details
- **Name**: `duo-api-mcp`
- **Description**: MCP (Model Context Protocol) server for Duo Security APIs, providing secure access to Duo Admin, Auth, and Accounts APIs through standardized tools.
- **Visibility**: Public (recommended) or Private
- **Current URL**: https://github.com/martherus/duo-api-mcp

### Repository Features
- ✅ Comprehensive documentation (README, CONTRIBUTING, CHANGELOG)
- ✅ Security-first design (credentials templated, never committed)
- ✅ Professional Git history with meaningful commits
- ✅ Production-ready with deployment guides
- ✅ TypeScript/Node.js project with proper configuration

### Benefits for cisco-sbg
- **Duo Integration**: Direct API access for Cisco security tools
- **MCP Protocol**: Modern AI/LLM integration capabilities
- **Enterprise Ready**: Security, documentation, and deployment standards
- **Open Source**: Community contributions and transparency

## 🔍 Current Repository Status

```bash
# Repository details
Name: duo-api-mcp
Owner: martherus
URL: https://github.com/martherus/duo-api-mcp
Branch: main
Commits: 2 comprehensive commits
Files: 35+ files with complete documentation

# What's included
✅ Source code (TypeScript MCP server)
✅ Documentation (README, CONTRIBUTING, CHANGELOG)
✅ Configuration (package.json, tsconfig.json, .gitignore)
✅ Collections (Duo API Postman collections)
✅ Environment templates (secure credential setup)
✅ Setup scripts (automated configuration)
✅ Examples and usage guides
```

## 📞 Next Steps

1. **Contact cisco-sbg admin** with this information
2. **Choose preferred option** from above
3. **Coordinate transfer/creation** process
4. **Update documentation** with new repository URL
5. **Notify stakeholders** of new location

## 🔄 Post-Transfer Updates Needed

Once the repository is in cisco-sbg:

### Update Documentation
- [ ] README.md clone URLs
- [ ] CONTRIBUTING.md repository references  
- [ ] Setup scripts repository URLs
- [ ] Examples and guides

### Update Remote References
```bash
# Update your local repository
git remote set-url origin https://github.com/cisco-sbg/duo-api-mcp.git

# Update any CI/CD or deployment configs
# Update any documentation references
```

### Cleanup
- [ ] Archive or delete `martherus/duo-api-mcp` (after transfer)
- [ ] Update any bookmarks or documentation
- [ ] Notify users of new repository location

---

**Contact your cisco-sbg organization administrator to proceed with the repository transfer.**
