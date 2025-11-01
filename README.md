# Notion-Grow-Ops

A TypeScript/Node.js application that provides a Fastify-based API server for analyzing grow operation photos and integrating with Notion. The application receives webhook requests, validates them using HMAC signatures, and processes plant photo analysis jobs.

## Features

- **Secure Webhook Processing**: HMAC-based signature verification for webhook requests
- **Plant Photo Analysis**: Processing pipeline for analyzing plant photos (Work in Progress)
- **Notion Integration**: API integration with Notion for data management (Work in Progress)
- **Type-Safe API**: Built with TypeScript and Zod for runtime validation
- **Fast and Reliable**: Powered by Fastify web framework

## Prerequisites

- Node.js >= 20
- pnpm 9.x (package manager)

## Installation

```bash
# Install pnpm if not already installed
npm install -g pnpm@9

# Install dependencies
pnpm install
```

## Environment Variables

Create a `.env` file in the project root (see `.env.example` if available):

- `PORT`: Server port (default: 8080)
- `HMAC_SECRET`: Secret key for HMAC signature verification (required for security)

## Development

```bash
# Start development server with hot reload
pnpm run dev

# Build the project
pnpm run build

# Run in production mode
pnpm run start

# Run linter
pnpm run lint

# Run type checking
pnpm run typecheck

# Run tests
pnpm test

# Run tests in CI mode (non-watch)
pnpm test -- --run
```

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

## API Endpoints

### POST /analyze

Processes plant photo analysis jobs.

**Authentication**: HMAC signature via `x-signature` header

**Request Body**:
```typescript
{
  jobs: Array<{
    photoUrl: string;
    plantId: string;
    capturedAt: string;
    angle: string;
    // ... additional fields
  }>
}
```

**Response**:
```typescript
{
  results: Array<{
    status: "success" | "error";
    writebacks?: object;
    error?: string;
  }>;
  errors: Array<string>;
}
```

## Tech Stack

- **Runtime**: Node.js >= 20
- **Language**: TypeScript 5.6+ with strict mode enabled
- **Web Framework**: Fastify 4.x
- **Validation**: Zod for schema validation
- **Testing**: Vitest
- **Linting**: ESLint with TypeScript support
- **Package Manager**: pnpm (version 9)
- **Module System**: ES Modules

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the coding standards
4. Run tests and ensure they pass: `pnpm test -- --run`
5. Run linter: `pnpm run lint`
6. Run type check: `pnpm run typecheck`
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

## Coding Standards

- Use strict TypeScript with all strict mode checks enabled
- Use ES Modules (`import/export`) syntax exclusively
- Include `.js` extension in imports for ESM compatibility
- Use async/await for asynchronous operations
- Use Zod schemas for runtime validation
- Use Fastify's built-in logger (no console.logs)
- Follow existing naming conventions:
  - Files: kebab-case
  - Functions: camelCase
  - Types/Interfaces: PascalCase
  - Constants: SCREAMING_SNAKE_CASE

## Work in Progress

The following features are currently under development:

- Notion API client integration
- Vision AI provider integration for photo analysis
- File download logic for processing plant photos

## License

Private repository - All rights reserved

## Support

For issues and questions, please open an issue in the GitHub repository.
