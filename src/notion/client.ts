import { Client } from "@notionhq/client";
import type {
  UpdatePageParameters,
  CreatePageParameters,
  QueryDataSourceParameters,
} from "@notionhq/client/build/src/api-endpoints.js";

export class NotionClient {
  private client: Client;

  constructor(auth: string) {
    this.client = new Client({ auth });
  }

  /**
   * Update properties of a Photo page in Notion
   * @param pageUrl - The Notion page URL (e.g., https://notion.so/...)
   * @param properties - Key-value pairs of properties to update
   */
  async updatePhoto(pageUrl: string, properties: Record<string, unknown>): Promise<void> {
    const pageId = this.extractPageId(pageUrl);
    const notionProperties = this.convertToNotionProperties(properties);

    await this.client.pages.update({
      page_id: pageId,
      properties: notionProperties as UpdatePageParameters["properties"],
    });
  }

  /**
   * Upsert a history entry in the AI History database
   * Creates a new page if it doesn't exist, or updates if it does
   * @param key - Unique identifier for the history entry (e.g., sha256 hash)
   * @param properties - Properties for the history entry
   * 
   * Note: This implementation uses Notion SDK v5.x which introduced the "Data Sources" API.
   * In v5.x, databases are queried using client.dataSources.query() with data_source_id,
   * replacing the older databases.query() API from v2.x-4.x.
   * However, page creation still uses database_id in the parent field.
   */
  async upsertHistory(key: string, properties: Record<string, unknown>): Promise<void> {
    // First, check if a page with this key exists using the database query
    // Note: In Notion SDK v5.x, databases are queried via dataSources.query()
    const historyDbId = process.env.NOTION_HISTORY_DB_ID;
    if (!historyDbId) {
      throw new Error("NOTION_HISTORY_DB_ID environment variable is not set");
    }

    // Query for existing page with the same key using dataSources API (v5.x)
    const queryParams: QueryDataSourceParameters = {
      data_source_id: historyDbId,
      filter: {
        property: "Key",
        rich_text: {
          equals: key,
        },
      },
    };
    const existingPages = await this.client.dataSources.query(queryParams);

    const notionProperties = this.convertToNotionProperties({ ...properties, Key: key });

    if (existingPages.results.length > 0) {
      // Update existing page
      const pageId = existingPages.results[0].id;
      await this.client.pages.update({
        page_id: pageId,
        properties: notionProperties as UpdatePageParameters["properties"],
      });
    } else {
      // Create new page - note that parent uses database_id, not data_source_id
      await this.client.pages.create({
        parent: { type: "database_id", database_id: historyDbId },
        properties: notionProperties as CreatePageParameters["properties"],
      });
    }
  }

  /**
   * Extract page ID from a Notion URL
   * Supports various Notion URL formats
   */
  private extractPageId(url: string): string {
    // Notion URLs can be in formats like:
    // https://www.notion.so/workspace/Page-Title-{pageId}
    // https://www.notion.so/{pageId}
    // Extract the 32-character UUID (with or without hyphens)
    const match = url.match(/([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
    if (!match) {
      throw new Error(`Invalid Notion page URL: ${url}`);
    }
    // Remove hyphens to get raw ID
    return match[1].replace(/-/g, "");
  }

  /**
   * Convert plain JavaScript objects to Notion property format
   */
  private convertToNotionProperties(properties: Record<string, unknown>): Record<string, unknown> {
    const notionProps: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (value === undefined) continue;

      // Handle different types
      if (typeof value === "string") {
        // Check if it's a date string
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          notionProps[key] = { date: { start: value } };
        } else {
          // Rich text for strings
          notionProps[key] = { rich_text: [{ text: { content: value } }] };
        }
      } else if (typeof value === "number") {
        notionProps[key] = { number: value };
      } else if (typeof value === "boolean") {
        notionProps[key] = { checkbox: value };
      } else if (Array.isArray(value)) {
        // Assume array of URLs for relations
        notionProps[key] = {
          relation: value.map((url) => ({ id: this.extractPageId(url as string) })),
        };
      } else {
        // For other types, try to convert to string
        notionProps[key] = { rich_text: [{ text: { content: String(value) } }] };
      }
    }

    return notionProps;
  }
}

/**
 * Create and return a configured Notion client
 */
export function createNotionClient(): NotionClient {
  const auth = process.env.NOTION_API_TOKEN;
  if (!auth) {
    throw new Error("NOTION_API_TOKEN environment variable is not set");
  }
  return new NotionClient(auth);
}
