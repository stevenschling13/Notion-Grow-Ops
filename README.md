# Notion-Grow-Ops

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%5E5.6.3-blue)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%5E9.0.0-orange)](https://pnpm.io/)
[![License](https://img.shields.io/badge/license-Private-red)](./LICENSE)

A production-ready TypeScript/Node.js webhook API service that analyzes grow operation photos using AI vision and integrates seamlessly with Notion databases. Built for security, performance, and reliability.

## ✨ Features

- 🔒 **Enterprise-Grade Security**: HMAC-SHA256 signature verification with timing-safe comparison
- 🚀 **High Performance**: Built on Fastify 4.x for optimal throughput
- 📊 **Runtime Validation**: Type-safe request/response handling with Zod schemas
- 🌱 **AI-Powered Analysis**: Process and analyze grow operation photos (integration ready)
- 📝 **Notion Integration**: Seamless database updates (integration ready)
- 🛡️ **Defense in Depth**: Rate limiting, security headers, body size limits, timeouts
- ✅ **Comprehensive Testing**: 71 tests covering mapping, validation, and integration
- 📖 **Excellent Documentation**: Detailed guides for contributors and maintainers

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Project Status](#project-status)
- [Contributing](#contributing)
- [License](#license)

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org/) | ≥ 20.0.0 | JavaScript runtime |
| [pnpm](https://pnpm.io/) | ≥ 9.0.0 | Package manager |
| [Git](https://git-scm.com/) | Latest | Version control |

### Installing pnpm

If you don't have pnpm installed:

```bash
# Via npm
npm install -g pnpm@^9.0.0

# Via Corepack (recommended for Node.js 20+)
corepack enable
corepack prepare pnpm@9 --activate

# Verify installation
pnpm --version
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/stevenschling13/Notion-Grow-Ops.git
cd Notion-Grow-Ops
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all dependencies including:
- **fastify** - Web framework
- **zod** - Schema validation
- **@fastify/helmet** - Security headers
- **@fastify/rate-limit** - Rate limiting
- Plus development tools (TypeScript, ESLint, Vitest)

### 3. Configure Environment

Create a `.env` file from the example template:

```bash
cp .env.example .env
```

Edit `.env` and set your configuration:

```env
# Required: Server port
PORT=8080

# Required: Secret key for HMAC signature verification
# Generate a secure random string for production
HMAC_SECRET=your-secure-random-secret-key-here

# Optional: Bypass token for trusted services
RATE_LIMIT_BYPASS_TOKEN=your-bypass-token-here
```

**Security Note**: Never commit the `.env` file to version control!

### 4. Verify Setup

```bash
# Build the project
pnpm run build

# Run linter
pnpm run lint

# Run type checking
pnpm run typecheck

# Run tests
pnpm test -- --run
```

If all commands succeed, you're ready to go! 🎉

### 5. Start Development Server

```bash
pnpm run dev
```

The server will start on `http://localhost:8080` (or your configured port) with hot reload enabled.

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `8080` | Server port number |
| `HMAC_SECRET` | **Yes** | - | Secret key for HMAC-SHA256 signature verification. Use a strong random string. |
| `RATE_LIMIT_BYPASS_TOKEN` | No | - | Secret token to bypass rate limiting for trusted upstream services |

### Future Environment Variables

When implementing AI and Notion integrations, add these:

```env
# Notion API Integration
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_PHOTOS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_HISTORY_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# AI Vision Provider (choose one)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# or
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# or
GOOGLE_AI_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

VISION_MODEL=gpt-4-vision-preview
MAX_PHOTO_SIZE_MB=10
```

See `.env.example` for complete documentation.

### Security Configuration

The server includes multiple security layers:

- **Body Size Limit**: 1 MiB maximum request size
- **Request Timeout**: 30 seconds
- **Connection Timeout**: 60 seconds
- **Rate Limiting**: 100 requests per minute per IP
- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.

## 💻 Development

### Available Scripts

```bash
# Development
pnpm run dev          # Start dev server with hot reload

# Building
pnpm run build        # Compile TypeScript to JavaScript (output: dist/)
pnpm run start        # Run compiled application (requires build first)

# Code Quality
pnpm run lint         # Run ESLint
pnpm run typecheck    # Run TypeScript type checking

# Testing
pnpm test             # Run tests in watch mode
pnpm test -- --run    # Run tests once (for CI)
```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the [Code Style Guidelines](./CONTRIBUTING.md#code-style-guidelines)

3. **Test your changes**
   ```bash
   pnpm test
   pnpm run lint
   pnpm run typecheck
   pnpm run build
   ```

4. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add new feature"
   ```

5. **Push and create a pull request**

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 📡 API Documentation

### Endpoint Overview

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/analyze` | Process plant photo analysis jobs | HMAC |

### POST /analyze

Processes one or more plant photo analysis jobs with AI-powered analysis.

#### Authentication

Requests must include an `x-signature` header with an HMAC-SHA256 signature:

```typescript
signature = HMAC-SHA256(HMAC_SECRET, rawBody)
header['x-signature'] = hex(signature)
```

#### Rate Limiting

- **Limit**: 100 requests per minute per IP address
- **Bypass**: Include `x-rate-limit-bypass` header with `RATE_LIMIT_BYPASS_TOKEN`

#### Request Format

**Headers:**
```
Content-Type: application/json
x-signature: <hmac-sha256-hex-signature>
x-rate-limit-bypass: <optional-bypass-token>
```

**Body:**
```json
{
  "action": "analyze_photos",
  "source": "Grow Photos",
  "idempotency_scope": "photo_page_url+date",
  "requested_fields_out": ["AI Summary", "Health 0-100"],
  "jobs": [
    {
      "photo_page_url": "https://notion.so/photo-page-url",
      "photo_file_urls": ["https://example.com/photo.jpg"],
      "photo_title": "Plant Top View",
      "date": "2024-01-15",
      "angle": "top",
      "plant_id": "BLUE",
      "log_entry_url": "https://notion.so/log-entry-url",
      "stage": "vegetative",
      "room_name": "Grow Room A",
      "fixture": "LED 1000W",
      "photoperiod_h": 18,
      "notes": "Looking healthy"
    }
  ]
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `photo_page_url` | URL | Yes | Notion page URL for the photo |
| `photo_file_urls` | URL[] | Yes | Array of photo file URLs (minimum 1) |
| `date` | string | Yes | Date in YYYY-MM-DD format |
| `photo_title` | string | No | Descriptive title for the photo |
| `angle` | enum | No | Photo angle: `top`, `close`, `under-canopy`, `trichomes`, `canopy`, `bud-site`, `full-plant`, `deficiency`, `tent`, `stem`, `roots`, `other` |
| `plant_id` | enum | No | Plant identifier: `BLUE`, `GREEN`, `OUTDOOR-A`, `OUTDOOR-B` |
| `log_entry_url` | URL | No | Related log entry URL |
| `stage` | string | No | Growth stage (e.g., "vegetative", "flowering") |
| `room_name` | string | No | Grow room identifier |
| `fixture` | string | No | Lighting fixture description |
| `photoperiod_h` | number | No | Light hours per day |
| `notes` | string | No | Additional notes |

#### Response Format

**Success (200 OK):**
```json
{
  "results": [
    {
      "photo_page_url": "https://notion.so/photo-page-url",
      "status": "ok",
      "writebacks": {
        "AI Summary": "Healthy canopy with good color. Slight leaf tip burn.",
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

**Error Responses:**

| Status Code | Description |
|-------------|-------------|
| 400 Bad Request | Invalid request body or schema validation failure |
| 401 Unauthorized | Missing or invalid HMAC signature |
| 429 Too Many Requests | Rate limit exceeded |

#### Example Request with curl

```bash
# 1. Prepare the request payload
PAYLOAD='{
  "action": "analyze_photos",
  "source": "Grow Photos",
  "idempotency_scope": "photo_page_url+date",
  "requested_fields_out": ["AI Summary", "Health 0-100"],
  "jobs": [{
    "photo_page_url": "https://notion.so/photo-123",
    "photo_file_urls": ["https://example.com/photo.jpg"],
    "date": "2024-01-15"
  }]
}'

# 2. Generate HMAC signature
SECRET="your-hmac-secret"
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

# 3. Send the request
curl -X POST http://localhost:8080/analyze \
  -H "Content-Type: application/json" \
  -H "x-signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

#### Example with JavaScript/TypeScript

```typescript
import { createHmac } from 'crypto';

async function analyzePhotos(jobs: any[]) {
  const payload = JSON.stringify({
    action: "analyze_photos",
    source: "Grow Photos",
    idempotency_scope: "photo_page_url+date",
    requested_fields_out: ["AI Summary", "Health 0-100"],
    jobs
  });

  const signature = createHmac('sha256', process.env.HMAC_SECRET!)
    .update(payload)
    .digest('hex');

  const response = await fetch('http://localhost:8080/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-signature': signature,
    },
    body: payload,
  });

  return response.json();
}
```

## 🏗️ Architecture

### System Overview

```
┌─────────────────┐
│   Upstream      │
│   Service       │  (Make.com, Zapier, n8n, etc.)
└────────┬────────┘
         │ HTTPS POST /analyze
         │ x-signature: HMAC-SHA256
         ▼
┌─────────────────────────────────────────────────┐
│         Notion-Grow-Ops API Server              │
│                                                 │
│  Security Layer → Auth Layer → Validation      │
│       │               │            │            │
│  Rate Limit      HMAC Verify   Zod Schema      │
│  Helmet          Timing-Safe   Validation      │
│  Body Limit                                     │
│                                                 │
│              Business Logic Layer               │
│         Job Processing (async parallel)         │
│                                                 │
└─────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│  AI Vision      │  │  Notion API     │
│  Provider       │  │  Integration    │
│  (Future)       │  │  (Future)       │
└─────────────────┘  └─────────────────┘
```

### Request Flow

1. **Security Layer**: Rate limiting, body size validation, security headers
2. **Authentication**: HMAC signature verification with timing-safe comparison
3. **Validation**: Zod schema validation for type safety
4. **Processing**: Parallel job processing with error handling
5. **Integration**: AI analysis and Notion updates (in development)
6. **Response**: Validated response with results and errors

### Project Structure

```
notion-grow-ops/
├── src/
│   ├── index.ts           # Application entry point
│   ├── server.ts          # Fastify server configuration
│   ├── routes/            # API route handlers
│   │   └── analyze.ts     # POST /analyze endpoint
│   └── domain/            # Business logic
│       ├── payload.ts     # Zod schemas
│       └── mapping.ts     # Data transformation
├── test/
│   ├── hmac.test.ts              # HMAC verification tests
│   ├── mapping.test.ts           # Mapping function tests
│   ├── payload.test.ts           # Schema validation tests
│   └── analyze-integration.test.ts  # Integration tests
├── .env.example           # Environment variable template
├── ARCHITECTURE.md        # Detailed architecture documentation
├── CONTRIBUTING.md        # Contribution guidelines
├── CHANGELOG.md          # Version history
└── README.md             # This file
```

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 🧪 Testing

### Running Tests

```bash
# Run all tests in watch mode
pnpm test

# Run tests once (for CI)
pnpm test -- --run

# Run specific test file
pnpm test test/mapping.test.ts
```

### Test Coverage

The project includes **71 comprehensive tests** covering:

| Category | Tests | Coverage |
|----------|-------|----------|
| HMAC Verification | 4 | Signature validation, timing attacks |
| Mapping Functions | 14 | Data transformation, edge cases |
| Schema Validation | 43 | Request/response validation, enums |
| Integration | 14 | End-to-end workflows, error handling |

### Test Structure

Tests follow the Arrange-Act-Assert pattern:

```typescript
it("should process valid request successfully", () => {
  // Arrange: Set up test data
  const input = createTestInput();
  
  // Act: Execute the function
  const result = functionUnderTest(input);
  
  // Assert: Verify the outcome
  expect(result).toBe(expected);
});
```

## 🔍 Troubleshooting

### Common Issues

#### Port Already in Use

**Problem**: Error: `EADDRINUSE: address already in use :::8080`

**Solution**:
```bash
# Find process using the port
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or use a different port in .env
PORT=3000
```

#### HMAC Signature Verification Fails

**Problem**: `401 Unauthorized` with error: `"bad signature"`

**Solutions**:
1. Verify `HMAC_SECRET` matches between client and server
2. Ensure the signature is computed from the raw body (before JSON parsing)
3. Check that the signature is hex-encoded
4. Verify no whitespace or encoding issues in the secret

**Debug with curl**:
```bash
# Generate signature for testing
echo -n '{"test":"data"}' | openssl dgst -sha256 -hmac "your-secret" | awk '{print $2}'
```

#### Type Errors After Update

**Problem**: TypeScript compilation errors

**Solutions**:
```bash
# Clear build cache
rm -rf dist node_modules/.cache

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild
pnpm run build
```

#### Tests Failing

**Problem**: Tests fail unexpectedly

**Solutions**:
```bash
# Check for stale processes
pkill -f vitest

# Clear test cache
rm -rf node_modules/.vitest

# Run tests with fresh state
pnpm test -- --run --no-cache
```

#### Rate Limit Issues

**Problem**: `429 Too Many Requests`

**Solutions**:
1. Add rate limit bypass token to requests:
   ```bash
   curl -H "x-rate-limit-bypass: your-bypass-token" ...
   ```
2. Adjust rate limit in `src/server.ts` for development
3. Wait 60 seconds for the window to reset

#### Environment Variables Not Loading

**Problem**: Server starts with wrong configuration

**Solutions**:
1. Verify `.env` file exists in project root
2. Check file is named exactly `.env` (not `.env.txt`)
3. Ensure no syntax errors in `.env` file
4. Restart the server after changing `.env`

### Getting Help

If you encounter issues not covered here:

1. Check the [ARCHITECTURE.md](./ARCHITECTURE.md) for system design details
2. Review [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines
3. Search existing [GitHub Issues](https://github.com/stevenschling13/Notion-Grow-Ops/issues)
4. Open a new issue with:
   - Detailed problem description
   - Steps to reproduce
   - Environment info (Node.js version, OS, etc.)
   - Relevant logs or error messages

## 📊 Project Status

**Current Version**: v0.1.0 (Early Development)

### ✅ Implemented Features

- [x] Secure webhook handling with HMAC-SHA256 verification
- [x] Request/response validation with Zod schemas
- [x] Data mapping for Notion integration
- [x] Rate limiting and security headers
- [x] Comprehensive test suite (71 tests)
- [x] Development tooling (hot reload, linting, type checking)
- [x] CI/CD pipeline with GitHub Actions
- [x] Complete documentation (Architecture, Contributing, Changelog)

### 🚧 In Progress / Placeholder

- [ ] **Notion API Client Integration**
  - Placeholder code exists in `src/routes/analyze.ts`
  - Will update Photos DB and AI History DB
  - See comments for integration points

- [ ] **AI Vision Provider Integration**
  - Placeholder for OpenAI/Anthropic/Google integration
  - Current implementation returns mock data
  - See `src/routes/analyze.ts` for integration structure

- [ ] **File Download and Processing**
  - Photo file download from URLs
  - Image preprocessing and optimization
  - Multi-file handling

### 🔮 Planned Features

**v0.2.0 - Notion Integration**
- Complete Notion API client implementation
- Database schema documentation
- Enhanced error handling for API calls

**v0.3.0 - AI Integration**
- AI vision provider implementation
- Photo analysis with configurable models
- Retry logic and fallback handling

**v0.4.0 - Enhancements**
- Monitoring and observability
- Performance optimizations
- Caching layer
- Background job processing

**v1.0.0 - Production Ready**
- Full feature completeness
- Production deployment guides
- Comprehensive API documentation (OpenAPI spec)
- Performance benchmarks

### Next Steps

1. **Implement Notion API Client**: Complete database update functionality
2. **Integrate AI Vision Provider**: Add photo analysis capabilities
3. **Add Monitoring**: Implement logging and metrics collection
4. **Performance Testing**: Benchmark and optimize critical paths
5. **Documentation**: Create OpenAPI/Swagger spec

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

### Quick Contribution Checklist

- [ ] Fork the repository
- [ ] Create a feature branch (`git checkout -b feature/amazing-feature`)
- [ ] Make your changes
- [ ] Add/update tests
- [ ] Ensure all checks pass:
  - [ ] `pnpm run build`
  - [ ] `pnpm run lint`
  - [ ] `pnpm run typecheck`
  - [ ] `pnpm test -- --run`
- [ ] Commit with conventional commits (`feat:`, `fix:`, `docs:`, etc.)
- [ ] Push to your fork
- [ ] Open a Pull Request

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the best outcome for the community

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and design decisions
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines and workflow
- [CHANGELOG.md](./CHANGELOG.md) - Version history and release notes
- [.env.example](./.env.example) - Environment configuration template

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

Built with:
- [Fastify](https://fastify.dev/) - Fast and low overhead web framework
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [Vitest](https://vitest.dev/) - Next generation testing framework
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types

---

**Made with ❤️ for better grow operations management**

For questions or support, please [open an issue](https://github.com/stevenschling13/Notion-Grow-Ops/issues).
