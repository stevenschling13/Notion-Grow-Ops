# Visual Studio Code Setup for Notion-Grow-Ops

This repository is configured for optimal development with Visual Studio Code and GitHub Copilot.

## Prerequisites

- [Visual Studio Code](https://code.visualstudio.com/) (latest version)
- [Node.js](https://nodejs.org/) v20 or higher
- [pnpm](https://pnpm.io/) package manager
- GitHub account with Copilot access

## Getting Started

1. **Open the project in VS Code:**
   ```bash
   code ./Notion-Grow-Ops
   ```

2. **Install recommended extensions:**
   When you open the project, VS Code will prompt you to install recommended extensions. Click "Install All" or install them individually:
   
   - **GitHub Copilot** (`github.copilot`) - AI pair programmer
   - **GitHub Copilot Chat** (`github.copilot-chat`) - Chat interface for Copilot
   - **ESLint** (`dbaeumer.vscode-eslint`) - JavaScript/TypeScript linting
   - **Prettier** (`esbenp.prettier-vscode`) - Code formatting
   - **TypeScript** (`ms-vscode.vscode-typescript-next`) - Enhanced TypeScript support
   - **GitHub Pull Requests** (`github.vscode-pull-request-github`) - GitHub integration

3. **Install dependencies:**
   ```bash
   pnpm install
   ```

## GitHub Copilot Features

### 1. Copilot in Your IDE

Once the GitHub Copilot extension is installed and you're signed in:

- **Inline suggestions**: As you type, Copilot will suggest code completions. Press `Tab` to accept.
- **Alternative suggestions**: Press `Alt+]` (Windows/Linux) or `Option+]` (Mac) to cycle through suggestions.
- **Manual trigger**: Press `Alt+\` (Windows/Linux) or `Option+\` (Mac) to manually trigger suggestions.

### 2. Copilot Chat

Access Copilot Chat in several ways:

- **Chat Panel**: Click the chat icon in the activity bar or press `Ctrl+Alt+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
- **Inline Chat**: Press `Ctrl+I` (Windows/Linux) or `Cmd+I` (Mac) to open chat inline in your editor
- **Quick Chat**: Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Shift+I` (Mac) for a quick chat dropdown

**Useful Chat Commands:**
- `/explain` - Explain selected code
- `/fix` - Suggest fixes for problems
- `/tests` - Generate tests
- `/help` - Get help with Copilot

### 3. Chat in GitHub Mobile

To use Copilot on mobile:

1. Download the **GitHub Mobile** app from your app store
2. Sign in with your GitHub account
3. Navigate to any repository, issue, or pull request
4. Tap the Copilot icon to start a chat session
5. Ask questions about code, get explanations, or request suggestions

### 4. Copilot CLI

Install and use Copilot in your terminal:

```bash
# Install GitHub CLI if you haven't already
# Visit: https://cli.github.com/

# Install Copilot CLI extension
gh extension install github/gh-copilot

# Use Copilot to suggest commands
gh copilot suggest "install dependencies with pnpm"

# Use Copilot to explain commands
gh copilot explain "pnpm install --frozen-lockfile"
```

**Common CLI Commands:**
- `gh copilot suggest` - Get command suggestions
- `gh copilot explain` - Explain a command

### 5. More Copilot Features

- **Copilot Labs**: Install `github.copilot-labs` for experimental features
- **Code Review**: Use Copilot Chat to review code changes before committing
- **Documentation**: Ask Copilot to generate documentation for your functions
- **Refactoring**: Request code refactoring suggestions through chat
- **Test Generation**: Use `/tests` command to generate unit tests

## Development Workflow

### Building and Running

- **Build**: Press `Ctrl+Shift+B` (Windows/Linux) or `Cmd+Shift+B` (Mac), or run:
  ```bash
  pnpm run build
  ```

- **Development mode with watch**:
  ```bash
  pnpm run dev
  ```

- **Start the server**:
  ```bash
  pnpm start
  ```

### Testing

- **Run tests**: Press `Ctrl+Shift+T` (Windows/Linux) or `Cmd+Shift+T` (Mac), or run:
  ```bash
  pnpm test
  ```

### Linting and Type Checking

- **Lint**: Run from Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) → "Tasks: Run Task" → "npm: lint"
  ```bash
  pnpm run lint
  ```

- **Type check**:
  ```bash
  pnpm run typecheck
  ```

### Debugging

1. Open the Debug panel (`Ctrl+Shift+D` / `Cmd+Shift+D`)
2. Select a debug configuration:
   - **Debug Server**: Debug the compiled JavaScript
   - **Debug Server (tsx)**: Debug TypeScript directly with tsx
   - **Debug Tests**: Debug test files
3. Press `F5` to start debugging
4. Set breakpoints by clicking in the gutter next to line numbers

## Tips for Using Copilot Effectively

1. **Write clear comments**: Copilot uses comments as context for suggestions
2. **Use descriptive names**: Function and variable names help Copilot understand intent
3. **Be specific in chat**: When asking questions, provide context and be specific
4. **Review suggestions**: Always review and test Copilot's suggestions
5. **Use slash commands**: Leverage chat commands like `/explain`, `/fix`, `/tests`
6. **Select code before asking**: Select relevant code before using Copilot Chat for better context

## Keyboard Shortcuts Reference

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Accept suggestion | `Tab` | `Tab` |
| Next suggestion | `Alt+]` | `Option+]` |
| Previous suggestion | `Alt+[` | `Option+[` |
| Trigger suggestion | `Alt+\` | `Option+\` |
| Open Chat | `Ctrl+Alt+I` | `Cmd+Option+I` |
| Inline Chat | `Ctrl+I` | `Cmd+I` |
| Quick Chat | `Ctrl+Shift+I` | `Cmd+Shift+I` |
| Command Palette | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| Debug | `F5` | `F5` |
| Toggle Breakpoint | `F9` | `F9` |

## Troubleshooting

### Copilot not working?

1. Check you're signed in: Click the Copilot icon in the status bar
2. Verify your subscription: Visit [GitHub Copilot settings](https://github.com/settings/copilot)
3. Reload VS Code: Press `Ctrl+Shift+P` / `Cmd+Shift+P` → "Developer: Reload Window"

### Extensions not installing?

- Open Extensions view: `Ctrl+Shift+X` / `Cmd+Shift+X`
- Search for extension by ID (e.g., `github.copilot`)
- Click Install

### TypeScript errors?

- Ensure dependencies are installed: `pnpm install`
- Restart TypeScript server: Press `Ctrl+Shift+P` / `Cmd+Shift+P` → "TypeScript: Restart TS Server"

## Additional Resources

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [VS Code Documentation](https://code.visualstudio.com/docs)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Copilot CLI Reference](https://docs.github.com/en/copilot/github-copilot-in-the-cli)

## Project Structure

```
Notion-Grow-Ops/
├── .vscode/              # VS Code configuration
│   ├── extensions.json   # Recommended extensions
│   ├── settings.json     # Workspace settings
│   ├── launch.json       # Debug configurations
│   └── tasks.json        # Build tasks
├── src/                  # Source code
│   ├── domain/           # Domain logic
│   ├── routes/           # API routes
│   ├── index.ts          # Application entry point
│   └── server.ts         # Server configuration
├── dist/                 # Compiled output (generated)
├── node_modules/         # Dependencies (generated)
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
└── .eslintrc.json        # ESLint configuration
```

## Contributing

When contributing to this project:

1. Use the linter and formatter (automatically on save)
2. Run tests before committing
3. Use Copilot Chat to help write tests and documentation
4. Follow the existing code style
5. Add comments for complex logic

---

**Happy coding with GitHub Copilot! 🚀**
