# Notion Grow Ops

An experimental Fastify service that receives webhook requests from Notion "Grow Photos" automations, verifies integrity with HMAC, runs a lightweight photo analysis heuristic, and prepares writebacks for Photos and AI History databases.

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer (tested with Node 20)
- [pnpm](https://pnpm.io/) 9+

## Getting started

```bash
pnpm install
pnpm run dev
```

The development server listens on `http://localhost:8080` by default. Set `PORT` to override the port.

## Environment configuration

The service expects an `HMAC_SECRET` to authenticate inbound requests. Copy `.env.example` (create it if needed) and define:

```env
HMAC_SECRET=super-secret
```

Optional variables enable advanced behaviour:

- `ENABLE_NOTION_SYNC` – when set to `true`, computed writebacks are appended to an NDJSON outbox under `.notion-sync/outbox.ndjson` for delivery by a separate worker.
- `NOTION_API_TOKEN`, `NOTION_PHOTOS_DB_ID`, `NOTION_HISTORY_DB_ID` – required when `ENABLE_NOTION_SYNC=true`. They are persisted in the outbox for downstream workers.
- `NOTION_SYNC_OUTBOX` – optional path (absolute or relative) for the NDJSON outbox file.

Invalid or incomplete configurations fail fast during boot so that misconfigured deployments surface immediately.

## Testing & linting

```bash
pnpm run lint
pnpm run typecheck
pnpm run test -- --run
```

CI executes the same commands with a frozen lockfile to guarantee deterministic installs and to surface type errors.

## Project layout

- `src/routes/analyze.ts` – Fastify route plugin that performs request validation, HMAC verification, heuristic analysis, and Notion writeback queuing.
- `src/domain/` – payload schemas and Notion property mapping helpers with associated unit tests under `test/`.
- `src/services/notion.ts` – filesystem-backed Notion sync queue used when `ENABLE_NOTION_SYNC` is enabled.
- `src/config/env.ts` – environment validation powered by Zod.

## Notion sync outbox

When Notion sync is enabled, every successful analysis appends a line-delimited JSON object to the configured outbox. Downstream automation can tail this file and push updates to Notion using the supplied database identifiers and computed properties. The service logs the outbox location on first write.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for workflow details.
