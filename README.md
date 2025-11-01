# Notion Grow Ops - MCP Setup

This service integrates with Notion using the Model Context Protocol (MCP) to analyze plant growth photos and automatically update Notion databases with AI-generated insights.

## Notion MCP Setup Guide

### Prerequisites

1. **Node.js**: Ensure Node.js (>= 20) is installed on your system
2. **Notion Account**: You need a Notion workspace with appropriate permissions

### Step 1: Create a Notion Integration

1. Visit [Notion Integrations](https://www.notion.so/my-integrations)
2. Click **"+ New integration"**
3. Name it (e.g., "Grow Ops AI Assistant")
4. Select your workspace
5. Grant the following permissions:
   - Read content
   - Update content
   - Insert content
6. Click **Submit**
7. Copy your **Internal Integration Token** (starts with `secret_...`)

### Step 2: Set Up Notion Databases

You'll need two databases in your Notion workspace:

#### Photos Database
This database stores your grow photos with the following properties:
- `AI Summary` (Text)
- `Health 0-100` (Number)
- `AI Next Step` (Select or Text)
- `VPD OK` (Checkbox)
- `DLI OK` (Checkbox)
- `CO2 OK` (Checkbox)
- `Trend` (Select: Improving, Stable, Declining)
- `DLI mol` (Number)
- `VPD kPa` (Number)
- `AI Status` (Select or Text)
- `Reviewed at` (Date)

#### AI History Database
This database tracks the history of AI analyses:
- `Key` (Text) - Unique identifier for each analysis
- `Name` (Title)
- `Related Photo` (Relation to Photos DB)
- `Date` (Date)
- `Related Log Entry` (Relation - optional)
- `userDefined:ID` (Text) - Plant ID
- `AI Summary` (Text)
- `Health 0-100` (Number)
- `DLI mol` (Number)
- `VPD kPa` (Number)
- `VPD OK` (Checkbox)
- `DLI OK` (Checkbox)
- `CO2 OK` (Checkbox)
- `Sev` (Select: Low, Medium, High, Critical)
- `Status` (Select or Text)

### Step 3: Share Databases with Your Integration

1. Open each database in Notion
2. Click the **⋯** (three dots) menu in the top right
3. Select **"Add connections"**
4. Choose your integration (e.g., "Grow Ops AI Assistant")

### Step 4: Get Database IDs

1. Open a database in Notion
2. Copy the URL from your browser
3. Extract the database ID from the URL:
   - URL format: `https://www.notion.so/{workspace}/{database_id}?v=...`
   - The database ID is the 32-character string (or UUID format with dashes)
4. Repeat for both databases

### Step 5: Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Notion API Configuration
NOTION_API_TOKEN=secret_your_integration_token_here

# Notion Database IDs
NOTION_PHOTOS_DB_ID=your_photos_database_id_here
NOTION_HISTORY_DB_ID=your_history_database_id_here

# HMAC Secret for API Security
HMAC_SECRET=your_secure_hmac_secret_here

# Server Configuration
PORT=8080
```

### Step 6: Install Dependencies

```bash
npm install
```

### Step 7: Build and Run

```bash
# Build the TypeScript project
npm run build

# Start the server
npm start

# Or run in development mode with auto-reload
npm run dev
```

## API Usage

### Analyze Photos Endpoint

**POST** `/analyze`

Headers:
- `Content-Type: application/json`
- `x-signature: <HMAC-SHA256 signature of request body>`

Request body:
```json
{
  "action": "analyze_photos",
  "source": "Grow Photos",
  "idempotency_scope": "photo_page_url+date",
  "requested_fields_out": ["AI Summary", "Health 0-100", "AI Next Step"],
  "jobs": [
    {
      "photo_page_url": "https://www.notion.so/your-page-url",
      "photo_file_urls": ["https://example.com/photo.jpg"],
      "date": "2024-01-15",
      "plant_id": "BLUE",
      "angle": "canopy",
      "log_entry_url": "https://www.notion.so/log-entry"
    }
  ]
}
```

Response:
```json
{
  "results": [
    {
      "photo_page_url": "https://www.notion.so/your-page-url",
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

## How Notion Integration Works

1. **Photo Analysis**: When photos are analyzed, the service automatically updates the corresponding Notion page with AI-generated insights.

2. **History Tracking**: Each analysis creates or updates an entry in the AI History database, allowing you to track changes over time.

3. **Automatic Property Mapping**: The service intelligently maps different data types (text, numbers, checkboxes, dates, relations) to Notion's property format.

4. **Optional Integration**: If `NOTION_API_TOKEN` is not set, the service will still run but won't write to Notion.

## Troubleshooting

### "Invalid Notion page URL"
- Ensure the page URL is a valid Notion URL
- Verify the integration has access to the page

### "History database ID not configured"
- Set `NOTION_HISTORY_DB_ID` in your `.env` file
- Make sure to share the database with your integration

### Authentication Errors
- Verify your `NOTION_API_TOKEN` is correct
- Check that the token starts with `secret_`
- Ensure the integration hasn't been revoked

### Permission Errors
- Verify the integration has the required permissions (Read, Update, Insert content)
- Make sure databases are shared with the integration

## Further Resources

- [Notion API Documentation](https://developers.notion.com/)
- [Notion MCP Documentation](https://developers.notion.com/docs/mcp)
- [Notion Integration Gallery](https://mcp.notion.com/gallery)

## Security Notes

- Never commit your `.env` file or expose your `NOTION_API_TOKEN`
- Use a strong `HMAC_SECRET` for API request verification
- Regularly rotate your integration tokens
- Review and limit the permissions granted to your integration
