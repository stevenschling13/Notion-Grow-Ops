import { Client } from "@notionhq/client";
import pLimit from "p-limit";
import { createHash } from "crypto";

// Rate limiting: 3 requests per second average
const limit = pLimit(3);
let lastRequestTime = Date.now();
const MIN_REQUEST_INTERVAL = 333; // ~3 requests/second

interface NotionRetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
}

const RETRY_CONFIG: NotionRetryConfig = {
  maxRetries: 5,
  initialDelay: 1000,
  maxDelay: 32000,
};

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

/**
 * Extract a 32-hex ID with hyphens from a Notion URL
 */
export function extractIdFromUrl(url: string): string {
  // Notion URLs can be in formats like:
  // https://www.notion.so/{workspace}/{title}-{id}
  // https://www.notion.so/{id}
  const match = url.match(/([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
  if (!match) {
    throw new Error(`Invalid Notion URL: ${url}`);
  }
  
  const id = match[1];
  // Ensure it has hyphens in the UUID format
  if (id.length === 32) {
    return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
  }
  return id;
}

/**
 * Sleep with jitter for exponential backoff
 */
function sleep(ms: number, jitter = true): Promise<void> {
  const delay = jitter ? ms * (0.5 + Math.random() * 0.5) : ms;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Rate-limit requests to respect Notion API limits
 */
async function rateLimitedRequest<T>(fn: () => Promise<T>): Promise<T> {
  return limit(async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await sleep(MIN_REQUEST_INTERVAL - timeSinceLastRequest, false);
    }
    lastRequestTime = Date.now();
    return fn();
  });
}

/**
 * Retry a function with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  config = RETRY_CONFIG
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // If it's a 429 rate limit error, respect the Retry-After header
      if (error?.status === 429 || error?.code === "rate_limited") {
        const retryAfter = error?.headers?.["retry-after"];
        const retryAfterMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : NaN;
        const delayMs = !isNaN(retryAfterMs) && retryAfterMs > 0
          ? retryAfterMs
          : Math.min(config.initialDelay * Math.pow(2, attempt), config.maxDelay);
        
        if (attempt < config.maxRetries) {
          await sleep(delayMs);
          continue;
        }
      }
      
      // For other errors, don't retry
      throw error;
    }
  }
  
  throw lastError || new Error("Max retries exceeded");
}

/**
 * Map writebacks to Notion property format
 */
function mapPropertiesToNotion(props: Record<string, unknown>): Record<string, any> {
  const notionProps: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) continue;
    
    if (typeof value === "string") {
      notionProps[key] = { rich_text: [{ text: { content: value } }] };
    } else if (typeof value === "number") {
      notionProps[key] = { number: value };
    } else if (typeof value === "boolean") {
      notionProps[key] = { checkbox: value };
    } else if (Array.isArray(value) && value.every(v => typeof v === "string" && v.startsWith("http"))) {
      // Relation property (array of URLs)
      notionProps[key] = { 
        relation: value.map(url => ({ id: extractIdFromUrl(url) }))
      };
    }
  }
  
  return notionProps;
}

/**
 * Update a Photos database page
 */
export async function updatePhoto(
  pageUrl: string,
  props: Record<string, unknown>
): Promise<void> {
  const pageId = extractIdFromUrl(pageUrl);
  
  // Add AI Status and Reviewed at
  const allProps = {
    ...props,
    "AI Status": "Reviewed",
    "Reviewed at": new Date().toISOString(),
  };
  
  const notionProps = mapPropertiesToNotion(allProps);
  
  await withRetry(() => 
    rateLimitedRequest(() => 
      notion.pages.update({
        page_id: pageId,
        properties: notionProps,
      })
    )
  );
}

/**
 * Find an existing AI History page by Related Photo and Date
 */
async function findHistoryPage(
  photoPageId: string,
  date: string
): Promise<string | null> {
  const dbId = process.env.AI_HISTORY_DB_ID;
  if (!dbId) {
    throw new Error("AI_HISTORY_DB_ID not configured");
  }
  
  try {
    const response = await withRetry(() =>
      rateLimitedRequest(() =>
        notion.databases.query({
          database_id: dbId,
          filter: {
            and: [
              {
                property: "Related Photo",
                relation: { contains: photoPageId },
              },
              {
                property: "Date",
                date: { equals: date },
              },
            ],
          },
        })
      )
    );
    
    if (response.results.length > 0) {
      return response.results[0].id;
    }
  } catch (error: any) {
    // If the query fails (e.g., property doesn't exist), we'll create a new page
    console.warn(`Failed to query AI History: ${error.message}`);
  }
  
  return null;
}

/**
 * Upsert an AI History page
 */
export async function upsertHistory(
  key: string,
  props: Record<string, unknown>
): Promise<void> {
  const dbId = process.env.AI_HISTORY_DB_ID;
  if (!dbId) {
    throw new Error("AI_HISTORY_DB_ID not configured");
  }
  
  // Extract photo page ID and date from props
  const relatedPhotoUrls = props["Related Photo"] as string[];
  const date = props["Date"] as string;
  
  if (!relatedPhotoUrls?.[0] || !date) {
    throw new Error("Related Photo and Date are required for AI History");
  }
  
  const photoPageId = extractIdFromUrl(relatedPhotoUrls[0]);
  
  // Try to find existing page
  const existingPageId = await findHistoryPage(photoPageId, date);
  
  // Add Status: Complete
  const allProps = {
    ...props,
    Status: "Complete",
  };
  
  const notionProps = mapPropertiesToNotion(allProps);
  
  if (existingPageId) {
    // Update existing page
    await withRetry(() =>
      rateLimitedRequest(() =>
        notion.pages.update({
          page_id: existingPageId,
          properties: notionProps,
        })
      )
    );
  } else {
    // Create new page
    await withRetry(() =>
      rateLimitedRequest(() =>
        notion.pages.create({
          parent: { database_id: dbId },
          properties: notionProps,
        })
      )
    );
  }
}

/**
 * Generate a unique key for idempotency
 */
export function generateKey(photoPageUrl: string, date: string): string {
  return createHash("sha256")
    .update(`${photoPageUrl}|${date}`)
    .digest("hex");
}
