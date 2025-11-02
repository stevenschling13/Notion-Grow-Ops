# Notion Grow Ops

A hardened Fastify-based webhook processor that ingests AI analysis jobs for grow operations, validates and authenticates each request, and prepares Notion-compatible write backs for photo and history databases.

## Table of contents

- [Architecture](#architecture)
- [Features](#features)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Running in development](#running-in-development)
- [Testing](#testing)
- [Request lifecycle](#request-lifecycle)
- [Extending the pipeline](#extending-the-pipeline)
- [Troubleshooting](#troubleshooting)

## Architecture

```text
src/
├── config.ts             # Strongly typed environment loader
├── domain/
│   ├── mapping.ts        # Notion property builders
│   └── payload.ts        # Zod schemas for external contracts
├── routes/
│   └── analyze.ts        # /analyze webhook handler
├── security/
│   └── hmac.ts           # Signing & verification helpers
├── server.ts             # Fastify factory with plugin wiring
└── index.ts              # Application bootstrap
```

The application is intentionally modular:

- **Domain** contains pure mapping and validation logic that can be exercised in isolation.
- **Routes** lean on the domain layer and infrastructure services to keep HTTP concerns isolated.
- **Security** packages reusable HMAC helpers shared between runtime code and tests.
- **Config** parses and validates environment variables once and shares the resulting contract with Fastify.

## Features

- Deterministic HMAC verification with format validation to prevent timing side channels from malformed signatures.
- Strict schema validation for inbound requests powered by `zod` with actionable error responses.
- Normalized Notion property builders for both photo updates and AI history upserts, including a stable SHA-256 key derived from page URL + date.
- Config-driven server bootstrapping with safe defaults and optional Notion integration flags (dry-run by default).
- Comprehensive unit tests covering route authentication, mapping utilities, and security helpers.

## Getting started

```bash
pnpm install
pnpm run build
pnpm run start
```

> **Note** PNPM is recommended for deterministic installs. `npm` and `yarn` will also work if your environment standardizes on them.

## Configuration

All configuration is supplied via environment variables and validated at boot time. Only `HMAC_SECRET` is mandatory; Notion integration variables are optional but must be provided together.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `HMAC_SECRET` | ✅ | – | Shared secret used to sign inbound webhook requests. |
| `PORT` | ❌ | `8080` | Listening port for the HTTP server. |
| `LOG_LEVEL` | ❌ | `info` | Fastify logger level (`fatal`, `error`, `warn`, `info`, `debug`, `trace`, `silent`). |
| `NOTION_API_KEY` | ⚠️ | – | Notion integration token; required with `NOTION_PHOTOS_DB_ID` to enable syncing. |
| `NOTION_PHOTOS_DB_ID` | ⚠️ | – | Notion database identifier for Grow Photos updates. |
| `NOTION_HISTORY_DB_ID` | ⚠️ | – | Optional Notion database identifier for AI history entries. |
| `NOTION_HISTORY_KEY_PROP` | ❌ | `Key` | Property name that stores the deduplicated job hash inside the history database. |
| `NOTION_DRY_RUN` | ❌ | `true` | When `true`, Notion operations are logged instead of executed. |
| `NOTION_TIMEOUT_MS` | ❌ | `10000` | Timeout in milliseconds for Notion API operations. |

> ⚠️ `NOTION_API_KEY` and `NOTION_PHOTOS_DB_ID` must be supplied together. `NOTION_HISTORY_DB_ID` is only honoured when both required values are present.

## Running in development

1. Copy `.env.example` (create one if needed) and populate the variables above.
2. Start the watcher:
   ```bash
   pnpm run dev
   ```
3. Send a signed request:
   ```bash
   body='{"action":"analyze_photos","source":"Grow Photos","idempotency_scope":"photo_page_url+date","requested_fields_out":[],"jobs":[{"photo_page_url":"https://example.com/page","photo_file_urls":["https://example.com/photo.jpg"],"date":"2024-01-01"}]}'
   signature=$(node -e "console.log(require('./dist/security/hmac.js').sign(process.argv[1], process.env.HMAC_SECRET))" "$body")
   curl -X POST http://localhost:8080/analyze \
     -H "content-type: application/json" \
     -H "x-signature: $signature" \
     -d "$body"
   ```

The response returns mock writebacks until a real vision provider is integrated.

## Testing

```bash
pnpm run test
```

Vitest covers both HTTP behaviour (HMAC enforcement) and pure utility logic (mapping + HMAC helpers). Add new tests alongside your modules under `test/`.

## Request lifecycle

1. **Authentication** – Every request must include `x-signature`; the server validates format and timing-safe comparison against the canonical HMAC digest.
2. **Validation** – Payloads are parsed via `AnalyzeRequestSchema`; failures return `400` with flattened error details.
3. **Processing** – Each job is processed sequentially. The template implementation mocks the AI response, but the mapping and history key helpers are production-ready.
4. **Response** – Successful jobs return their writebacks; failures bubble up as structured errors while leaving the original data unchanged.

## Extending the pipeline

- **Vision Provider** – Implement a provider with signature `analyze(job: AnalyzeJob): Promise<Writebacks>` and replace the mock block in `routes/analyze.ts`.
- **Notion Sync** – Consume `mapWritebacksToPhotos` and `buildHistoryProps` outputs in your Notion client. The `buildHistoryKey` helper gives you a deterministic dedupe key to avoid duplicate history rows.
- **Observability** – Fastify is preconfigured with a structured logger. Hook into Fastify's lifecycle hooks (`onRequest`, `onResponse`, etc.) to add tracing, metrics, or Sentry instrumentation.

## Troubleshooting

| Symptom | Likely cause | Resolution |
| --- | --- | --- |
| `Configuration error: HMAC_SECRET is required` | Missing secret | Set `HMAC_SECRET` in your environment before starting the server. |
| `401 unauthorized` response | Missing `x-signature` header | Sign the payload using the shared secret and send it in `x-signature`. |
| `401 bad signature` | Signature mismatch or malformed hex | Ensure the signature is lowercase hex and generated from the exact request body. |
| Request logs appear during tests | `LOG_LEVEL` defaulting to `info` | Set `LOG_LEVEL=silent` in your test environment or pass `{ logLevel: "silent" }` to `buildServer`. |

