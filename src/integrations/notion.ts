const NOTION_VERSION = "2022-06-28";

type NotionPropertyValue = Record<string, unknown>;

type NotionPropertyMap = Record<string, NotionPropertyValue>;

function assertString(value: unknown, context: string): string {
  if (typeof value !== "string") {
    throw new Error(`${context} must be a string`);
  }
  return value;
}

function assertNumber(value: unknown, context: string): number {
  if (typeof value !== "number") {
    throw new Error(`${context} must be a number`);
  }
  return value;
}

function assertBoolean(value: unknown, context: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`${context} must be a boolean`);
  }
  return value;
}

function richText(content: string) {
  return {
    rich_text: [
      {
        type: "text",
        text: { content },
      },
    ],
  };
}

function title(content: string) {
  return {
    title: [
      {
        type: "text",
        text: { content },
      },
    ],
  };
}

function number(value: number) {
  return { number: value };
}

function checkbox(value: boolean) {
  return { checkbox: value };
}

function select(name: string) {
  return { select: { name } };
}

function status(name: string) {
  return { status: { name } };
}

function date(value: string) {
  return { date: { start: value } };
}

function relation(ids: string[]) {
  return { relation: ids.map((id) => ({ id })) };
}

export function extractNotionIdFromUrl(url: string): string {
  const pattern = /([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const match = url.match(pattern);
  if (!match) {
    throw new Error(`Unable to extract Notion identifier from URL: ${url}`);
  }
  return match[1].replace(/-/g, "").toLowerCase();
}

function mapPhotoProperty(key: string, value: unknown): NotionPropertyValue | null {
  if (value === undefined || value === null) return null;
  switch (key) {
    case "AI Summary":
    case "AI Next Step":
      return richText(assertString(value, key));
    case "AI Next Step (sel)":
    case "Trend":
    case "Sev":
      return select(assertString(value, key));
    case "Health 0-100":
    case "DLI mol":
    case "VPD kPa":
      return number(assertNumber(value, key));
    case "VPD OK":
    case "DLI OK":
    case "CO2 OK":
      return checkbox(assertBoolean(value, key));
    case "Reviewed at":
      return date(assertString(value, key));
    case "AI Status":
      return status(assertString(value, key));
    default:
      if (typeof value === "string") return richText(value);
      if (typeof value === "number") return number(value);
      if (typeof value === "boolean") return checkbox(value);
      return null;
  }
}

function mapHistoryProperty(key: string, value: unknown): NotionPropertyValue | null {
  if (value === undefined || value === null) return null;
  switch (key) {
    case "Name":
      return title(assertString(value, key));
    case "Date":
      return date(assertString(value, key));
    case "Related Photo": {
      const urls = Array.isArray(value) ? value : [value];
      const ids = urls.map((url) => extractNotionIdFromUrl(assertString(url, key)));
      return relation(ids);
    }
    case "Related Log Entry": {
      const urls = Array.isArray(value) ? value : [value];
      const validUrls = urls.filter(Boolean) as string[];
      if (!validUrls.length) return null;
      const ids = validUrls.map((url) => extractNotionIdFromUrl(assertString(url, key)));
      return relation(ids);
    }
    case "userDefined:ID":
    case "AI Summary":
      return richText(assertString(value, key));
    case "Health 0-100":
    case "DLI mol":
    case "VPD kPa":
      return number(assertNumber(value, key));
    case "VPD OK":
    case "DLI OK":
    case "CO2 OK":
      return checkbox(assertBoolean(value, key));
    case "Sev":
      return select(assertString(value, key));
    case "Status":
      return status(assertString(value, key));
    case "Idempotency Key":
      return richText(assertString(value, key));
    default:
      if (typeof value === "string") return richText(value);
      if (typeof value === "number") return number(value);
      if (typeof value === "boolean") return checkbox(value);
      return null;
  }
}

async function notionFetch(path: string, init: RequestInit & { token: string }): Promise<any> {
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${init.token}`,
      "Notion-Version": NOTION_VERSION,
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Notion API error ${response.status}: ${text}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

type UpsertHistoryInput = {
  key: string;
  photo_page_url: string;
  properties: Record<string, unknown>;
};

export class NotionService {
  private readonly token: string;
  private readonly historyDatabaseId?: string;

  constructor(options?: { token?: string; historyDatabaseId?: string }) {
    const token = options?.token ?? process.env.NOTION_TOKEN;
    if (!token) {
      throw new Error("NOTION_TOKEN environment variable is required to contact Notion");
    }
    this.token = token;
    this.historyDatabaseId = options?.historyDatabaseId ?? process.env.NOTION_HISTORY_DATABASE_ID ?? process.env.NOTION_HISTORY_DB_ID;
  }

  async updatePhoto(pageUrl: string, props: Record<string, unknown>) {
    const pageId = extractNotionIdFromUrl(pageUrl);
    const mapped: NotionPropertyMap = {};
    for (const [key, value] of Object.entries(props)) {
      const mappedValue = mapPhotoProperty(key, value);
      if (mappedValue) mapped[key] = mappedValue;
    }
    if (Object.keys(mapped).length === 0) return;
    await notionFetch(`/pages/${pageId}`, {
      method: "PATCH",
      body: JSON.stringify({ properties: mapped }),
      token: this.token,
    });
  }

  async upsertHistory(input: UpsertHistoryInput) {
    if (!this.historyDatabaseId) {
      throw new Error("NOTION_HISTORY_DATABASE_ID environment variable is required for history upserts");
    }

    const properties = { ...input.properties };
    properties["Idempotency Key"] = input.key;
    if (!properties["Related Photo"]) {
      properties["Related Photo"] = [input.photo_page_url];
    }

    const mapped: NotionPropertyMap = {};
    for (const [key, value] of Object.entries(properties)) {
      const mappedValue = mapHistoryProperty(key, value);
      if (mappedValue) mapped[key] = mappedValue;
    }

    if (!mapped["Name"]) {
      throw new Error("History records require a Name property");
    }

    const filter = {
      filter: {
        property: "Idempotency Key",
        rich_text: { equals: input.key },
      },
    };

    const existing = await notionFetch(`/databases/${this.historyDatabaseId}/query`, {
      method: "POST",
      body: JSON.stringify(filter),
      token: this.token,
    });

    const first = existing?.results?.[0];
    if (first?.id) {
      await notionFetch(`/pages/${first.id}`, {
        method: "PATCH",
        body: JSON.stringify({ properties: mapped }),
        token: this.token,
      });
      return first.id as string;
    }

    const created = await notionFetch(`/pages`, {
      method: "POST",
      body: JSON.stringify({ parent: { database_id: this.historyDatabaseId }, properties: mapped }),
      token: this.token,
    });
    return created?.id as string;
  }
}

export function createNotionService(options?: { token?: string; historyDatabaseId?: string }) {
  return new NotionService(options);
}
