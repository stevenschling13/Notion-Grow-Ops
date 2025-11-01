# GitHub Copilot Instructions for Notion-Grow-Ops

## Project Overview

This is a TypeScript/Node.js application that provides a Fastify-based API server for analyzing grow operation photos and integrating with Notion. The application receives webhook requests, validates them using HMAC signatures, and processes plant photo analysis jobs.

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

## Tool Calling and Efficiency

<tool_calling>
You have the capability to call multiple tools in a single response.
For maximum efficiency, whenever you need to perform multiple independent
operations, ALWAYS call tools simultaneously whenever the actions can be
done in parallel rather than sequentially (e.g. git status + git diff,
multiple reads/edits to different files). Especially when exploring
repository, searching, reading files, viewing directories, validating
changes. For Example you can read 3 different files parallelly, or edit
different files in parallel. However, if some tool calls depend on previous
calls to inform dependent values like the parameters, do NOT call these
tools in parallel and instead call them sequentially.
</tool_calling>

## Best Use Cases for Copilot Coding Agent

### Ideally Suited Tasks
- Bug fixes with clear reproduction steps
- UI tweaks and visual adjustments
- Improving test coverage
- Documentation updates
- Addressing technical debt
- Accessibility improvements
- Adding new API endpoints following existing patterns
- Refactoring small, well-defined sections of code

### Tasks Better Suited for Human Review
- Broad architectural changes or complex refactoring
- Deep domain knowledge or business logic decisions
- Production-critical or security-sensitive work
- Ambiguous or open-ended assignments
- Major version upgrades of dependencies

## Working with the Coding Agent

### Issue Writing Guidelines
When creating issues for Copilot to work on:
1. Provide a clear, concise problem statement
2. Include explicit acceptance criteria
3. Specify which files should be changed (if known)
4. Indicate whether unit tests are expected
5. Break large tasks into smaller, focused issues

### Iteration and Feedback
- Copilot will create a branch and open a PR for the work
- You can leave comments and mention `@copilot` for revisions
- Review the code and provide specific feedback
- Copilot will iterate based on your guidance

### Monitoring Progress
- Check the PR for commits and progress updates
- Review the PR description for a checklist of completed and pending work
- Use the GitHub Agents tab to track session logs

## Additional Notes

- The application uses raw body parsing for HMAC verification
- **Work in Progress**: The following areas have placeholder implementations:
  - Notion API client integration (see commented `notion.updatePhoto` and `notion.upsertHistory` calls in `routes/analyze.ts`)
  - Vision AI provider integration for photo analysis (currently returns mock data)
  - File download logic for processing plant photos
- The codebase uses `void` expressions to acknowledge intentionally unused variables during development
- When implementing the missing integrations, ensure proper error handling and logging
