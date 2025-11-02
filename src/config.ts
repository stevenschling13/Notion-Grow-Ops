import { z } from "zod";

const EnvSchema = z
  .object({
    HMAC_SECRET: z.string().min(1, "HMAC_SECRET is required"),
    PORT: z.coerce.number().int().min(1).max(65535).default(8080),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
    NOTION_API_KEY: z.string().min(1).optional(),
    NOTION_PHOTOS_DB_ID: z.string().min(1).optional(),
    NOTION_HISTORY_DB_ID: z.string().min(1).optional(),
    NOTION_HISTORY_KEY_PROP: z.string().min(1).default("Key"),
    NOTION_DRY_RUN: z.coerce.boolean().default(true),
    NOTION_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  })
  .superRefine((value, ctx) => {
    const notionFields = [value.NOTION_API_KEY, value.NOTION_PHOTOS_DB_ID];
    const hasNotionConfig = notionFields.every((field) => typeof field === "string" && field.length > 0);
    const anyNotionField = notionFields.some((field) => typeof field === "string" && field.length > 0);
    if (anyNotionField && !hasNotionConfig) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "NOTION_API_KEY and NOTION_PHOTOS_DB_ID must both be set when configuring Notion sync",
        path: ["NOTION_API_KEY"],
      });
    }
    if (value.NOTION_HISTORY_DB_ID && !hasNotionConfig) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "NOTION_HISTORY_DB_ID requires NOTION_API_KEY and NOTION_PHOTOS_DB_ID",
        path: ["NOTION_HISTORY_DB_ID"],
      });
    }
  });

export type AppConfig = {
  hmacSecret: string;
  port: number;
  logLevel: "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";
  notion?: {
    apiKey: string;
    photosDatabaseId: string;
    historyDatabaseId?: string;
    historyKeyProperty: string;
    dryRun: boolean;
    timeoutMs: number;
  };
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(`Configuration error: ${parsed.error.issues.map((issue) => issue.message).join(", ")}`);
  }
  const {
    HMAC_SECRET,
    PORT,
    LOG_LEVEL,
    NOTION_API_KEY,
    NOTION_PHOTOS_DB_ID,
    NOTION_HISTORY_DB_ID,
    NOTION_HISTORY_KEY_PROP,
    NOTION_DRY_RUN,
    NOTION_TIMEOUT_MS,
  } = parsed.data;

  const config: AppConfig = {
    hmacSecret: HMAC_SECRET,
    port: PORT,
    logLevel: LOG_LEVEL,
  };

  if (NOTION_API_KEY && NOTION_PHOTOS_DB_ID) {
    config.notion = {
      apiKey: NOTION_API_KEY,
      photosDatabaseId: NOTION_PHOTOS_DB_ID,
      historyDatabaseId: NOTION_HISTORY_DB_ID,
      historyKeyProperty: NOTION_HISTORY_KEY_PROP,
      dryRun: NOTION_DRY_RUN,
      timeoutMs: NOTION_TIMEOUT_MS,
    };
  }

  return config;
}
