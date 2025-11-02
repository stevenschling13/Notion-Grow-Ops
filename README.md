# Notion-Grow-Ops

[![CI](https://github.com/stevenschling13/Notion-Grow-Ops/actions/workflows/ci.yml/badge.svg)](https://github.com/stevenschling13/Notion-Grow-Ops/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-Private-red.svg)](LICENSE)

A production-ready TypeScript/Node.js application that provides a Fastify-based API server for analyzing grow operation photos and integrating with Notion. The application receives webhook requests, validates them using HMAC signatures, and processes plant photo analysis jobs with AI-powered insights.

## ✨ Features

- 🔒 **Secure Webhook Handling**: HMAC-SHA256 signature verification with timing-safe comparison
- 🚀 **High-Performance API**: Built on Fastify for optimal performance (one of the fastest Node.js frameworks)
- 📊 **Schema Validation**: Runtime type checking with Zod for bulletproof data integrity
- 🌱 **Plant Photo Analysis**: Process and analyze grow operation photos with AI
- 📝 **Notion Integration**: Seamless integration with Notion databases for data management
- 🛡️ **Security Hardened**: Multiple security layers including rate limiting and security headers
- 🧪 **Well Tested**: Comprehensive test suite with 41+ tests and >60% coverage
- 📚 **Fully Documented**: Complete API documentation, architecture guide, and contribution guidelines

## 🏗️ Tech Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | >= 20 | JavaScript runtime |
| **Language** | TypeScript | 5.6+ | Type-safe development |
| **Web Framework** | Fastify | 4.x | High-performance HTTP server |
| **Validation** | Zod | 3.x | Runtime schema validation |
| **Testing** | Vitest | 2.x | Fast unit and integration testing |
| **Linting** | ESLint | 9.x | Code quality and consistency |
| **Package Manager** | pnpm | 9.x | Fast, disk-efficient package management |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0 ([Download](https://nodejs.org/))
- **pnpm** >= 9.0.0 (installed via npm or corepack)

### Quick Setup Verification

```bash
# Check Node.js version
node --version  # Should be v20.0.0 or higher

# Check or install pnpm
npx pnpm --version  # If not found, install with: npm install -g pnpm@^9.0.0
```

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/stevenschling13/Notion-Grow-Ops.git
cd Notion-Grow-Ops

# Install pnpm if you haven't already (choose one method)
npm install -g pnpm@^9.0.0
# OR use corepack (recommended)
corepack enable
corepack prepare pnpm@9 --activate

# Install dependencies
pnpm install
```

### 2. Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=8080

# Security - REQUIRED: Generate a strong secret for HMAC verification
# Example: openssl rand -hex 32
HMAC_SECRET=your-secret-key-here-change-me

# Optional: Token to bypass rate limiting for trusted upstream services
RATE_LIMIT_BYPASS_TOKEN=your-bypass-token-here
```

### 3. Development

Start the development server with hot reload:

```bash
pnpm run dev
```

The server will start on `http://localhost:8080` (or the port specified in your `.env` file).

### 4. Testing

Run the test suite:

```bash
# Run tests in watch mode (for development)
pnpm test

# Run tests once (for CI)
pnpm test -- --run

# Run with coverage report
pnpm test -- --coverage
```

## ⚙️ Configuration Reference

### Environment Variables

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `PORT` | HTTP server port | No | `8080` | `3000` |
| `HMAC_SECRET` | Secret key for HMAC signature verification | **Yes** | - | Use `openssl rand -hex 32` |
| `RATE_LIMIT_BYPASS_TOKEN` | Token to bypass rate limiting for trusted services | No | - | `secret-bypass-token-123` |

### Generating Secure Secrets

```bash
# Generate HMAC_SECRET (64-character hex string)
openssl rand -hex 32

# Generate RATE_LIMIT_BYPASS_TOKEN (32-character hex string)
openssl rand -hex 16
```

## 💻 Development Workflow

### Available Scripts

```bash
# Development
pnpm run dev          # Start dev server with hot reload (tsx watch)

# Building
pnpm run build        # Compile TypeScript to JavaScript (output: dist/)
pnpm run start        # Run the compiled application in production mode

# Quality Checks
pnpm run lint         # Run ESLint to check code style
pnpm run typecheck    # Run TypeScript type checking without emitting files
pnpm test             # Run tests with Vitest (watch mode)
pnpm test -- --run    # Run tests once (for CI)

# Combined
pnpm run build && pnpm run lint && pnpm run typecheck && pnpm test -- --run
```

### Development Server

Start the development server:

```bash
pnpm run dev
```

The server will start on `http://localhost:8080` with hot reload enabled. Any changes to TypeScript files will automatically restart the server.

## 🏗️ Building and Deployment

### Building for Production

Compile TypeScript to JavaScript:

```bash
pnpm run build
```

The compiled output will be in the `dist/` directory with the following structure:

```
dist/
├── index.js
├── server.js
├── routes/
│   └── analyze.js
└── domain/
    ├── payload.js
    └── mapping.js
```

### Running in Production

```bash
# Build the application
pnpm run build

# Start the server (uses compiled JavaScript)
pnpm run start
```

### Production Checklist

- [ ] Set `HMAC_SECRET` to a secure random value
- [ ] Configure `RATE_LIMIT_BYPASS_TOKEN` if needed
- [ ] Set `NODE_ENV=production`
- [ ] Use a process manager (PM2, systemd, Docker)
- [ ] Set up monitoring and logging
- [ ] Configure reverse proxy (nginx, Caddy)
- [ ] Enable HTTPS
- [ ] Set up automated backups

### Docker Deployment (Coming Soon)

```dockerfile
# Example Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@9 --activate
RUN pnpm install --frozen-lockfile --prod
COPY . .
RUN pnpm run build
EXPOSE 8080
CMD ["pnpm", "run", "start"]
```

## 🧪 Testing

### Running Tests

```bash
# Run tests in watch mode (development)
pnpm test

# Run tests once (CI/CD)
pnpm test -- --run

# Run specific test file
pnpm test test/hmac.test.ts

# Run with coverage report
pnpm test -- --coverage

# Run tests in UI mode (interactive)
pnpm test -- --ui
```

### Test Suite Overview

| Test File | Tests | Coverage Area |
|-----------|-------|---------------|
| `test/hmac.test.ts` | 4 | HMAC signature verification |
| `test/mapping.test.ts` | 8 | Data mapping functions |
| `test/payload.test.ts` | 21 | Zod schema validation |
| `test/analyze.integration.test.ts` | 8 | API endpoint integration |
| **Total** | **41+** | **All critical paths** |

### Coverage Goals

- **Line Coverage**: > 60%
- **Branch Coverage**: > 50%
- **Function Coverage**: > 70%

## 🔍 Code Quality

### Linting

Check code style and potential errors:

```bash
pnpm run lint
```

ESLint is configured with:
- `eslint:recommended`
- `@typescript-eslint/recommended`
- TypeScript-aware rules

### Type Checking

Run TypeScript type checker:

```bash
pnpm run typecheck
```

Configuration:
- **Strict Mode**: Enabled
- **Target**: ES2020
- **Module**: NodeNext (native ESM)

### Pre-commit Checks

Before committing, run all checks:

```bash
pnpm run build && pnpm run lint && pnpm run typecheck && pnpm test -- --run
```

## 📡 API Documentation

### Endpoints

#### POST /analyze

Processes plant photo analysis jobs with AI-powered insights.

**Authentication**: HMAC-SHA256 signature via `x-signature` header

**Headers**:
```http
Content-Type: application/json
x-signature: <HMAC-SHA256 hex digest of request body>
x-rate-limit-bypass: <optional bypass token>
```

**Request Body**:
```json
{
  "action": "analyze_photos",
  "source": "Grow Photos",
  "idempotency_scope": "photo_page_url+date",
  "requested_fields_out": ["AI Summary", "Health 0-100"],
  "jobs": [
    {
      "photo_page_url": "https://notion.so/photo-page-id",
      "photo_file_urls": ["https://example.com/photo.jpg"],
      "photo_title": "Plant Top View",
      "date": "2024-01-01",
      "angle": "top",
      "plant_id": "BLUE",
      "log_entry_url": "https://notion.so/log-entry-id",
      "stage": "vegetative",
      "room_name": "Grow Room A",
      "fixture": "LED 1000W",
      "photoperiod_h": 18,
      "notes": "Looking healthy"
    }
  ]
}
```

**Response** (200 OK):
```json
{
  "results": [
    {
      "photo_page_url": "https://notion.so/photo-page-id",
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

**Error Response** (400 Bad Request):
```json
{
  "error": {
    "formErrors": [],
    "fieldErrors": {
      "jobs": ["Array must contain at least 1 element(s)"]
    }
  }
}
```

**Status Codes**:
- `200 OK`: Request processed successfully (may contain errors per job)
- `400 Bad Request`: Invalid request body or schema validation failure
- `401 Unauthorized`: Invalid or missing HMAC signature
- `429 Too Many Requests`: Rate limit exceeded (100 requests per minute per IP)

### Request Schema Details

#### Job Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `photo_page_url` | URL string | Yes | Notion page URL for the photo |
| `photo_file_urls` | URL array | Yes | Array of photo file URLs (min 1) |
| `photo_title` | string | No | Title of the photo |
| `date` | string | Yes | Date in YYYY-MM-DD format |
| `angle` | enum | No | Photo angle: top, close, under-canopy, trichomes, canopy, bud-site, full-plant, deficiency, tent, stem, roots, other |
| `plant_id` | enum | No | Plant identifier: BLUE, GREEN, OUTDOOR-A, OUTDOOR-B |
| `log_entry_url` | URL string | No | Related log entry URL |
| `stage` | string | No | Growth stage (e.g., "vegetative", "flowering") |
| `room_name` | string | No | Name of the grow room |
| `fixture` | string | No | Light fixture description |
| `photoperiod_h` | number | No | Light hours per day |
| `notes` | string | No | Additional notes |

#### Writebacks Object

Analysis results that can be written back to Notion:

| Field | Type | Description |
|-------|------|-------------|
| `AI Summary` | string | Text summary of plant health |
| `Health 0-100` | number (0-100) | Numeric health score |
| `AI Next Step` | enum/string | Recommended action: None, RH up, RH down, Dim, Raise light, Feed, Flush, IPM, Defol, Stake |
| `VPD OK` | boolean | Vapor Pressure Deficit status |
| `DLI OK` | boolean | Daily Light Integral status |
| `CO2 OK` | boolean | CO2 level status |
| `Trend` | enum | Health trend: Improving, Stable, Declining |
| `DLI mol` | number | DLI measurement in mol/m²/day |
| `VPD kPa` | number | VPD measurement in kPa |
| `Sev` | enum | Severity level: Low, Medium, High, Critical |

### HMAC Signature Generation

The `x-signature` header must contain a HMAC-SHA256 hex digest of the request body:

**Node.js Example**:
```javascript
const crypto = require('crypto');

const body = JSON.stringify(requestData);
const signature = crypto
  .createHmac('sha256', process.env.HMAC_SECRET)
  .update(body)
  .digest('hex');

// Add to headers
headers['x-signature'] = signature;
```

**Python Example**:
```python
import hmac
import hashlib
import json
import os

body = json.dumps(request_data)
signature = hmac.new(
    os.environ['HMAC_SECRET'].encode(),
    body.encode(),
    hashlib.sha256
).hexdigest()

# Add to headers
headers['x-signature'] = signature
```

**cURL Example**:
```bash
#!/bin/bash
SECRET="your-hmac-secret"
PAYLOAD='{"action":"analyze_photos","source":"Grow Photos","idempotency_scope":"photo_page_url+date","requested_fields_out":[],"jobs":[{"photo_page_url":"https://notion.so/photo","photo_file_urls":["https://example.com/photo.jpg"],"date":"2024-01-01"}]}'

SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | cut -d' ' -f2)

curl -X POST http://localhost:8080/analyze \
  -H "Content-Type: application/json" \
  -H "x-signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

### Rate Limiting

The API implements IP-based rate limiting to protect against abuse:

**Default Limits**:
- **100 requests per minute** per IP address
- **60-second sliding window**
- **Automatic cleanup** of expired entries

**Bypassing Rate Limits**:

For trusted upstream services, you can bypass rate limiting:

```bash
curl -X POST http://localhost:8080/analyze \
  -H "Content-Type: application/json" \
  -H "x-signature: $SIGNATURE" \
  -H "x-rate-limit-bypass: your-bypass-token" \
  -d "$PAYLOAD"
```

The bypass token must match the `RATE_LIMIT_BYPASS_TOKEN` environment variable.

**Rate Limit Response** (429 Too Many Requests):
```json
{
  "error": "Too Many Requests"
}
```

**Future Enhancements**:
- Redis-based distributed rate limiting
- Per-endpoint rate limits
- Rate limit headers (X-RateLimit-Remaining, X-RateLimit-Reset)

### Security Headers

All responses include comprehensive security headers:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

These headers protect against:
- **XSS attacks**: Content-Type sniffing, cross-site scripting
- **Clickjacking**: Frame embedding prevention
- **MITM attacks**: HSTS enforcement
- **Information leakage**: Referrer policy
- **Unauthorized access**: Permissions policy

## 📁 Project Structure

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
├── hmac.test.ts                  # HMAC verification tests
├── mapping.test.ts               # Mapping function tests
├── payload.test.ts               # Schema validation tests
└── analyze.integration.test.ts  # API integration tests

docs/
├── CONTRIBUTING.md   # Contribution guidelines
├── ARCHITECTURE.md   # System architecture documentation
└── CHANGELOG.md      # Project changelog
```

## 🚧 Development Status

This project is currently in active development. The following features are completed, in progress, or planned:

### ✅ Completed

- Webhook endpoint with HMAC-SHA256 verification
- Request/response validation with Zod schemas
- Comprehensive test suite (41+ tests)
- Security middleware with rate limiting
- CI/CD pipeline with GitHub Actions
- Full TypeScript support with strict mode
- Development environment with hot reload
- Production build configuration
- Complete API documentation
- Architecture and contribution guidelines

### 🚧 In Progress

- Notion API client integration
- Vision AI provider integration for photo analysis
- File download and processing logic

### 📋 Planned

- Redis-based distributed rate limiting
- Background job queue with retry logic
- Monitoring and observability (metrics, traces, logs)
- Docker and Kubernetes deployment configs
- Horizontal scaling support
- Advanced analytics and trend analysis

## 🔒 Security

### Security Features

- **HMAC Verification**: All webhook requests require HMAC-SHA256 signature verification
- **Timing-Safe Comparison**: Prevents timing attacks on signature verification
- **Rate Limiting**: IP-based rate limiting (100 req/min with bypass token support)
- **Security Headers**: Comprehensive security headers on all responses
- **Input Validation**: Runtime type checking with Zod schemas
- **Environment Variables**: Secrets stored in environment variables, never committed
- **Error Sanitization**: Error messages sanitized to prevent information leakage
- **Type Safety**: TypeScript strict mode prevents common vulnerabilities

### Security Best Practices

1. **Generate Strong Secrets**: Use `openssl rand -hex 32` for HMAC secrets
2. **Rotate Secrets Regularly**: Update HMAC_SECRET and RATE_LIMIT_BYPASS_TOKEN periodically
3. **Use HTTPS**: Always use HTTPS in production (enforced by HSTS header)
4. **Monitor Logs**: Watch for repeated 401/429 responses indicating potential attacks
5. **Update Dependencies**: Keep dependencies up to date with `pnpm update`
6. **Review Code**: Use code review process for all changes
7. **Run Security Scans**: Use npm audit or similar tools regularly

### Reporting Security Issues

If you discover a security vulnerability, please email the maintainers directly. Do not open a public issue.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Quick Start for Contributors

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR-USERNAME/Notion-Grow-Ops.git`
3. **Create a branch**: `git checkout -b feature/my-feature`
4. **Make changes** following our [coding standards](CONTRIBUTING.md#coding-standards)
5. **Add tests** for new features
6. **Run checks**: `pnpm run build && pnpm run lint && pnpm run typecheck && pnpm test -- --run`
7. **Commit** with [conventional commits](CONTRIBUTING.md#commit-message-guidelines): `git commit -m "feat: add new feature"`
8. **Push**: `git push origin feature/my-feature`
9. **Open a Pull Request** with a clear description

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear, structured commit messages:

```
feat(scope): add new feature
fix(scope): fix a bug
docs: update documentation
test: add or update tests
refactor: refactor code
chore: maintenance tasks
ci: CI/CD changes
```

### Development Resources

- [Architecture Guide](ARCHITECTURE.md) - System design and component documentation
- [Changelog](CHANGELOG.md) - Project history and release notes
- [Contributing Guide](CONTRIBUTING.md) - Detailed contribution guidelines

## 📄 License

This project is private and proprietary.

## 💬 Support and Contact

### Getting Help

- **Documentation**: Start with this README, [ARCHITECTURE.md](ARCHITECTURE.md), and [CONTRIBUTING.md](CONTRIBUTING.md)
- **Issues**: Open an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

### Issue Templates

When opening an issue, please include:

**Bug Reports**:
- Description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node version, OS, etc.)
- Relevant logs or error messages

**Feature Requests**:
- Clear description of the feature
- Use case and motivation
- Proposed implementation (optional)
- Potential alternatives considered

## 🙏 Acknowledgments

Built with:
- [Fastify](https://www.fastify.io/) - Fast and low overhead web framework
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [Vitest](https://vitest.dev/) - Blazing fast unit test framework
- [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager

## 📊 Project Stats

- **Language**: TypeScript
- **Framework**: Fastify
- **Test Coverage**: >60%
- **Tests**: 41+
- **Dependencies**: Minimal and well-maintained
- **License**: Private

---

**Made with ❤️ for the grow operations community**
