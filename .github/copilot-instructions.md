# GitHub Copilot Instructions for Notion-Grow-Ops

## Project Overview

This is a **Notion Grow Ops** application - a Fastify-based TypeScript API server that analyzes grow operation photos and integrates with Notion databases. The application receives webhook requests, validates them via HMAC signatures, and processes photo analysis jobs.

## Technology Stack

- **Runtime**: Node.js v20+
- **Language**: TypeScript (ES2020 target, NodeNext modules)
- **Framework**: Fastify v4.28.1 with raw-body plugin
- **Package Manager**: pnpm v9 (preferred for CI/CD)
- **Validation**: Zod v3.23.8
- **Testing**: Vitest v2.1.3
- **Linting**: ESLint v9 with TypeScript support
- **Build Tool**: TypeScript Compiler (tsc)
- **Development**: tsx watch mode

## Project Structure

```
src/
  ├── index.ts           # Application entry point, starts Fastify server
  ├── server.ts          # Server configuration with plugins
  ├── routes/
  │   └── analyze.ts     # POST /analyze endpoint with HMAC validation
  └── domain/
      ├── payload.ts     # Zod schemas for request/response validation
      └── mapping.ts     # Data transformation utilities
```

## Build & Development Commands

- `pnpm install` - Install dependencies (use `--frozen-lockfile=false` if lockfile doesn't exist)
- `pnpm run dev` - Start development server with hot reload (tsx watch)
- `pnpm run build` - Compile TypeScript to JavaScript in `dist/` directory
- `pnpm run start` - Run production build from `dist/index.js`
- `pnpm run lint` - Run ESLint on all files
- `pnpm run typecheck` - Type-check without emitting files
- `pnpm test -- --run` - Run tests in CI mode (non-watch)

## Coding Standards & Conventions

### TypeScript Configuration
- **Strict mode enabled** - All strict type checking flags are on
- **Module system**: NodeNext (ESM with .js extensions in imports)
- **Target**: ES2020
- Always include proper type annotations for function parameters and return types
- Use `import type` for type-only imports

### Code Style
- Use ESLint recommended rules + TypeScript recommended rules
- No custom ESLint rules configured yet
- Follow async/await patterns (no callback-style code)
- Use Zod schemas for all API input/output validation

### API Patterns
- All routes should be Fastify plugins using `async function(app: FastifyInstance)`
- Enable `rawBody` for routes that need HMAC signature verification
- Always validate request bodies with Zod schemas using `.safeParse()` or `.parse()`
- Return appropriate HTTP status codes (200, 400, 401, etc.)
- Use structured error responses: `{ error: string }` format

### Security
- **HMAC Validation**: All webhook endpoints must verify `x-signature` header
- Secret is stored in `process.env.HMAC_SECRET`
- Use `crypto.createHmac('sha256', secret)` for signature verification
- Return 401 for invalid signatures or missing secrets

### Environment Variables
- `PORT` - Server port (default: 8080)
- `HMAC_SECRET` - Required for webhook signature validation
- Use sensible defaults where appropriate

## Testing Guidelines

- Use Vitest as the test framework
- Test files should be co-located with source files or in a `__tests__` directory
- Run tests with `pnpm test -- --run` for CI/CD (non-interactive)
- Currently no tests exist - create tests following Vitest conventions when adding new features

## CI/CD Pipeline

The repository uses GitHub Actions (`.github/workflows/ci.yml`):
1. Runs on Node.js v20
2. Uses pnpm v9 for package management
3. Pipeline steps: install → build → lint → typecheck → test
4. Conditional pnpm caching based on lockfile existence
5. Typecheck allows failures (`|| true`) - fix this when working on type issues

## Future Development Areas

The codebase has placeholders for:
- Notion API integration (client calls are currently commented out)
- Vision provider integration for photo analysis (currently returns mock data)
- Photo page and history database updates
- File download functionality

When implementing these features:
- Add proper error handling
- Maintain the existing async/await patterns
- Keep HMAC validation intact
- Add appropriate Zod schemas for new data structures

## Dependencies Management

When adding new dependencies:
- Prefer well-maintained, popular packages
- Add to `dependencies` for runtime needs, `devDependencies` for build/test tools
- Use pnpm for installation: `pnpm add <package>`
- Keep versions pinned with `^` for minor updates

## Common Tasks

### Adding a new API endpoint
1. Create route handler in `src/routes/`
2. Define Zod schemas in `src/domain/payload.ts`
3. Register route in `src/server.ts`
4. Add tests for the endpoint
5. Update this documentation if needed

### Adding environment variables
1. Document in this file under "Environment Variables"
2. Provide defaults where sensible
3. Update deployment documentation

### Debugging
- Use `console.log` or Fastify's built-in logger
- Fastify logger is enabled by default: `app.log.info()`, `app.log.error()`
- In development, use `pnpm run dev` for auto-reload

## Important Notes

- Always run `pnpm run build` before committing to catch TypeScript errors
- Never commit the `node_modules/` or `dist/` directories
- Keep the HMAC secret secure - never commit it to the repository
- This is a private repository - internal use only
