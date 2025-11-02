# Notion-Grow-Ops

A TypeScript/Node.js API server for analyzing grow operation photos using AI vision and integrating with Notion databases.

## 🌱 Overview

Notion-Grow-Ops receives webhook requests with plant photo URLs, analyzes them using AI vision models, and writes structured results back to Notion. It validates requests using HMAC signatures for security.

**Status**: 🚧 Early Development (Core features in progress)

## ✨ Features

- **Secure Webhook Handler**: HMAC-SHA256 signature verification
- **Batch Processing**: Analyze multiple photos in parallel
- **Type-Safe**: Full TypeScript with Zod schema validation
- **Production-Ready Framework**: Built on Fastify for performance
- **Notion Integration**: (In Progress) Sync analysis results to Notion
- **AI Vision Analysis**: (In Progress) Plant health assessment

## 📋 Prerequisites

- **Node.js** >= 20.x (LTS recommended)
- **pnpm** >= 9.x
- **Environment Variables**: See [Configuration](#configuration)

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/stevenschling13/Notion-Grow-Ops.git
cd Notion-Grow-Ops

# Install dependencies
pnpm install
```

### Configuration

Create a `.env` file in the project root:

```bash
# Required: Secret key for HMAC signature verification
HMAC_SECRET=your-secret-key-here

# Optional: Server port (default: 8080)
PORT=8080
```

**Generating a Secure HMAC Secret:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### Development

```bash
# Start development server with hot reload
pnpm run dev

# Server will start at http://localhost:8080
```

### Build & Run

```bash
# Compile TypeScript
pnpm run build

# Run compiled JavaScript
pnpm run start
```

### Testing

```bash
# Run tests in watch mode
pnpm test

# Run tests once (CI mode)
pnpm test -- --run
```

### Code Quality

```bash
# Lint code
pnpm run lint

# Type check
pnpm run typecheck

# Run all checks (build + lint + typecheck + test)
pnpm run build && pnpm run lint && pnpm run typecheck && pnpm test -- --run
```

## 📡 API Documentation

### POST /analyze

Analyzes plant photos and returns structured results.

**Authentication**: HMAC-SHA256 signature in `x-signature` header

**Request Body:**
```typescript
{
  "action": "analyze_photos",
  "source": "Grow Photos",
  "idempotency_scope": "photo_page_url+date",
  "requested_fields_out": ["AI Summary", "Health 0-100", ...],
  "jobs": [
    {
      "photo_page_url": "https://notion.so/page-id",
      "photo_file_urls": ["https://example.com/photo.jpg"],
      "date": "2024-01-15",
      "plant_id": "BLUE",
      "angle": "canopy",
      "stage": "flowering",
      // ... additional optional fields
    }
  ]
}
```

**Response (200 OK):**
```typescript
{
  "results": [
    {
      "photo_page_url": "https://notion.so/page-id",
      "status": "ok",
      "writebacks": {
        "AI Summary": "Healthy canopy, RH slightly low for stage.",
        "Health 0-100": 88,
        "AI Next Step": "Raise light",
        "VPD OK": true,
        "DLI OK": false,
        // ... additional analysis fields
      }
    }
  ],
  "errors": []
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid HMAC signature
- `400 Bad Request`: Invalid request payload

### HMAC Signature Generation

The HMAC signature must be computed from the raw request body:

```javascript
const crypto = require('crypto');

const requestBody = JSON.stringify({
  action: 'analyze_photos',
  // ... your request data
});

const signature = crypto
  .createHmac('sha256', process.env.HMAC_SECRET)
  .update(requestBody)
  .digest('hex');

// Include in request headers
headers['x-signature'] = signature;
```

**Example with cURL:**
```bash
SECRET="your-secret-key"
BODY='{"action":"analyze_photos","source":"Grow Photos","idempotency_scope":"photo_page_url+date","requested_fields_out":[],"jobs":[{"photo_page_url":"https://example.com","photo_file_urls":["https://example.com/photo.jpg"],"date":"2024-01-01"}]}'
SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

curl -X POST http://localhost:8080/analyze \
  -H "Content-Type: application/json" \
  -H "x-signature: $SIG" \
  -d "$BODY"
```

## 🏗️ Project Structure

```
src/
├── index.ts              # Application entry point
├── server.ts             # Fastify server configuration
├── routes/
│   └── analyze.ts        # POST /analyze endpoint handler
└── domain/
    ├── payload.ts        # Zod schemas for validation
    └── mapping.ts        # Data transformation logic

test/
└── hmac.test.ts          # HMAC authentication tests
```

## 🧪 Testing

Current test coverage:
- ✅ HMAC signature verification
- ✅ Request authentication flows
- ✅ Timing-safe comparison (security)

Run tests with coverage:
```bash
pnpm test -- --coverage
```

## 🔧 Tech Stack

- **Runtime**: Node.js >= 20
- **Language**: TypeScript 5.6+ (strict mode)
- **Framework**: Fastify 4.x
- **Validation**: Zod for runtime type checking
- **Testing**: Vitest
- **Linting**: ESLint with TypeScript support
- **Package Manager**: pnpm 9.x

## 🗺️ Roadmap

### Current Sprint (In Progress)
- [ ] Notion API client integration
- [ ] Vision AI provider integration
- [ ] File download from URLs
- [ ] Integration tests

### Backlog
- [ ] Rate limiting
- [ ] Structured logging (pino)
- [ ] Health check endpoint
- [ ] OpenAPI documentation
- [ ] Docker support
- [ ] Error tracking (Sentry)
- [ ] Metrics & monitoring

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and test: `pnpm test`
4. Run quality checks: `pnpm run lint && pnpm run typecheck`
5. Commit with descriptive message
6. Push and create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Fastify](https://www.fastify.io/) - Fast and low overhead web framework
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [Notion API](https://developers.notion.com/) - Official Notion SDK

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/stevenschling13/Notion-Grow-Ops/issues)
- **Discussions**: [GitHub Discussions](https://github.com/stevenschling13/Notion-Grow-Ops/discussions)

## 🔒 Security

Found a security vulnerability? Please email the repository maintainer directly instead of opening a public issue.

---

**Made with 🌱 by [stevenschling13](https://github.com/stevenschling13)**
