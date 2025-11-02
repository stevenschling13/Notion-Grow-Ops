# Contributing to Notion-Grow-Ops

Thank you for your interest in contributing to Notion-Grow-Ops! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Requirements](#testing-requirements)
- [Commit Message Conventions](#commit-message-conventions)

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow:

- Be respectful and inclusive
- Focus on constructive feedback
- Accept differing viewpoints gracefully
- Prioritize the community's best interests

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20 or higher
- **pnpm**: Version 9 or higher
- **Git**: Latest stable version

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Notion-Grow-Ops.git
   cd Notion-Grow-Ops
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/stevenschling13/Notion-Grow-Ops.git
   ```

4. **Install dependencies**
   ```bash
   pnpm install
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. **Verify setup**
   ```bash
   pnpm run build
   pnpm run lint
   pnpm run typecheck
   pnpm test -- --run
   ```

## Development Workflow

### Creating a Feature Branch

Always create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `test/` - Test additions or modifications
- `refactor/` - Code refactoring
- `chore/` - Maintenance tasks

### Development Process

1. **Make your changes**
   - Write clear, self-documenting code
   - Follow the code style guidelines
   - Add/update tests as needed
   - Update documentation if required

2. **Run tests frequently**
   ```bash
   pnpm test
   ```

3. **Check code quality**
   ```bash
   pnpm run lint
   pnpm run typecheck
   ```

4. **Build to verify**
   ```bash
   pnpm run build
   ```

### Keeping Your Fork Updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## Pull Request Process

### Before Submitting

Ensure all of the following pass:

```bash
# Build successfully
pnpm run build

# Pass linting
pnpm run lint

# Pass type checking
pnpm run typecheck

# All tests pass
pnpm test -- --run
```

### Submitting a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request on GitHub**
   - Use a clear, descriptive title
   - Fill out the PR template completely
   - Link any related issues
   - Add screenshots/videos for UI changes

3. **PR Title Format**
   ```
   type: brief description
   ```
   Examples:
   - `feat: add support for custom AI models`
   - `fix: resolve HMAC signature validation issue`
   - `docs: update API endpoint documentation`

4. **PR Description Should Include**
   - Summary of changes
   - Motivation and context
   - Testing performed
   - Breaking changes (if any)
   - Related issues

### Review Process

- At least one maintainer approval is required
- All CI checks must pass
- Address all review comments
- Keep your branch up to date with main

### After Approval

Once approved and all checks pass, a maintainer will merge your PR.

## Code Style Guidelines

### TypeScript

- **Strict Mode**: All TypeScript strict checks are enabled
- **Type Safety**: Avoid `any` type; use proper types or `unknown`
- **ESM**: Use ES modules syntax (`import`/`export`)
- **File Extensions**: Include `.js` extension in imports for ESM compatibility

### Naming Conventions

- **Files**: kebab-case
  - `analyze.ts`, `payload.ts`, `mapping.ts`
  
- **Functions**: camelCase
  - `buildServer()`, `mapWritebacksToPhotos()`
  
- **Types/Interfaces**: PascalCase
  - `AnalyzeRequest`, `Writebacks`
  
- **Constants**: SCREAMING_SNAKE_CASE
  - `HMAC_SECRET`, `MAX_REQUESTS`

### Code Organization

- **One export per file**: Main exports should match file names
- **Clear separation**: Keep routes, domain logic, and utilities separate
- **Async/await**: Use async/await for asynchronous operations
- **Error handling**: Use try/catch blocks and proper error responses

### Comments

- Add JSDoc comments for public functions
- Explain complex logic with inline comments
- Don't state the obvious
- Keep comments up to date with code changes

Example:
```typescript
/**
 * Maps AI analysis writebacks to Notion photo database properties.
 * 
 * @param wb - Writebacks from AI analysis containing plant health metrics
 * @returns Object with Notion property names mapped to their values
 */
export function mapWritebacksToPhotos(wb: Writebacks): Record<string, unknown> {
  // Implementation
}
```

### Logging

- Use Fastify's built-in logger
- Never use `console.log()` in production code
- Log at appropriate levels (info, warn, error)

## Testing Requirements

### Test Coverage

- All new features must include tests
- Bug fixes should include regression tests
- Aim for meaningful test coverage, not just high percentages
- Test edge cases and error conditions

### Test Structure

Follow the existing test patterns:

```typescript
import { describe, it, expect } from "vitest";

describe("Feature Name", () => {
  describe("specific functionality", () => {
    it("should do something specific", () => {
      // Arrange
      const input = createInput();
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### Running Tests

```bash
# Watch mode (for development)
pnpm test

# Run once (for CI)
pnpm test -- --run

# Run specific test file
pnpm test test/mapping.test.ts
```

## Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
type(scope): subject

body

footer
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test additions or modifications
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```
feat: add rate limiting to API endpoints

Implement rate limiting using @fastify/rate-limit to prevent
abuse. Configured for 100 requests per minute per IP address.

Closes #123
```

```
fix: resolve HMAC signature validation timing attack

Use timingSafeEqual for constant-time comparison to prevent
timing-based attacks on signature verification.
```

```
docs: update README with deployment instructions

Add comprehensive deployment section including Docker setup
and environment configuration.
```

### Commit Best Practices

- Keep commits atomic and focused
- Write clear, descriptive commit messages
- Reference issue numbers when applicable
- Separate subject from body with blank line
- Limit subject line to 72 characters
- Use imperative mood ("add" not "added")

## Questions?

If you have questions about contributing:

1. Check existing [Issues](https://github.com/stevenschling13/Notion-Grow-Ops/issues)
2. Open a new issue with the "question" label
3. Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
