# Notion-Grow-Ops

Minimal service to analyze grow photos and write results back to Notion.

## Notion property mapping

### Databases and properties

- Photos: Grow Photos (https://www.notion.so/2c16d78dc1e54e38a0a1ff08dbafcffe?pvs=21)
  - Title: Photo Title
  - Date: Date
  - Angle: Angle (select: top, close, under-canopy, trichomes, tent, bud-site, deficiency, canopy, stem, roots, other)
  - File: File
  - Log Entry: relation -> Master Grow Log — Pro v2
  - AI fields (writeback):
    - AI Summary (text)
    - Health 0-100 (number)
    - AI Next Step (sel) (select shared with log) or AI Next Step (text)
    - VPD OK, DLI OK, CO2 OK (checkbox)
    - Trend (select: Improving, Stable, Declining)
    - AI Status (status: Draft, Reviewed, Actioned)
    - Reviewed at (date)
    - AI Analysis (text, used for error notes)
- Grow Log: Master Grow Log — Pro v2 (https://www.notion.so/820b15041a6240d89ff7d66bf9a686de?pvs=21)
  - Entry (title)
  - Plant (relation) to Plants & Zones
  - Stage (select)
  - Flip, Date, Stage0, Reviewed at (date)
  - AI Status, AI Next Step (status/select)
  - Rollups (read-only for service): Latest Photo Health, Latest Photo Summary, Latest Photo Journal
- AI History (canonical): AI History (https://www.notion.so/7b15264afc9e4d8485a6c62bc2d9b72e?pvs=21)
  - Name (title): "{plant_id} — {date} — {angle}"
  - Related Photo (relation -> Grow Photos)
  - Related Log Entry (relation -> Grow Log)
  - Date (date)
  - Health 0–100 (number)
  - AI Summary (text)
  - DLI mol (number)
  - VPD kPa (number)
  - VPD OK, DLI OK, CO2 OK (checkbox)
  - Sev (select: Low, Medium, High, Critical)
  - userDefined:ID (select: BLUE, GREEN, OUTDOOR-A, OUTDOOR-B)
  - Status (select: Waiting on analysis, Complete)

### Writeback rules

- Photos: set AI fields, then AI Status -> Reviewed and Reviewed at = now on success; on failure keep Draft and append error to AI Analysis.
- AI History: idempotent upsert by sha256(photo_page_url + date). Create if missing, otherwise update.
- Grow Log: no direct writes; rollups surface latest photo insights automatically.

### Idempotency

- Key: photo_page_url + date
- Re-sends update the same AI History row and re-set Photos fields safely.

### Security

- HMAC (X-Signature) over raw request body with HMAC_SECRET.
- Limit batch size <=100 and file size caps; stream downloads to TMP_DIR.

## Webhook contract (concise)

- Request: matches your dashboard button payload (see /src/domain/payload.ts).
- Response: per-job status + writebacks; never block the whole batch on per-job errors.

## Quick start

```bash
cp .env.example .env
# edit HMAC_SECRET, NOTION_TOKEN, TMP_DIR as needed
pnpm install
pnpm dev
# POST to http://localhost:8080/analyze with your dashboard cURL
```

## cURL quick test

Use the cURL on your Today Dashboard (replace YOUR_ANALYZER_URL). Ensure NOTION_* env vars are set and the token has edit access to Photos and AI History.
