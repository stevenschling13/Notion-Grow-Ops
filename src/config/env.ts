import { z } from "zod";

const EnvSchema = z.object({
  HMAC_SECRET: z.string().min(1, "HMAC_SECRET is required"),
  ENABLE_NOTION_SYNC: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((value) => {
      if (typeof value === "boolean") return value;
      if (typeof value === "string") {
        return ["1", "true", "yes", "on"].includes(value.toLowerCase());
      }
      return false;
    }),
  NOTION_API_TOKEN: z.string().optional(),
  NOTION_PHOTOS_DB_ID: z.string().optional(),
  NOTION_HISTORY_DB_ID: z.string().optional(),
  NOTION_SYNC_OUTBOX: z.string().optional(),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function loadEnv(raw: NodeJS.ProcessEnv = process.env): EnvConfig {
  const parsed = EnvSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${message}`);
  }

  if (parsed.data.ENABLE_NOTION_SYNC) {
    const missing = [
      !parsed.data.NOTION_API_TOKEN && "NOTION_API_TOKEN",
      !parsed.data.NOTION_PHOTOS_DB_ID && "NOTION_PHOTOS_DB_ID",
      !parsed.data.NOTION_HISTORY_DB_ID && "NOTION_HISTORY_DB_ID",
    ].filter(Boolean) as string[];
    if (missing.length > 0) {
      throw new Error(
        `ENABLE_NOTION_SYNC is true but the following variables are missing: ${missing.join(", ")}`,
      );
    }
  }

  return parsed.data;
}
