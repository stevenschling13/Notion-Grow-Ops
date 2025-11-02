# Notion-Grow-Ops

TypeScript/Node.js API server for analyzing grow operation photos and integrating with Notion databases.

## Features

- **Fastify-based API Server**: Fast and efficient REST API
- **HMAC Authentication**: Secure webhook request validation
- **Notion Integration**: Automated updates to Notion databases
- **Photo Analysis**: Process and analyze plant photos (AI integration ready)
- **Type-Safe**: Full TypeScript implementation with Zod validation

## Tech Stack

- **Runtime**: Node.js >= 20
- **Language**: TypeScript 5.6+ with strict mode
- **Web Framework**: Fastify 4.x
- **Validation**: Zod for schema validation
- **Notion SDK**: @notionhq/client for Notion API integration
- **Testing**: Vitest
- **Package Manager**: pnpm (version 9)

## Prerequisites

1. Node.js >= 20
2. pnpm 9.x
3. A Notion workspace with appropriate databases set up

## Installation

```bash
# Install pnpm if not already installed
npm install -g pnpm@9

# Install dependencies
pnpm install

# Build the project
pnpm run build
```

## Configuration

Create a `.env` file in the project root with the following variables:

```bash
# Server Configuration
PORT=8080

# Security
HMAC_SECRET=your-webhook-secret-key

# Notion Integration
NOTION_API_TOKEN=secret_your_notion_integration_token
NOTION_HISTORY_DB_ID=your-history-database-id
```

### Setting up Notion Integration

1. **Create a Notion Integration**:
   - Go to https://www.notion.so/my-integrations
   - Click "+ New integration"
   - Name it (e.g., "Grow Ops API")
   - Select the workspace to connect to
   - Copy the "Internal Integration Token" - this is your `NOTION_API_TOKEN`

2. **Share databases with the integration**:
   - Open your "Grow Photos" database in Notion
   - Click the "..." menu in the top right
   - Go to "Connections" → "Add connections"
   - Select your integration
   - Repeat for "AI History" database

3. **Get Database IDs**:
   - Open the "AI History" database in Notion
   - Copy the database ID from the URL:
     - URL format: `https://notion.so/{workspace}/{database_id}?v=...`
     - The database ID is the 32-character string (with or without hyphens)
   - Set this as `NOTION_HISTORY_DB_ID`

### Required Notion Database Structure

#### Grow Photos Database
This database should have the following properties:
- **AI Summary** (Text): Summary of AI analysis
- **Health 0-100** (Number): Plant health score
- **AI Next Step** (Text): Recommended next action
- **AI Next Step (sel)** (Select): Recommended action as select option
- **VPD OK** (Checkbox): Vapor Pressure Deficit status
- **DLI OK** (Checkbox): Daily Light Integral status
- **CO2 OK** (Checkbox): CO2 level status
- **Trend** (Select): Health trend (Improving/Stable/Declining)
- **DLI mol** (Number): DLI measurement
- **VPD kPa** (Number): VPD measurement
- **AI Status** (Text/Select): Processing status
- **Reviewed at** (Date): Timestamp of review

#### AI History Database
This database should have the following properties:
- **Key** (Text): Unique identifier for deduplication
- **Name** (Title): Entry name
- **Date** (Date): Analysis date
- **Related Photo** (Relation): Link to photo page
- **Related Log Entry** (Relation): Link to log entry
- **userDefined:ID** (Text): Plant identifier
- **AI Summary** (Text): Analysis summary
- **Health 0-100** (Number): Health score
- **DLI mol** (Number): DLI value
- **VPD kPa** (Number): VPD value
- **VPD OK** (Checkbox): VPD status
- **DLI OK** (Checkbox): DLI status
- **CO2 OK** (Checkbox): CO2 status
- **Sev** (Select): Severity level
- **Status** (Select): Entry status

## Usage

### Development Mode

```bash
pnpm run dev
```

This starts the server with hot reload using `tsx watch`.

### Production Mode

```bash
# Build first
pnpm run build

# Start the server
pnpm run start
```

### API Endpoint

#### POST /analyze

Analyzes plant photos and updates Notion databases.

**Authentication**: HMAC signature via `x-signature` header

**Request Body**:
```json
{
  "action": "analyze_photos",
  "source": "Grow Photos",
  "idempotency_scope": "photo_page_url+date",
  "requested_fields_out": ["AI Summary", "Health 0-100"],
  "jobs": [
    {
      "photo_page_url": "https://notion.so/page-id",
      "photo_file_urls": ["https://example.com/photo.jpg"],
      "date": "2024-01-01",
      "plant_id": "BLUE",
      "angle": "top",
      "log_entry_url": "https://notion.so/log-entry-id"
    }
  ]
}
```

**Response**:
```json
{
  "results": [
    {
      "photo_page_url": "https://notion.so/page-id",
      "status": "ok",
      "writebacks": {
        "AI Summary": "Healthy canopy...",
        "Health 0-100": 88
      }
    }
  ],
  "errors": []
}
```

## Development

### Available Scripts

- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Compile TypeScript to JavaScript
- `pnpm run start` - Run the compiled application
- `pnpm run lint` - Run ESLint
- `pnpm run typecheck` - Run TypeScript type checking
- `pnpm test` - Run tests with Vitest
- `pnpm test -- --run` - Run tests in CI mode (no watch)

### Running Tests

```bash
# Watch mode (for development)
pnpm test

# Run once (for CI)
pnpm test -- --run
```

### Code Quality

```bash
# Type checking
pnpm run typecheck

# Linting
pnpm run lint

# Build (includes type checking)
pnpm run build
```

## Project Structure

```
src/
├── index.ts          # Application entry point
├── server.ts         # Fastify server setup
├── routes/           # API route handlers
│   └── analyze.ts    # POST /analyze endpoint
├── domain/           # Business logic and schemas
│   ├── payload.ts    # Zod schemas for request/response
│   └── mapping.ts    # Data transformation logic
└── notion/           # Notion API integration
    └── client.ts     # Notion client wrapper

test/                 # Test files
├── hmac.test.ts      # HMAC authentication tests
└── notion.test.ts    # Notion client tests
```

## Security

1. **HMAC Verification**: All webhook requests are verified using SHA256 HMAC
2. **Environment Variables**: Sensitive data stored in `.env` (not committed)
3. **Input Validation**: All requests validated with Zod schemas
4. **Type Safety**: Strict TypeScript compilation

## Notion Integration Details

The application integrates with Notion in two ways:

1. **Update Photo Pages**: When analysis completes, the photo page in the "Grow Photos" database is updated with:
   - AI-generated analysis summary
   - Health metrics (VPD, DLI, CO2 status)
   - Health score (0-100)
   - Recommended next steps
   - Review timestamp and status

2. **Upsert History Entries**: Creates or updates entries in the "AI History" database for:
   - Historical tracking of analyses
   - Deduplication using SHA256 hash of (photo_url + date)
   - Linking to related photos and log entries
   - Tracking plant health trends over time

### How It Works

1. Webhook request received with photo information
2. HMAC signature validated for security
3. Request payload validated with Zod schemas
4. Photo analysis performed (currently uses mock data, ready for AI integration)
5. If Notion is configured:
   - Photo page updated with analysis results
   - History entry created/updated in AI History database
6. Response returned with results and any errors

## Troubleshooting

### "NOTION_API_TOKEN environment variable is not set"

Make sure you have created a `.env` file with your Notion integration token.

### "NOTION_HISTORY_DB_ID environment variable is not set"

Add the AI History database ID to your `.env` file.

### Cannot connect to Notion

1. Verify your `NOTION_API_TOKEN` is correct
2. Ensure your databases are shared with the integration
3. Check that database IDs are correct (32-character hex strings)

### Tests failing

Make sure to run `pnpm install` and `pnpm run build` before running tests.

## License

Private project - All rights reserved

## Contributing

This is a private project. If you have access and want to contribute:

1. Create a feature branch
2. Make your changes
3. Run tests: `pnpm test -- --run`
4. Run type check: `pnpm run typecheck`
5. Run linter: `pnpm run lint`
6. Submit a pull request
