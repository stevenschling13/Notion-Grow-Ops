# Architecture

This document describes the architecture and design decisions of the Notion-Grow-Ops application.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Component Design](#component-design)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Technology Choices](#technology-choices)
- [Future Enhancements](#future-enhancements)

## Overview

Notion-Grow-Ops is a webhook-based API service that processes plant photo analysis requests. It integrates with Notion databases to store and update plant growth data, and uses AI vision services to analyze photos and provide insights.

### Key Features

- **Webhook Processing**: Accepts HMAC-verified webhook requests from automation systems
- **Photo Analysis**: Analyzes plant photos using AI vision services (placeholder)
- **Notion Integration**: Updates Notion databases with analysis results (placeholder)
- **Type Safety**: Full TypeScript support with runtime validation
- **Security**: Multiple layers of security including HMAC verification, rate limiting, and security headers

## System Architecture

```
┌─────────────────┐
│   Automation    │
│   System /      │ ──────┐
│   Notion        │       │
└─────────────────┘       │
                          │ HMAC-verified
                          │ POST /analyze
                          ▼
                    ┌─────────────────┐
                    │   Fastify       │
                    │   Web Server    │
                    └─────────────────┘
                          │
                          ├──► Rate Limiter (100 req/min/IP)
                          ├──► HMAC Verifier (SHA256)
                          ├──► Request Validator (Zod)
                          │
                          ▼
                    ┌─────────────────┐
                    │   Analyze       │
                    │   Route Handler │
                    └─────────────────┘
                          │
                          ├──► Download Photos (TODO)
                          ├──► Vision AI Analysis (TODO)
                          ├──► Map Results
                          │
                          ▼
                    ┌─────────────────┐
                    │   Notion        │
                    │   API Client    │ (TODO)
                    └─────────────────┘
                          │
                          ▼
                    ┌─────────────────┐
                    │   Notion        │
                    │   Database      │
                    └─────────────────┘
```

## Component Design

### Server (`src/server.ts`)

**Responsibilities:**
- Initialize and configure Fastify instance
- Register middleware and plugins
- Apply security headers
- Implement rate limiting
- Register routes

**Key Functions:**
- `buildServer()`: Factory function that creates and configures the Fastify instance
- `applySecurityHeaders()`: Adds security headers to all responses
- `applyInMemoryRateLimit()`: Implements IP-based rate limiting

**Design Decisions:**
- Factory pattern for testability
- Hook-based middleware for flexibility
- In-memory rate limiting for simplicity (consider Redis for production scaling)

### Routes (`src/routes/analyze.ts`)

**Responsibilities:**
- Handle POST /analyze requests
- Verify HMAC signatures
- Validate request payloads
- Orchestrate photo analysis workflow
- Return structured responses

**Security Layers:**
1. HMAC verification (authentication)
2. Schema validation (input sanitization)
3. Error handling (prevents information leakage)

**Design Decisions:**
- Fail-fast validation
- Parallel processing of jobs using Promise.all
- Graceful error handling per job (one failure doesn't fail all)

### Domain Layer

#### Payload Schemas (`src/domain/payload.ts`)

**Responsibilities:**
- Define request/response types
- Provide runtime validation with Zod
- Document API contract

**Key Schemas:**
- `WritebacksSchema`: Analysis results structure
- `JobSchema`: Individual photo analysis job
- `AnalyzeRequestSchema`: Complete webhook request
- `AnalyzeResponseSchema`: API response structure

**Design Decisions:**
- Zod for runtime type safety
- Strict validation with informative errors
- Optional fields for flexibility
- Enums for controlled vocabularies

#### Mapping Functions (`src/domain/mapping.ts`)

**Responsibilities:**
- Transform analysis results to Notion property format
- Build history entry properties
- Handle optional fields gracefully

**Key Functions:**
- `mapWritebacksToPhotos()`: Maps analysis results to Photos database properties
- `buildHistoryProps()`: Creates AI History entry properties

**Design Decisions:**
- Pure functions for testability
- Defensive programming (check undefined)
- Duplicate property handling for Notion's select vs text fields

### Entry Point (`src/index.ts`)

**Responsibilities:**
- Read environment configuration
- Start the server
- Handle startup errors

**Design Decisions:**
- Minimal entry point
- Environment variable configuration
- Binds to 0.0.0.0 for container compatibility

## Data Flow

### Request Flow

```
1. Client sends POST /analyze with HMAC signature
   ↓
2. Raw body plugin captures body before parsing
   ↓
3. Security headers hook adds response headers
   ↓
4. Rate limiter checks IP request count
   ↓
5. HMAC verifier validates signature
   ↓
6. Zod schema validates request structure
   ↓
7. Jobs processed in parallel
   ↓
8. Results aggregated and validated
   ↓
9. Response sent with security headers
```

### Job Processing Flow (per job)

```
1. Extract job parameters
   ↓
2. Download photo file (TODO)
   ↓
3. Call vision AI service (TODO - returns mock data)
   ↓
4. Map results to Notion format
   ↓
5. Update Photos database (TODO)
   ↓
6. Create/update AI History entry (TODO)
   ↓
7. Return success/error result
```

## Security Architecture

### Defense in Depth

1. **Network Layer**
   - Rate limiting (100 req/min/IP)
   - Bypass token for trusted services
   - Connection and request timeouts

2. **Authentication Layer**
   - HMAC-SHA256 signature verification
   - Timing-safe comparison (prevents timing attacks)
   - Per-request signature validation

3. **Input Validation Layer**
   - Zod schema validation
   - Type safety at runtime
   - URL validation
   - Date format validation
   - Enum validation for controlled values

4. **Response Security**
   - Security headers (XSS, clickjacking, content sniffing protection)
   - HSTS for HTTPS enforcement
   - CSP for content restrictions
   - CORS policies

5. **Configuration Security**
   - Environment variables for secrets
   - .env files excluded from version control
   - Example configuration provided

### Rate Limiting Design

**Current Implementation:**
- In-memory Map-based tracking
- Per-IP request counting
- 60-second sliding window
- Automatic cleanup of expired entries
- Bypass token support

**Considerations for Production:**
- Consider Redis for distributed rate limiting
- Implement token bucket or leaky bucket algorithm
- Add rate limit headers (X-RateLimit-Remaining, etc.)
- Monitor and alert on rate limit abuse

## Technology Choices

### Fastify

**Why Fastify?**
- High performance (one of the fastest Node.js frameworks)
- Schema-based validation
- Plugin architecture
- Excellent TypeScript support
- Active development and community

**Alternatives Considered:**
- Express: More mature but slower and less TypeScript-friendly
- Koa: Minimal but requires more setup
- NestJS: More opinionated, heavier framework

### TypeScript

**Benefits:**
- Type safety at compile time
- Better IDE support
- Self-documenting code
- Catches errors early

**Configuration:**
- Strict mode enabled
- ES2020 target
- ES Modules (NodeNext)

### Zod

**Why Zod?**
- Runtime type validation
- TypeScript inference
- Composable schemas
- Excellent error messages
- No code generation needed

**Alternatives Considered:**
- Joi: Less TypeScript-friendly
- Yup: Less performant
- AJV: More verbose, JSON Schema-based

### Vitest

**Why Vitest?**
- Fast (Vite-powered)
- Jest-compatible API
- Native ES Modules support
- TypeScript support out of the box
- Watch mode with HMR

**Alternatives Considered:**
- Jest: Slower, ESM support is experimental
- Mocha: Requires more setup
- AVA: Less popular, different API

### pnpm

**Why pnpm?**
- Disk space efficient
- Fast installation
- Strict dependency resolution
- Monorepo support
- Growing adoption

## Future Enhancements

### Short Term

1. **Notion API Client**
   - Implement actual Notion API calls
   - Handle API errors and rate limits
   - Support batch operations

2. **Vision AI Integration**
   - Integrate OpenAI GPT-4 Vision or similar
   - Download and preprocess images
   - Parse AI responses into structured data

3. **Monitoring & Logging**
   - Structured logging with pino
   - Request tracing
   - Performance metrics
   - Error tracking (e.g., Sentry)

4. **Configuration Management**
   - Support multiple environments
   - Configuration validation
   - Feature flags

### Medium Term

1. **Distributed Rate Limiting**
   - Redis-based rate limiting
   - Distributed lock for consistency
   - Per-user and per-endpoint limits

2. **Job Queue**
   - Background job processing
   - Retry logic with exponential backoff
   - Job status tracking

3. **Caching**
   - Cache analysis results
   - Cache Notion API responses
   - Redis or similar for distributed caching

4. **Webhooks**
   - Send webhooks on job completion
   - Configurable webhook endpoints
   - Webhook retry logic

### Long Term

1. **Horizontal Scaling**
   - Stateless design (already achieved)
   - Load balancer support
   - Session affinity if needed

2. **Advanced Analytics**
   - Aggregate plant health trends
   - Anomaly detection
   - Predictive analytics

3. **Multi-Tenancy**
   - Support multiple users/organizations
   - Isolated data per tenant
   - API key management

4. **GraphQL API**
   - More flexible querying
   - Real-time subscriptions
   - Better mobile support

## Design Principles

1. **Separation of Concerns**: Clear boundaries between layers (routes, domain, infrastructure)
2. **Type Safety**: TypeScript everywhere with strict mode
3. **Testability**: Pure functions, dependency injection, factory pattern
4. **Security First**: Multiple security layers, defense in depth
5. **Performance**: Async operations, parallel processing, efficient algorithms
6. **Maintainability**: Clear naming, focused modules, comprehensive documentation
7. **Scalability**: Stateless design, horizontal scaling ready
8. **Observability**: Structured logging, error tracking, metrics

## Questions?

For questions about the architecture or to propose changes, please open an issue on GitHub.
