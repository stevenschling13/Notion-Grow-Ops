# Notion-Grow-Ops

A TypeScript-based API service built with Fastify for Notion integration and growth operations.

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or higher
- [pnpm](https://pnpm.io/) package manager

### Installation

```bash
# Install dependencies
pnpm install

# Build the project
pnpm run build

# Start the server
pnpm start
```

### Development

```bash
# Run in development mode with hot reload
pnpm run dev

# Run tests
pnpm test

# Run linter
pnpm run lint

# Type check
pnpm run typecheck
```

## 💻 IDE Setup

### Visual Studio Code (Recommended)

This project is optimized for VS Code with GitHub Copilot. See **[VSCODE_SETUP.md](./VSCODE_SETUP.md)** for:

- Complete VS Code configuration
- GitHub Copilot setup and features
- Copilot Chat usage
- GitHub Mobile integration  
- Copilot CLI setup
- Debugging guide
- Keyboard shortcuts
- Troubleshooting tips

**Quick setup:**
1. Open the project in VS Code
2. Install recommended extensions when prompted
3. Sign in to GitHub Copilot
4. Start coding with AI assistance!

## 📁 Project Structure

```
Notion-Grow-Ops/
├── src/
│   ├── domain/       # Domain logic and models
│   ├── routes/       # API route handlers
│   ├── index.ts      # Application entry point
│   └── server.ts     # Server configuration
├── dist/             # Compiled JavaScript (generated)
├── .vscode/          # VS Code configuration
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── .eslintrc.json    # ESLint rules
```

## 🛠️ Technology Stack

- **Runtime**: Node.js v20+
- **Language**: TypeScript
- **Framework**: Fastify
- **Testing**: Vitest
- **Linting**: ESLint with TypeScript support
- **Package Manager**: pnpm

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm run dev` | Start development server with hot reload |
| `pnpm run build` | Compile TypeScript to JavaScript |
| `pnpm start` | Start production server |
| `pnpm run lint` | Run ESLint |
| `pnpm run typecheck` | Type check without emitting files |
| `pnpm test` | Run tests with Vitest |

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=8080
# Add other environment variables as needed
```

### TypeScript

Configuration is in `tsconfig.json`. The project uses:
- ES2020 target
- NodeNext module resolution
- Strict mode enabled

### ESLint

Linting rules are defined in `.eslintrc.json` with TypeScript support.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- All tests pass (`pnpm test`)
- Code is linted (`pnpm run lint`)
- TypeScript compiles without errors (`pnpm run build`)

## 📄 License

This project is private and proprietary.

## 🆘 Support

For issues, questions, or contributions, please open an issue in the GitHub repository.

---

**Built with ❤️ using TypeScript, Fastify, and GitHub Copilot**
