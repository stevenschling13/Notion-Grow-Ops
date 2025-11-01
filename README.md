# Notion Grow Ops

AI-powered photo analysis webhook service for Notion grow databases.

## Features

- 🔒 Secure HMAC webhook verification with constant-time comparison
- 🤖 AI photo analysis integration
- 📊 Automatic updates to Notion Photos and AI History databases
- ⚡ Rate-limited Notion API client with retry logic
- 🧪 Comprehensive test coverage

## Setup

### Prerequisites

- Node.js 20 or higher
- pnpm 9.x
- Notion integration with access to your databases

### Installation

```bash
pnpm install
```

### Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configure the following environment variables:

   - `HMAC_SECRET`: Secret key for webhook signature verification
   - `NOTION_TOKEN`: Your Notion integration token
   - `PHOTOS_DB_ID`: ID of your Photos database
   - `AI_HISTORY_DB_ID`: ID of your AI History database
   - `TMP_DIR`: Directory for temporary files (default: `/tmp`)
   - `PORT`: Server port (default: `8080`)

### Getting Notion Credentials

1. **Create a Notion Integration**:
   - Go to https://www.notion.so/my-integrations
   - Click "New integration"
   - Give it a name and select the workspace
   - Copy the "Internal Integration Token" to `NOTION_TOKEN`

2. **Get Database IDs**:
   - Open your Photos database in Notion
   - Copy the URL, extract the 32-character ID
   - Set as `PHOTOS_DB_ID`
   - Repeat for AI History database

3. **Grant Access**:
   - Open each database in Notion
   - Click "..." menu → "Add connections"
   - Select your integration

### Verify Setup

Check that your Notion databases are accessible:

```bash
pnpm notion:check
```

## Development

### Build

```bash
pnpm build
```

### Start Development Server

```bash
pnpm dev
```

The server will start on `http://localhost:8080` (or the port specified in `PORT`).

### Run Tests

```bash
pnpm test -- --run
```

### Lint and Type Check

```bash
pnpm lint
pnpm typecheck
```

## Testing the Webhook

### Local curl Test

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. In another terminal, send a test request:

   ```bash
   # Create test payload
   PAYLOAD='{"action":"analyze_photos","source":"Grow Photos","idempotency_scope":"photo_page_url+date","requested_fields_out":[],"jobs":[{"photo_page_url":"https://notion.so/test-12345678901234567890123456789012","photo_file_urls":["https://example.com/photo.jpg"],"date":"2024-01-01"}]}'
   
   # Generate HMAC signature
   SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "change-me" | awk '{print $2}')
   
   # Send request
   curl -X POST http://localhost:8080/analyze \
     -H "Content-Type: application/json" \
     -H "X-Signature: $SIGNATURE" \
     -d "$PAYLOAD"
   ```

3. Expected response:
   ```json
   {
     "results": [
       {
         "photo_page_url": "https://notion.so/test-12345678901234567890123456789012",
         "status": "ok",
         "writebacks": { ... }
       }
     ],
     "errors": []
   }
   ```

## Deploy

### Production Build

```bash
pnpm build
pnpm start
```

### Environment Variables

Ensure all environment variables are set in your production environment:
- `HMAC_SECRET` (use a strong random value)
- `NOTION_TOKEN`
- `PHOTOS_DB_ID`
- `AI_HISTORY_DB_ID`
- `TMP_DIR`
- `PORT`

## API

### POST /analyze

Analyzes photos and updates Notion databases.

**Headers:**
- `Content-Type: application/json`
- `X-Signature`: HMAC-SHA256 signature of request body

**Body:**
```json
{
  "action": "analyze_photos",
  "source": "Grow Photos",
  "idempotency_scope": "photo_page_url+date",
  "requested_fields_out": ["AI Summary", "Health 0-100"],
  "jobs": [
    {
      "photo_page_url": "https://notion.so/...",
      "photo_file_urls": ["https://..."],
      "date": "2024-01-01",
      "angle": "top",
      "plant_id": "BLUE"
    }
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "photo_page_url": "https://notion.so/...",
      "status": "ok",
      "writebacks": {
        "AI Summary": "...",
        "Health 0-100": 88
      }
    }
  ],
  "errors": []
}
```

## Security

- All webhook requests must include a valid HMAC signature
- Signature verification uses constant-time comparison to prevent timing attacks
- No secrets or tokens are committed to the repository

## License

MIT
