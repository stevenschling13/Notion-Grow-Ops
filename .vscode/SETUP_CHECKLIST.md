# 📋 First-Time Setup Checklist

Use this checklist when setting up the Notion-Grow-Ops repository for the first time.

## Prerequisites ✓
- [ ] Visual Studio Code installed
- [ ] Node.js v20+ installed
- [ ] pnpm package manager installed (`npm install -g pnpm`)
- [ ] GitHub account with Copilot access
- [ ] Git configured on your machine

## Initial Setup ✓

### 1. Clone and Open Project
- [ ] Clone repository: `git clone https://github.com/stevenschling13/Notion-Grow-Ops.git`
- [ ] Open in VS Code: `code Notion-Grow-Ops`

### 2. Install Extensions
- [ ] Click "Install" when VS Code prompts for recommended extensions
- [ ] OR manually install from Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`):
  - [ ] GitHub Copilot
  - [ ] GitHub Copilot Chat
  - [ ] ESLint
  - [ ] Prettier
  - [ ] TypeScript
  - [ ] GitHub Pull Requests

### 3. GitHub Copilot Setup
- [ ] Click the Copilot icon in the status bar (bottom right)
- [ ] Sign in to GitHub when prompted
- [ ] Authorize VS Code to access Copilot
- [ ] Verify Copilot icon shows as active (not disabled)

### 4. Install Project Dependencies
- [ ] Open integrated terminal (`Ctrl+`` or `Cmd+``)
- [ ] Run: `pnpm install`
- [ ] Wait for installation to complete

### 5. Verify Setup
- [ ] Build project: `pnpm run build`
- [ ] Run linter: `pnpm run lint`
- [ ] Run type check: `pnpm run typecheck`
- [ ] Run tests: `pnpm test`

### 6. Test Copilot Features

#### Test Inline Suggestions
- [ ] Open `src/index.ts`
- [ ] Start typing a comment like `// function to calculate`
- [ ] Verify Copilot shows suggestions (gray text)
- [ ] Press `Tab` to accept a suggestion

#### Test Copilot Chat
- [ ] Press `Ctrl+Alt+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
- [ ] Type a question like "What does this project do?"
- [ ] Verify you get a response

#### Test Debugging
- [ ] Press `Ctrl+Shift+D` (Windows/Linux) or `Cmd+Shift+D` (Mac)
- [ ] Select "Debug Server (tsx)" from dropdown
- [ ] Press `F5` to start debugging
- [ ] Verify server starts without errors
- [ ] Press `Shift+F5` to stop

## Optional: Advanced Features ✓

### GitHub Mobile (Optional)
- [ ] Download GitHub Mobile from app store
- [ ] Sign in to GitHub
- [ ] Test Copilot chat on mobile

### Copilot CLI (Optional)
- [ ] Install GitHub CLI: https://cli.github.com/
- [ ] Run: `gh extension install github/gh-copilot`
- [ ] Test: `gh copilot suggest "list files"`

### VS Code Settings Sync (Optional)
- [ ] Enable Settings Sync in VS Code
- [ ] Sign in with GitHub/Microsoft account
- [ ] Select settings to sync

## Troubleshooting ✓

If you encounter issues:

### Copilot Not Working
- [ ] Check status bar - click Copilot icon
- [ ] Verify subscription: https://github.com/settings/copilot
- [ ] Reload window: `Ctrl+Shift+P` → "Developer: Reload Window"
- [ ] Sign out and sign in again

### Build Errors
- [ ] Delete `node_modules`: `rm -rf node_modules`
- [ ] Delete `dist`: `rm -rf dist`
- [ ] Reinstall: `pnpm install`
- [ ] Rebuild: `pnpm run build`

### TypeScript Errors
- [ ] Restart TS Server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
- [ ] Check TypeScript version: `pnpm list typescript`
- [ ] Verify workspace TypeScript is being used (status bar)

### ESLint Not Working
- [ ] Check ESLint output: View → Output → ESLint
- [ ] Restart ESLint server: `Ctrl+Shift+P` → "ESLint: Restart ESLint Server"
- [ ] Verify `.eslintrc.json` exists

## 🎉 Setup Complete!

Once all items are checked:
- [ ] Read [VSCODE_SETUP.md](../VSCODE_SETUP.md) for detailed feature guide
- [ ] Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for shortcuts
- [ ] Review [README.md](../README.md) for project overview
- [ ] Start coding with AI assistance! 🚀

## Need Help?

- Documentation: [VSCODE_SETUP.md](../VSCODE_SETUP.md)
- Quick Reference: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- GitHub Copilot Docs: https://docs.github.com/en/copilot
- VS Code Docs: https://code.visualstudio.com/docs

---

**Pro Tip:** Save this file to track your progress. Mark items as you complete them!
