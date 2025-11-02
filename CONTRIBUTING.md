# Contributing to Notion-Grow-Ops

Thank you for your interest in contributing to Notion-Grow-Ops! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## 📜 Code of Conduct

By participating in this project, you agree to:
- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.x
- pnpm >= 9.x
- Git

### Setup Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Notion-Grow-Ops.git
   cd Notion-Grow-Ops
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/stevenschling13/Notion-Grow-Ops.git
   ```

4. **Install dependencies:**
   ```bash
   pnpm install
   ```

5. **Create `.env` file:**
   ```bash
   cp .env.example .env
   # Edit .env and set HMAC_SECRET
   ```

6. **Verify setup:**
   ```bash
   pnpm run build
   pnpm test -- --run
   ```

## 🔄 Development Workflow

### 1. Create a Feature Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/fixes
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write code following our [Code Standards](#code-standards)
- Add tests for new functionality
- Update documentation as needed
- Keep commits focused and atomic

### 3. Run Quality Checks

Before committing, ensure all checks pass:

```bash
# Type checking
pnpm run typecheck

# Linting
pnpm run lint

# Tests
pnpm test -- --run

# Build
pnpm run build
```

### 4. Commit Your Changes

Follow our [Commit Guidelines](#commit-guidelines)

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub following our [PR Process](#pull-request-process)

## 📏 Code Standards

### TypeScript Guidelines

1. **Use Strict Mode**: All TypeScript strict checks must pass
   ```typescript
   // tsconfig.json has strict: true
   ```

2. **No `any` Type**: Use proper types or `unknown`
   ```typescript
   // ❌ Bad
   function process(data: any) { }
   
   // ✅ Good
   function process(data: unknown) { }
   ```

3. **Explicit Return Types**: Always specify return types for functions
   ```typescript
   // ❌ Bad
   function calculate() {
     return 42;
   }
   
   // ✅ Good
   function calculate(): number {
     return 42;
   }
   ```

4. **Use Zod for Runtime Validation**: Validate external data
   ```typescript
   import { z } from 'zod';
   
   const schema = z.object({
     name: z.string(),
     age: z.number(),
   });
   ```

### Code Style

- **Formatting**: Use TypeScript/ESLint auto-formatting
- **Imports**: Use `.js` extension for local imports (ESM requirement)
  ```typescript
  import { buildServer } from "./server.js";  // ✅ Good
  import { buildServer } from "./server";     // ❌ Bad
  ```
- **Naming Conventions**:
  - Files: `kebab-case.ts`
  - Functions/Variables: `camelCase`
  - Types/Interfaces: `PascalCase`
  - Constants: `SCREAMING_SNAKE_CASE`

### Logging

- Use Fastify's built-in logger
- Never use `console.log()` in production code
```typescript
// ❌ Bad
console.log('Processing request');

// ✅ Good
app.log.info('Processing request');
```

### Error Handling

- Always handle errors explicitly
- Provide meaningful error messages
```typescript
try {
  await processData();
} catch (error) {
  app.log.error({ error }, 'Failed to process data');
  throw new Error('Data processing failed');
}
```

## 🧪 Testing Requirements

### Writing Tests

1. **Test Location**: Tests go in `test/` directory
2. **Test Framework**: Vitest
3. **Naming**: `*.test.ts` suffix
4. **Coverage**: Aim for 80%+ coverage on new code

### Test Structure

```typescript
import { describe, it, expect, beforeAll } from 'vitest';

describe('Feature Name', () => {
  beforeAll(() => {
    // Setup
  });

  it('should behave correctly', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = process(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Running Tests

```bash
# Watch mode
pnpm test

# Single run
pnpm test -- --run

# With coverage
pnpm test -- --coverage
```

### Test Requirements for PRs

- All tests must pass
- New features require tests
- Bug fixes should include regression tests
- No decrease in overall coverage percentage

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring (no functional changes)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, CI, etc.)

### Examples

```
feat(analyze): add support for multiple photo angles

Implement logic to handle top, side, and under-canopy angles
in photo analysis workflow.

Closes #123
```

```
fix(auth): correct HMAC timing comparison

Replace string comparison with timingSafeEqual to prevent
timing attacks.
```

### Commit Best Practices

- Use imperative mood ("add feature" not "added feature")
- First line should be 50 characters or less
- Reference issues and PRs in footer
- Keep commits atomic and focused

## 🔀 Pull Request Process

### Before Submitting

1. ✅ All tests pass
2. ✅ Code is linted
3. ✅ TypeScript compiles without errors
4. ✅ Documentation is updated
5. ✅ Commit messages follow guidelines

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Tests pass
- [ ] Linting passes
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

## Related Issues
Closes #123
```

### Review Process

1. **Automated Checks**: CI must pass
2. **Code Review**: At least one approval required
3. **Discussion**: Address reviewer feedback
4. **Merge**: Maintainer will merge when ready

### After Merge

- Delete your feature branch
- Update your local repository:
  ```bash
  git checkout main
  git pull upstream main
  ```

## 🐛 Issue Reporting

### Before Creating an Issue

1. Search existing issues for duplicates
2. Try the latest version
3. Collect relevant information (logs, environment, steps to reproduce)

### Issue Template

```markdown
## Description
Clear description of the issue

## Steps to Reproduce
1. Step one
2. Step two
3. ...

## Expected Behavior
What should happen?

## Actual Behavior
What actually happened?

## Environment
- Node.js version: 
- pnpm version:
- OS:

## Additional Context
Screenshots, logs, etc.
```

### Issue Labels

We use labels to categorize issues:
- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information requested

## 🎯 Areas We Need Help

Current priorities:
- Notion API integration implementation
- Vision AI provider integration
- Integration tests
- Performance optimization
- Documentation improvements

## 📚 Additional Resources

- [README.md](README.md) - Project overview
- [REPOSITORY_AUDIT.md](REPOSITORY_AUDIT.md) - Detailed audit report
- [GitHub Issues](https://github.com/stevenschling13/Notion-Grow-Ops/issues)

## ❓ Questions?

- Open a [GitHub Discussion](https://github.com/stevenschling13/Notion-Grow-Ops/discussions)
- Comment on an existing issue
- Reach out to maintainers

---

Thank you for contributing to Notion-Grow-Ops! 🌱
