# GitHub Copilot Instructions for Notion-Grow-Ops

## Project Overview

This is a TypeScript/Node.js application that provides a Fastify-based API server for analyzing grow operation photos and integrating with Notion. The application receives webhook requests, validates them using HMAC signatures, and processes plant photo analysis jobs.

## Repository Configuration

This repository is configured for optimal use with GitHub Copilot Coding Agent. When working on issues:

- Issues should be well-scoped with clear descriptions and acceptance criteria
- All changes must include appropriate tests unless test infrastructure doesn't exist
- Security is paramount - always validate HMAC signatures and never expose secrets
- Follow the minimal change principle - make the smallest changes necessary
- Always run build, lint, typecheck, and tests before completing work

## Tech Stack

- **Runtime**: Node.js >= 20
- **Language**: TypeScript 5.6+ with strict mode enabled
- **Web Framework**: Fastify 4.x
- **Validation**: Zod for schema validation
- **Testing**: Vitest
- **Linting**: ESLint with TypeScript support
- **Package Manager**: pnpm (version 9)
- **Module System**: ES Modules (type: "module")

## Project Structure

```
src/
├── index.ts          # Application entry point
├── server.ts         # Fastify server setup
├── routes/           # API route handlers
│   └── analyze.ts    # POST /analyze endpoint
└── domain/           # Business logic and schemas
    ├── payload.ts    # Zod schemas for request/response
    └── mapping.ts    # Data transformation logic
```

## Development Setup

### Environment Variables

- `PORT`: Server port (default: 8080)
- `HMAC_SECRET`: Secret key for HMAC signature verification (required for security)

### Installation

```bash
pnpm install
```

### Available Scripts

- `pnpm run dev` - Start development server with hot reload using tsx watch
- `pnpm run build` - Compile TypeScript to JavaScript (output: dist/)
- `pnpm run start` - Run the compiled application
- `pnpm run lint` - Run ESLint to check code style
- `pnpm run typecheck` - Run TypeScript type checking without emitting files
- `pnpm test` - Run tests with Vitest

## Code Style and Conventions

### TypeScript Configuration

- **Target**: ES2020
- **Module Resolution**: NodeNext (for native ESM support)
- **Strict Mode**: Enabled
- **Output Directory**: dist/
- **Source Directory**: src/

### ESLint Rules

- Extends `eslint:recommended` and `plugin:@typescript-eslint/recommended`
- No custom rule overrides currently configured
- Ignores: dist/, node_modules/

### Coding Standards

1. **Use strict TypeScript**: All strict mode checks are enabled
2. **ES Modules**: Always use `import/export` syntax, never `require()`
3. **File Extensions**: Include `.js` extension in imports for ESM compatibility
4. **Async/Await**: Use async/await for asynchronous operations
5. **Error Handling**: Use try/catch blocks and proper error responses
6. **Type Safety**: Use Zod schemas for runtime validation
7. **No Console Logs**: Use Fastify's built-in logger instead

### Naming Conventions

- **Files**: kebab-case (e.g., `analyze.ts`, `payload.ts`)
- **Functions**: camelCase (e.g., `buildServer`, `mapWritebacksToPhotos`)
- **Types/Interfaces**: PascalCase (e.g., `AnalyzeRequestSchema`)
- **Constants**: SCREAMING_SNAKE_CASE for environment variables

## Testing Guidelines

- Tests are written using Vitest
- Run tests with: `pnpm test`
- For CI: `pnpm test -- --run` (non-watch mode)
- Currently, test infrastructure is set up but tests may be minimal

## Build and CI/CD

### Local Build Process

1. Install dependencies: `pnpm install`
2. Run type check: `pnpm run typecheck`
3. Run linter: `pnpm run lint`
4. Build: `pnpm run build`
5. Test: `pnpm test -- --run`

### CI Pipeline

The repository uses GitHub Actions (`.github/workflows/ci.yml`):
- Runs on push and pull requests
- Uses Node.js 20
- Uses pnpm for package management
- Executes: install → build → lint → typecheck → test

### Notes for CI

- The workflow handles cases with or without lockfile
- TypeCheck may be allowed to fail (`|| true`) - This is a temporary measure during development; aim to fix type errors before merging
- Uses `pnpm install --frozen-lockfile=false` for flexibility during initial development

## API Endpoints

### POST /analyze

Processes plant photo analysis jobs.

**Authentication**: HMAC signature via `x-signature` header

**Request Body**: Validated against `AnalyzeRequestSchema`
- Contains array of jobs with photo URLs, plant IDs, dates, angles, etc.

**Response**: Validated against `AnalyzeResponseSchema`
- Returns results array with status and writebacks
- Includes errors array for failed jobs

**Security**: HMAC verification using SHA256 with secret from environment

## Common Tasks

### Adding a New Route

1. Create route handler in `src/routes/`
2. Register route in `src/server.ts` using `app.register()`
3. Add request/response schemas in `src/domain/payload.ts`
4. Add validation using Zod schemas

### Adding New Dependencies

1. Use: `pnpm add <package>`
2. For dev dependencies: `pnpm add -D <package>`
3. Ensure compatibility with Node.js >= 20
4. Update this documentation if it affects the tech stack

### Debugging

- Use `pnpm run dev` for hot reload during development
- Check Fastify logs for request/response debugging
- Use TypeScript's built-in debugging capabilities

## Security Considerations

1. **HMAC Verification**: All webhook requests must include valid `x-signature`
2. **Environment Variables**: Never commit `.env` files (already in `.gitignore`)
3. **Input Validation**: Always validate request bodies with Zod schemas
4. **Error Messages**: Don't expose sensitive information in error responses

## Pull Request Guidelines

1. Ensure all tests pass: `pnpm test -- --run`
2. Run linter: `pnpm run lint`
3. Run type check: `pnpm run typecheck`
4. Run build: `pnpm run build`
5. Keep changes focused and minimal
6. Update documentation if adding new features
7. Follow existing code style and conventions

## Additional Notes

- The application uses raw body parsing for HMAC verification
- **Work in Progress**: The following areas have placeholder implementations:
  - Notion API client integration (see commented `notion.updatePhoto` and `notion.upsertHistory` calls in `routes/analyze.ts`)
  - Vision AI provider integration for photo analysis (currently returns mock data)
  - File download logic for processing plant photos
- The codebase uses `void` expressions to acknowledge intentionally unused variables during development
- When implementing the missing integrations, ensure proper error handling and logging

## Task Assignment Best Practices

When creating issues for this repository:

1. **Be Specific**: Provide clear, focused descriptions of what needs to be done
2. **Define Scope**: Clearly specify which files or areas need changes
3. **Set Acceptance Criteria**: Include specific requirements like "must include unit tests" or "must maintain HMAC validation"
4. **Provide Context**: Link to relevant code sections or documentation
5. **Security First**: Explicitly mention security requirements for any changes

Examples of good issue descriptions:
- "Add validation for `angle` field in POST /analyze endpoint. Must include Zod schema update and unit test."
- "Implement rate limiting for webhook endpoint. Use fastify-rate-limit plugin, set to 100 requests/hour. Include integration tests."
- "Refactor HMAC verification into separate middleware function in src/security/hmac.ts. Must maintain existing security behavior."

## GitHub Copilot Coding Agent Tips

This section helps GitHub Copilot understand how to work most effectively in this repository:

### When to Use Copilot Coding Agent

✅ Good use cases:
- Adding new API endpoints with clear specifications
- Writing tests for existing functionality
- Implementing well-defined features with clear acceptance criteria
- Refactoring specific functions or modules
- Updating dependencies with clear upgrade paths
- Adding validation rules or schema updates

❌ Not recommended for Copilot:
- Large-scale architectural changes
- Complex refactoring without clear scope
- Changes requiring deep business logic understanding
- Security-critical changes without explicit requirements

### Validation Requirements

Before completing any task, Copilot must:
1. ✅ Run `pnpm run build` - ensure TypeScript compilation succeeds
2. ✅ Run `pnpm run lint` - ensure code style compliance
3. ✅ Run `pnpm run typecheck` - ensure type safety
4. ✅ Run `pnpm test -- --run` - ensure all tests pass
5. ✅ Verify no secrets or sensitive data in code changes
6. ✅ Ensure HMAC verification is not bypassed or weakened

### File Organization

- New routes go in `src/routes/` with clear naming (e.g., `health-check.ts`)
- New schemas go in `src/domain/payload.ts` or create new schema files if logical grouping makes sense
- Shared utilities go in `src/utils/` (create if needed)
- Tests mirror the source structure in `test/` directory

## Expected Development Workflow

1. **Read the issue carefully** - Understand requirements and constraints
2. **Explore relevant code** - View existing files that will be modified
3. **Plan minimal changes** - Identify the smallest possible change set
4. **Implement iteratively** - Make one logical change at a time
5. **Test continuously** - Run tests after each significant change
6. **Validate before completion** - Run full build/lint/test suite
7. **Document changes** - Update this file if workflow or structure changes
