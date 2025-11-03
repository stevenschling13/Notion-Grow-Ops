# Contributing to Notion-Grow-Ops

Thank you for your interest in contributing to Notion-Grow-Ops! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to uphold. Please be respectful and constructive in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Notion-Grow-Ops.git
   cd Notion-Grow-Ops
   ```
3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/stevenschling13/Notion-Grow-Ops.git
   ```

## Development Setup

1. **Install Node.js** >= 20
2. **Install pnpm**:
   ```bash
   npm install -g pnpm@^9.0.0
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Create a `.env` file**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
5. **Start the development server**:
   ```bash
   pnpm run dev
   ```

### Optional: Install GitHub Copilot CLI (Recommended)

The GitHub Copilot CLI brings AI-powered assistance directly to your terminal, helping with commands, explanations, and code suggestions.

```bash
# Install GitHub Copilot CLI globally
npm install -g @github/copilot

# Authenticate (you'll need a GitHub account with Copilot access)
copilot auth

# Usage examples:
copilot explain "git rebase -i HEAD~3"
copilot suggest "how do I run tests in watch mode"
```

**Benefits:**
- Get command suggestions and explanations
- Quickly understand complex commands
- Improve productivity with AI-powered terminal assistance

For more information, visit: https://githubnext.com/projects/copilot-cli

## Making Changes

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** following the coding standards below
3. **Test your changes**:
   ```bash
   pnpm test -- --run
   pnpm run lint
   pnpm run typecheck
   pnpm run build
   ```
4. **Commit your changes** using conventional commit messages (see below)

## Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Add tests** for new features or bug fixes
3. **Ensure all tests pass**:
   ```bash
   pnpm test -- --run
   pnpm run lint
   pnpm run typecheck
   pnpm run build
   ```
4. **Update the CHANGELOG.md** with details of your changes
5. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request** against the `main` branch
7. **Respond to review feedback** and update your PR as needed

### Pull Request Requirements

- Clear description of the changes and why they're needed
- All tests must pass
- Code must pass linting and type checking
- New features must include tests
- Documentation must be updated for user-facing changes
- Commits must follow the conventional commit format

## Coding Standards

### TypeScript

- Use **TypeScript strict mode** (already enabled in `tsconfig.json`)
- Prefer **type inference** where possible
- Use **explicit types** for function parameters and return values
- Use **const** for variables that don't change
- Use **async/await** instead of promises with `.then()`

### Code Style

- Follow the **ESLint** configuration
- Use **ES Modules** syntax (`import/export`)
- Include `.js` extension in imports for ESM compatibility
- **2 spaces** for indentation
- **No semicolons** (enforced by linter)
- **Single quotes** for strings
- Use **meaningful variable names**

### File Organization

- Keep files **focused and small**
- Group related functionality together
- Use **kebab-case** for file names
- Place tests in the `test/` directory with `.test.ts` extension

### Security

- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user input with Zod schemas
- Use HMAC verification for webhooks
- Keep dependencies up to date

## Testing Guidelines

### Test Structure

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("Feature name", () => {
  beforeAll(async () => {
    // Setup code
  });

  afterAll(async () => {
    // Cleanup code
  });

  it("should do something specific", () => {
    // Test code
    expect(result).toBe(expected);
  });
});
```

### Test Coverage

- Aim for **>60% code coverage**
- Write tests for:
  - All new features
  - Bug fixes
  - Edge cases
  - Error handling
  - Integration points

### Test Types

1. **Unit Tests**: Test individual functions in isolation
2. **Integration Tests**: Test API endpoints and data flow
3. **Validation Tests**: Test Zod schemas

### Running Tests

```bash
# Run all tests in watch mode
pnpm test

# Run tests once (for CI)
pnpm test -- --run

# Run specific test file
pnpm test test/mapping.test.ts

# Run with coverage
pnpm test -- --coverage
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `perf`: Performance improvements

### Examples

```
feat(analyze): add support for new photo angles

Add support for "close-up" and "under-canopy" photo angles
in the analyze endpoint.

Closes #123
```

```
fix(hmac): use timing-safe comparison for signature verification

Replace simple string comparison with timingSafeEqual to prevent
timing attacks.
```

```
docs: update README with rate limiting examples

Add examples showing how to use the rate limit bypass token.
```

### Scope

The scope should be the name of the module or area affected:
- `analyze`: Analysis route
- `payload`: Payload schemas
- `mapping`: Data mapping functions
- `server`: Server configuration
- `hmac`: HMAC verification
- `ci`: CI/CD workflows

### Subject

- Use imperative mood ("add" not "added")
- Don't capitalize first letter
- No period at the end
- Limit to 50 characters

### Body

- Wrap at 72 characters
- Explain **what** and **why**, not **how**
- Reference issues and PRs

## Questions?

If you have questions about contributing, please open an issue or reach out to the maintainers.

## License

By contributing to Notion-Grow-Ops, you agree that your contributions will be licensed under the same license as the project.
