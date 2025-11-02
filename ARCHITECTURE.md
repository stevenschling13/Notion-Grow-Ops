# Architecture

This document describes the system architecture, design decisions, and technical implementation of Notion-Grow-Ops.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Data Flow](#data-flow)
- [Component Design](#component-design)
- [Integration Points](#integration-points)
- [Security Architecture](#security-architecture)
- [Data Models](#data-models)
- [Design Decisions](#design-decisions)
- [Future Architecture](#future-architecture)

## Overview

Notion-Grow-Ops is a webhook-based API service that processes plant grow operation photos, performs AI-powered analysis, and integrates with Notion databases. The system is designed for:

- **High reliability**: Robust error handling and validation
- **Security**: HMAC verification, rate limiting, security headers
- **Extensibility**: Modular design for adding new AI providers and integrations
- **Performance**: Fast request processing with Fastify

### Technology Stack

```
Runtime:      Node.js 20+
Language:     TypeScript 5.6+ (strict mode)
Framework:    Fastify 4.x
Validation:   Zod
Testing:      Vitest
Package Mgr:  pnpm 9
```

## System Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Upstream      │
│   Service       │  (e.g., Make.com, Zapier, n8n)
│   (Webhook)     │
└────────┬────────┘
         │ HTTPS POST /analyze
         │ x-signature: <HMAC>
         ▼
┌─────────────────────────────────────────────────┐
│            Notion-Grow-Ops API                  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Security Layer                          │  │
│  │  • Rate Limiting (100 req/min per IP)   │  │
│  │  • Security Headers (Helmet)            │  │
│  │  • Body Size Limit (1 MiB)              │  │
│  └──────────────────────────────────────────┘  │
│                    │                            │
│  ┌──────────────────────────────────────────┐  │
│  │  Authentication Layer                    │  │
│  │  • HMAC-SHA256 Signature Verification   │  │
│  │  • Timing-Safe Comparison                │  │
│  └──────────────────────────────────────────┘  │
│                    │                            │
│  ┌──────────────────────────────────────────┐  │
│  │  Validation Layer                        │  │
│  │  • Zod Schema Validation                 │  │
│  │  • Request Structure Checking            │  │
│  └──────────────────────────────────────────┘  │
│                    │                            │
│  ┌──────────────────────────────────────────┐  │
│  │  Business Logic Layer                    │  │
│  │  • Job Processing (async)                │  │
│  │  • Data Mapping                          │  │
│  │  • Error Handling                        │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
         │                    │
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│  AI Vision      │  │  Notion API     │
│  Provider       │  │  Integration    │
│  (Future)       │  │  (Future)       │
└─────────────────┘  └─────────────────┘
```

### Application Structure

```
src/
├── index.ts           # Application entry point
├── server.ts          # Fastify server setup & middleware
├── routes/            # HTTP route handlers
│   └── analyze.ts     # POST /analyze endpoint
└── domain/            # Business logic & data
    ├── payload.ts     # Zod schemas (request/response)
    └── mapping.ts     # Data transformation functions

test/
├── hmac.test.ts              # HMAC verification tests
├── mapping.test.ts           # Mapping function tests
├── payload.test.ts           # Schema validation tests
└── analyze-integration.test.ts  # End-to-end tests
```

## Data Flow

### Request Processing Flow

```
1. Upstream → POST /analyze
   ├─ Headers: x-signature (HMAC-SHA256)
   ├─ Body: JSON with jobs array
   └─ Content-Type: application/json

2. Security Middleware
   ├─ Rate limiting check (IP-based)
   ├─ Helmet security headers
   └─ Body size validation (<1 MiB)

3. Raw Body Capture
   └─ Preserve original body for HMAC verification

4. HMAC Verification
   ├─ Extract signature from x-signature header
   ├─ Compute HMAC-SHA256 of raw body
   ├─ Timing-safe comparison
   └─ Reject if invalid (401 Unauthorized)

5. Request Validation
   ├─ Parse JSON body
   ├─ Validate against AnalyzeRequestSchema
   └─ Reject if invalid (400 Bad Request)

6. Job Processing (async parallel)
   ├─ For each job:
   │   ├─ [FUTURE] Download photo files
   │   ├─ [FUTURE] Call AI vision API
   │   ├─ Map writebacks to Notion properties
   │   └─ [FUTURE] Update Notion databases
   └─ Collect results and errors

7. Response Generation
   ├─ Validate against AnalyzeResponseSchema
   ├─ Return 200 OK with results
   └─ Include errors array for failed jobs

8. Response → Upstream
   ├─ Status: 200 (success), 400 (validation), 401 (auth)
   ├─ Body: { results: [...], errors: [...] }
   └─ Headers: Security headers from Helmet
```

### Data Transformation Flow

```
AI Analysis Output (Writebacks)
         │
         ▼
┌─────────────────────────────────────┐
│  mapWritebacksToPhotos()            │
│  • Maps to Notion Photos DB props   │
│  • Handles optional fields          │
│  • Dual mapping for "AI Next Step"  │
└──────────────┬──────────────────────┘
               │
               ▼
    Notion Photos DB Update
    (Future Implementation)


Job Context + Writebacks
         │
         ▼
┌─────────────────────────────────────┐
│  buildHistoryProps()                │
│  • Generates history record name    │
│  • Links to photo and log entry     │
│  • Includes analysis results        │
└──────────────┬──────────────────────┘
               │
               ▼
   Notion AI History DB Upsert
   (Future Implementation)
```

## Component Design

### Server (`src/server.ts`)

**Responsibilities**:
- Initialize Fastify instance
- Configure middleware (raw body, helmet, rate limit)
- Register routes
- Configure timeouts and limits

**Configuration**:
```typescript
{
  bodyLimit: 1024 * 1024,      // 1 MiB max request size
  requestTimeout: 30_000,       // 30 second timeout
  connectionTimeout: 60_000,    // 60 second keep-alive
}
```

**Middleware Stack**:
1. `fastify-raw-body` - Capture raw body for HMAC (runs first)
2. `@fastify/helmet` - Security headers
3. `@fastify/rate-limit` - Rate limiting with bypass support

### Routes (`src/routes/analyze.ts`)

**Endpoint**: `POST /analyze`

**Flow**:
1. HMAC signature verification
2. Request schema validation
3. Parallel job processing
4. Response generation

**Error Handling**:
- 401: Invalid/missing HMAC signature
- 400: Schema validation failure
- 200: Success (even with partial job failures)

### Domain Layer

#### Payload Schemas (`src/domain/payload.ts`)

**Schemas**:
- `WritebacksSchema` - AI analysis output format
- `JobSchema` - Single analysis job structure
- `AnalyzeRequestSchema` - Complete request structure
- `AnalyzeResultSchema` - Single job result
- `AnalyzeResponseSchema` - Complete response structure

**Validation Rules**:
- URLs must be valid HTTP(S) URLs
- Dates must match YYYY-MM-DD format
- Health scores: 0-100 integers
- Jobs array: 1-100 items
- Enum values for plant IDs, angles, trends, severity

#### Mapping Functions (`src/domain/mapping.ts`)

**`mapWritebacksToPhotos()`**:
- Input: AI writebacks
- Output: Notion Photos DB properties
- Special handling: "AI Next Step" maps to both select and text fields

**`buildHistoryProps()`**:
- Input: Job context + writebacks
- Output: Notion AI History DB properties
- Name generation: `{plant_id} - {date} - {angle}`
- Always sets Status: "Complete"

## Integration Points

### Current Integrations

#### Upstream Services
- **Protocol**: HTTPS webhook
- **Authentication**: HMAC-SHA256 signatures
- **Format**: JSON
- **Example Integrations**: Make.com, Zapier, n8n

### Future Integrations

#### Notion API
```
Databases:
  - Photos DB: Store individual photo records
  - AI History DB: Track analysis history
  - Log Entries DB: Reference grow logs

Operations:
  - updatePhoto(): Update photo with AI results
  - upsertHistory(): Create/update history record
  - linkLogEntry(): Link to related log entries
```

#### AI Vision Providers

**Potential Providers**:
- OpenAI (GPT-4 Vision)
- Anthropic (Claude 3 Opus/Sonnet)
- Google (Gemini Vision)

**Required Functionality**:
- Image analysis
- Plant health assessment
- Deficiency detection
- Growth stage identification
- Environmental condition evaluation

**Input**: Photo URLs + metadata
**Output**: Writebacks (health score, summary, recommendations)

## Security Architecture

### Authentication

**HMAC-SHA256 Signature Verification**:
```typescript
signature = HMAC-SHA256(secret, rawBody)
provided_sig = hex_decode(header['x-signature'])
is_valid = timingSafeEqual(signature, provided_sig)
```

**Benefits**:
- Request integrity verification
- Protection against tampering
- Replay attack mitigation (when combined with timestamps)
- Timing-safe comparison prevents timing attacks

### Security Controls

#### Network Layer
- HTTPS only (enforced by HSTS)
- Rate limiting: 100 requests/minute per IP
- Bypass mechanism: `x-rate-limit-bypass` header with secret token

#### Application Layer
- Body size limit: 1 MiB
- Request timeout: 30 seconds
- Connection timeout: 60 seconds

#### HTTP Headers (via Helmet)
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Input Validation

**Zod Schema Validation**:
- Runtime type checking
- Format validation (URLs, dates, enums)
- Range validation (health scores, array sizes)
- Required vs optional field enforcement

## Data Models

### Request Model

```typescript
interface AnalyzeRequest {
  action: "analyze_photos";              // Literal type
  source: "Grow Photos";                 // Literal type
  idempotency_scope: "photo_page_url+date";
  requested_fields_out: string[];
  jobs: AnalyzeJob[];                    // 1-100 items
}

interface AnalyzeJob {
  photo_page_url: string;                // Required URL
  photo_file_urls: string[];             // Required, 1+ URLs
  date: string;                          // Required YYYY-MM-DD
  photo_title?: string;
  angle?: PhotoAngle;                    // Enum: top, close, etc.
  plant_id?: PlantID;                    // Enum: BLUE, GREEN, etc.
  log_entry_url?: string;                // Optional URL
  stage?: string;
  room_name?: string;
  fixture?: string;
  photoperiod_h?: number;
  notes?: string;
}
```

### Response Model

```typescript
interface AnalyzeResponse {
  results: AnalyzeResult[];
  errors: string[];
}

interface AnalyzeResult {
  photo_page_url: string;
  status: "ok" | "error";
  error?: string;
  writebacks?: Writebacks;
}

interface Writebacks {
  "AI Summary"?: string;
  "Health 0-100"?: number;               // 0-100 integer
  "AI Next Step"?: AINextStep | string;  // Enum or custom
  "VPD OK"?: boolean;
  "DLI OK"?: boolean;
  "CO2 OK"?: boolean;
  "Trend"?: "Improving" | "Stable" | "Declining";
  "DLI mol"?: number;
  "VPD kPa"?: number;
  "Sev"?: "Low" | "Medium" | "High" | "Critical";
}
```

## Design Decisions

### Why Fastify?

**Chosen over Express for**:
- Superior performance (2-3x faster)
- Built-in schema validation support
- Plugin architecture
- TypeScript-first design
- Modern async/await patterns

### Why Zod?

**Chosen over alternatives for**:
- Runtime type safety
- TypeScript integration (infer types from schemas)
- Excellent error messages
- Composable schemas
- No decorators needed

### Why pnpm?

**Chosen over npm/yarn for**:
- Disk space efficiency (content-addressable storage)
- Strict dependency resolution
- Faster installation
- Better monorepo support (future)

### Why ES Modules?

**Chosen over CommonJS for**:
- Modern standard
- Better tree-shaking
- Native TypeScript support
- Future-proof
- Explicit dependencies

### Architectural Patterns

**Layered Architecture**:
- Clear separation of concerns
- Easy to test each layer
- Simple to understand and maintain

**Domain-Driven Design (Lite)**:
- Business logic in domain layer
- Clear data models
- Validation at boundaries

**Async-First**:
- All I/O operations are async
- Parallel job processing
- Promise-based APIs

## Future Architecture

### Phase 1: Notion Integration
```
[ API Service ] ← → [ Notion Client ]
                         │
                         ▼
                 [ Notion API ]
                   • Photos DB
                   • History DB
                   • Log Entries DB
```

### Phase 2: AI Integration
```
[ API Service ] ← → [ AI Provider Abstraction ]
                         │
                         ├─→ [ OpenAI Client ]
                         ├─→ [ Anthropic Client ]
                         └─→ [ Google AI Client ]
```

### Phase 3: Queue System
```
[ Webhook ] → [ API Service ] → [ Queue ]
                                    │
                                    ▼
                             [ Worker Process ]
                                    │
                                    ├─→ [ AI Analysis ]
                                    └─→ [ Notion Update ]
```

**Benefits**:
- Better reliability
- Scalability
- Retry logic
- Priority handling

### Phase 4: Observability
```
[ API Service ]
      │
      ├─→ [ Logging ] → [ Log Aggregation ]
      ├─→ [ Metrics ] → [ Monitoring Dashboard ]
      └─→ [ Tracing ] → [ Distributed Tracing ]
```

## Performance Considerations

**Current**:
- Synchronous job processing (sequential)
- In-memory rate limiting
- No caching

**Future Optimizations**:
- Parallel job processing with concurrency limits
- Redis-based rate limiting (for multi-instance)
- Response caching
- Connection pooling for external APIs
- Image preprocessing and optimization

## Deployment Architecture (Future)

```
[ Load Balancer ]
      │
      ├─→ [ API Instance 1 ]
      ├─→ [ API Instance 2 ]
      └─→ [ API Instance N ]
            │
            ├─→ [ Redis ] (Rate limiting, caching)
            ├─→ [ Queue ] (Job processing)
            └─→ [ Monitoring ]
```

## Maintenance & Operations

### Monitoring (Future)
- Request rate and latency
- Error rates by type
- External API response times
- Queue depth and processing times

### Logging
- Structured JSON logging (via Fastify)
- Request/response logging
- Error logging with stack traces
- Performance metrics

### Scaling Considerations
- Stateless design (easy horizontal scaling)
- Rate limiting per IP (may need Redis for multi-instance)
- Async job processing (can move to queue system)

---

**Document Version**: 1.0  
**Last Updated**: 2024-11-02  
**Status**: Living document - updated as architecture evolves
