import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotionClient } from "../src/notion/client.js";

// Helper type for mocking
type MockedNotionClient = {
  pages: {
    update: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  dataSources: {
    query: ReturnType<typeof vi.fn>;
  };
};

describe("NotionClient", () => {
  let client: NotionClient;
  let mockNotionClient: MockedNotionClient;

  beforeEach(() => {
    // Mock the Notion SDK client
    mockNotionClient = {
      pages: {
        update: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
      },
      dataSources: {
        query: vi.fn().mockResolvedValue({ results: [] }),
      },
    };

    // Create our client with a test auth token
    client = new NotionClient("test-token");
    // Replace the internal client with our mock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).client = mockNotionClient;
  });

  describe("extractPageId", () => {
    it("should extract page ID from various Notion URL formats", () => {
      const urls = [
        "https://www.notion.so/workspace/Page-Title-a1b2c3d4e5f67890a1b2c3d4e5f67890",
        "https://notion.so/a1b2c3d4e5f67890a1b2c3d4e5f67890",
        "https://www.notion.so/a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
      ];

      for (const url of urls) {
        // Access private method via type assertion for testing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pageId = (client as any).extractPageId(url);
        expect(pageId).toMatch(/^[a-f0-9]{32}$/);
      }
    });

    it("should throw error for invalid URLs", () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (client as any).extractPageId("https://invalid-url.com");
      }).toThrow("Invalid Notion page URL");
    });
  });

  describe("convertToNotionProperties", () => {
    it("should convert string to rich text", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (client as any).convertToNotionProperties({ text: "hello" });
      expect(result).toEqual({
        text: { rich_text: [{ text: { content: "hello" } }] },
      });
    });

    it("should convert date string to date property", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (client as any).convertToNotionProperties({ date: "2024-01-01" });
      expect(result).toEqual({
        date: { date: { start: "2024-01-01" } },
      });
    });

    it("should convert number to number property", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (client as any).convertToNotionProperties({ score: 42 });
      expect(result).toEqual({
        score: { number: 42 },
      });
    });

    it("should convert boolean to checkbox property", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (client as any).convertToNotionProperties({ checked: true });
      expect(result).toEqual({
        checked: { checkbox: true },
      });
    });

    it("should skip undefined values", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (client as any).convertToNotionProperties({
        defined: "value",
        undefined: undefined,
      });
      expect(result).toHaveProperty("defined");
      expect(result).not.toHaveProperty("undefined");
    });
  });

  describe("updatePhoto", () => {
    it("should call pages.update with correct parameters", async () => {
      const pageUrl = "https://notion.so/a1b2c3d4e5f67890a1b2c3d4e5f67890";
      const properties = { "AI Summary": "Test summary", "Health 0-100": 85 };

      await client.updatePhoto(pageUrl, properties);

      expect(mockNotionClient.pages.update).toHaveBeenCalledWith({
        page_id: expect.stringMatching(/^[a-f0-9]{32}$/),
        properties: expect.objectContaining({
          "AI Summary": expect.any(Object),
          "Health 0-100": expect.any(Object),
        }),
      });
    });
  });

  describe("upsertHistory", () => {
    beforeEach(() => {
      process.env.NOTION_HISTORY_DB_ID = "test-db-id";
    });

    it("should create new page when key does not exist", async () => {
      mockNotionClient.dataSources.query.mockResolvedValue({ results: [] });

      const key = "test-key";
      const properties = { Name: "Test Entry", Date: "2024-01-01" };

      await client.upsertHistory(key, properties);

      expect(mockNotionClient.dataSources.query).toHaveBeenCalledWith({
        data_source_id: "test-db-id",
        filter: {
          property: "Key",
          rich_text: {
            equals: key,
          },
        },
      });

      expect(mockNotionClient.pages.create).toHaveBeenCalledWith({
        parent: { type: "database_id", database_id: "test-db-id" },
        properties: expect.objectContaining({
          Key: expect.any(Object),
          Name: expect.any(Object),
          Date: expect.any(Object),
        }),
      });
    });

    it("should update existing page when key exists", async () => {
      const existingPageId = "existing-page-id";
      mockNotionClient.dataSources.query.mockResolvedValue({
        results: [{ id: existingPageId }],
      });

      const key = "test-key";
      const properties = { Name: "Updated Entry" };

      await client.upsertHistory(key, properties);

      expect(mockNotionClient.pages.update).toHaveBeenCalledWith({
        page_id: existingPageId,
        properties: expect.objectContaining({
          Key: expect.any(Object),
          Name: expect.any(Object),
        }),
      });
    });

    it("should throw error when NOTION_HISTORY_DB_ID is not set", async () => {
      delete process.env.NOTION_HISTORY_DB_ID;

      await expect(client.upsertHistory("key", {})).rejects.toThrow(
        "NOTION_HISTORY_DB_ID environment variable is not set"
      );
    });
  });
});

describe("createNotionClient", () => {
  it("should throw error when NOTION_API_TOKEN is not set", async () => {
    delete process.env.NOTION_API_TOKEN;

    const { createNotionClient } = await import("../src/notion/client.js");
    expect(() => createNotionClient()).toThrow(
      "NOTION_API_TOKEN environment variable is not set"
    );
  });

  it("should create client when NOTION_API_TOKEN is set", async () => {
    process.env.NOTION_API_TOKEN = "test-token";

    const { createNotionClient } = await import("../src/notion/client.js");
    const client = createNotionClient();

    expect(client).toBeInstanceOf(NotionClient);
  });
});
