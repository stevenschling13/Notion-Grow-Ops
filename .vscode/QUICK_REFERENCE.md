# 🚀 Quick Reference: VS Code + GitHub Copilot

## 📦 Installed Extensions
```
✓ GitHub Copilot              (AI pair programmer)
✓ GitHub Copilot Chat          (Chat interface)
✓ ESLint                       (Code linting)
✓ Prettier                     (Code formatting)
✓ TypeScript                   (Enhanced TS support)
✓ GitHub Pull Requests         (PR integration)
```

## ⌨️ Essential Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Accept Copilot suggestion | `Tab` | `Tab` |
| Next suggestion | `Alt+]` | `Option+]` |
| Trigger suggestion | `Alt+\` | `Option+\` |
| Open Copilot Chat | `Ctrl+Alt+I` | `Cmd+Option+I` |
| Inline Chat | `Ctrl+I` | `Cmd+I` |
| Quick Chat | `Ctrl+Shift+I` | `Cmd+Shift+I` |
| Build | `Ctrl+Shift+B` | `Cmd+Shift+B` |
| Debug | `F5` | `F5` |
| Run Tests | `Ctrl+Shift+T` | `Cmd+Shift+T` |

## 💬 Copilot Chat Commands

- `/explain` - Explain selected code
- `/fix` - Suggest fixes for problems  
- `/tests` - Generate unit tests
- `/help` - Get help with Copilot
- `/doc` - Generate documentation

## 🐛 Debug Configurations

1. **Debug Server** - Debug compiled JavaScript
2. **Debug Server (tsx)** - Debug TypeScript directly
3. **Debug Tests** - Debug Vitest tests

Press `F5` to start debugging with selected configuration.

## 🔨 Available Tasks

Run tasks with `Ctrl+Shift+P` → "Tasks: Run Task":

- **npm: build** - Compile TypeScript
- **npm: dev** - Watch mode with hot reload
- **npm: lint** - Run ESLint
- **npm: typecheck** - TypeScript validation
- **npm: test** - Run Vitest tests

## 🌐 GitHub Mobile Setup

1. Download GitHub Mobile app
2. Sign in with your GitHub account
3. Navigate to repository/issue/PR
4. Tap Copilot icon to chat

## 💻 Copilot CLI

```bash
# Install (requires GitHub CLI)
gh extension install github/gh-copilot

# Suggest commands
gh copilot suggest "install dependencies"

# Explain commands  
gh copilot explain "pnpm install"
```

## 📚 Documentation

- **README.md** - Project overview
- **VSCODE_SETUP.md** - Complete setup guide (7.5KB)
- **SETUP_SUMMARY.md** - Feature summary

## ✨ Tips

1. Write descriptive comments for better suggestions
2. Use meaningful variable/function names
3. Select code before asking Copilot Chat
4. Review all AI suggestions before accepting
5. Use slash commands in chat for specific tasks

---

**Need help?** See [VSCODE_SETUP.md](./VSCODE_SETUP.md) for detailed instructions.
