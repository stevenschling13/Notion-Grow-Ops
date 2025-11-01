import { Client } from "@notionhq/client";

export interface NotionConfig {
  authToken: string;
  photosDbId?: string;
  historyDbId?: string;
}

export class NotionClient {
  private client: Client;
  private photosDbId?: string;
  private historyDbId?: string;

  constructor(config: NotionConfig) {
    this.client = new Client({ auth: config.authToken });
    this.photosDbId = config.photosDbId;
    this.historyDbId = config.historyDbId;
  }

  /**
   * Update a photo page in Notion with new properties
   */
  async updatePhotoPage(pageUrl: string, properties: Record<string, unknown>): Promise<void> {
    const pageId = this.extractPageId(pageUrl);
    if (!pageId) {
      throw new Error(`Invalid Notion page URL: ${pageUrl}`);
    }

    await this.client.pages.update({
      page_id: pageId,
      properties: this.convertToNotionProperties(properties),
    });
  }

  /**
   * Upsert a history entry in the AI History database
   * Note: Currently creates new entries. For true upsert functionality,
   * consider using a separate field to track unique keys.
   */
  async upsertHistoryEntry(key: string, properties: Record<string, unknown>): Promise<void> {
    if (!this.historyDbId) {
      throw new Error("History database ID not configured");
    }

    const notionProps = this.convertToNotionProperties(properties);

    // Create new entry with Key property for tracking
    await this.client.pages.create({
      parent: { database_id: this.historyDbId },
      properties: {
        ...notionProps,
        Key: {
          rich_text: [{ text: { content: key } }],
        },
      },
    });
  }

  /**
   * Extract page ID from Notion URL
   */
  private extractPageId(url: string): string | null {
    const match = url.match(/([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
    return match ? match[1].replace(/-/g, "") : null;
  }

  /**
   * Convert generic properties to Notion-specific property format
   */
  private convertToNotionProperties(properties: Record<string, unknown>): Record<string, any> {
    const notionProps: Record<string, any> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (value === undefined || value === null) continue;

      // Handle different property types
      if (typeof value === "string") {
        // Check if it's a date string
        if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
          notionProps[key] = { date: { start: value } };
        } else {
          notionProps[key] = { rich_text: [{ text: { content: value } }] };
        }
      } else if (typeof value === "number") {
        notionProps[key] = { number: value };
      } else if (typeof value === "boolean") {
        notionProps[key] = { checkbox: value };
      } else if (Array.isArray(value)) {
        // Handle relation properties (array of URLs/IDs)
        const relations = value
          .map((item) => {
            if (typeof item === "string") {
              const pageId = this.extractPageId(item);
              return pageId ? { id: pageId } : null;
            }
            return null;
          })
          .filter(Boolean);
        if (relations.length > 0) {
          notionProps[key] = { relation: relations };
        }
      }
    }

    return notionProps;
  }
}

/**
 * Create a Notion client from environment variables
 */
export function createNotionClient(): NotionClient | null {
  const authToken = process.env.NOTION_API_TOKEN;
  
  if (!authToken) {
    return null;
  }

  return new NotionClient({
    authToken,
    photosDbId: process.env.NOTION_PHOTOS_DB_ID,
    historyDbId: process.env.NOTION_HISTORY_DB_ID,
  });
}
