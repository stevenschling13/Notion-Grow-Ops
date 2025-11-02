# Notion-Grow-Ops

A TypeScript/Node.js application that provides a Fastify-based API server for analyzing grow operation photos and integrating with Notion. The application receives webhook requests, validates them using HMAC signatures, and processes plant photo analysis jobs.

## Features

- 🔒 **Secure Webhook Handling**: HMAC-SHA256 signature verification for all incoming requests
- 🚀 **High-Performance API**: Built on Fastify for optimal performance
- 📊 **Schema Validation**: Runtime type checking with Zod
- 🌱 **Plant Photo Analysis**: Process and analyze grow operation photos
- 📝 **Notion Integration**: Seamless integration with Notion databases

## Tech Stack

- **Runtime**: Node.js >= 20
- **Language**: TypeScript 5.6+
- **Web Framework**: Fastify 4.x
- **Validation**: Zod
- **Testing**: Vitest
- **Linting**: ESLint with TypeScript support
- **Package Manager**: pnpm 9

## Prerequisites

- Node.js >= 20
- pnpm >= 9.0.0

## Installation

```bash
# Install pnpm if you haven't already
npm install -g pnpm@^9.0.0

# Install dependencies
pnpm install
```

## Configuration

Create a `.env` file in the root directory (see `.env.example` for reference):

```env
PORT=8080
HMAC_SECRET=your-secret-key-here
RATE_LIMIT_BYPASS_TOKEN=optional-bypass-token
```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | `8080` |
| `HMAC_SECRET` | Secret key for HMAC signature verification | Yes | - |
| `RATE_LIMIT_BYPASS_TOKEN` | Token to bypass rate limiting for trusted services | No | - |

## Development

Start the development server with hot reload:

```bash
pnpm run dev
```

The server will start on `http://localhost:8080` (or the port specified in your `.env` file).

## Building

Compile TypeScript to JavaScript:

```bash
pnpm run build
```

The compiled output will be in the `dist/` directory.

## Running in Production

```bash
# Build the application
pnpm run build

# Start the server
pnpm run start
```

## Testing

Run tests with Vitest:

```bash
# Run tests in watch mode
pnpm test

# Run tests once (for CI)
pnpm test -- --run
```

## Code Quality

### Linting

```bash
pnpm run lint
```

### Type Checking

```bash
pnpm run typecheck
```

## API Endpoints

### POST /analyze

Processes plant photo analysis jobs with AI-powered analysis.

**Authentication**: HMAC-SHA256 signature via `x-signature` header

**Request Body**:
```json
{
  "action": "analyze_photos",
  "source": "Grow Photos",
  "idempotency_scope": "photo_page_url+date",
  "requested_fields_out": ["AI Summary", "Health 0-100"],
  "jobs": [
    {
      "photo_page_url": "https://notion.so/photo-page",
      "photo_file_urls": ["https://example.com/photo.jpg"],
      "photo_title": "Plant Top View",
      "date": "2024-01-01",
      "angle": "top",
      "plant_id": "BLUE",
      "log_entry_url": "https://notion.so/log-entry",
      "stage": "vegetative",
      "room_name": "Grow Room A",
      "fixture": "LED 1000W",
      "photoperiod_h": 18,
      "notes": "Looking healthy"
    }
  ]
}
```

**Response**:
```json
{
  "results": [
    {
      "photo_page_url": "https://notion.so/photo-page",
      "status": "ok",
      "writebacks": {
        "AI Summary": "Healthy canopy, RH slightly low for stage.",
        "Health 0-100": 88,
        "AI Next Step": "Raise light",
        "VPD OK": true,
        "DLI OK": false,
        "CO2 OK": true,
        "Trend": "Improving",
        "DLI mol": 36.7,
        "VPD kPa": 1.38,
        "Sev": "Low"
      }
    }
  ],
  "errors": []
}
```

**Status Codes**:
- `200 OK`: Request processed successfully
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Invalid or missing HMAC signature
- `429 Too Many Requests`: Rate limit exceeded (100 requests per minute per IP)

**Rate Limiting**:
- Default: 100 requests per minute per IP
- Bypass: Include `x-rate-limit-bypass` header with the token from `RATE_LIMIT_BYPASS_TOKEN` environment variable

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

test/
└── hmac.test.ts      # HMAC verification tests
```

## Development Status

This project is currently in active development. The following features are planned or in progress:

- ✅ Webhook endpoint with HMAC verification
- ✅ Request/response validation
- 🚧 Notion API client integration
- 🚧 Vision AI provider integration for photo analysis
- 🚧 File download and processing logic

## Security

- All webhook requests must include a valid `x-signature` header for HMAC verification
- Environment variables should never be committed to version control
- Input validation is performed using Zod schemas
- Error messages are sanitized to avoid exposing sensitive information

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `pnpm test -- --run`
5. Run linter: `pnpm run lint`
6. Run type check: `pnpm run typecheck`
7. Commit your changes: `git commit -am 'Add my feature'`
8. Push to the branch: `git push origin feature/my-feature`
9. Submit a pull request

## License

This project is private and proprietary.

## Support

For questions or issues, please open an issue on GitHub.
