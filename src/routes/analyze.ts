import { FastifyInstance } from "fastify";
import { createHmac, createHash } from "crypto";
import { AnalyzeRequestSchema, AnalyzeResponseSchema, type AnalyzeJob } from "../domain/payload.js";
import { mapWritebacksToPhotos, buildHistoryProps } from "../domain/mapping.js";
import { createNotionClient } from "../services/notion-client.js";

/**
 * Generate SHA-256 hash of a string
 */
function generateHash(input: string): string {
  try {
    return createHash("sha256").update(input).digest("hex");
  } catch (error) {
    throw new Error(`Failed to generate hash: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

export default async function analyzeRoute(app: FastifyInstance) {
  app.post("/analyze", {
    config: { rawBody: true },
  }, async (req, reply) => {
    // HMAC verify
    const secret = process.env.HMAC_SECRET || "";
    const sig = req.headers["x-signature"];
    if (!secret || typeof sig !== "string") {
      return reply.code(401).send({ error: "unauthorized" });
    }
    const raw = (req as any).rawBody || "";
    const h = createHmac("sha256", secret).update(raw).digest("hex");
    if (h !== sig) {
      return reply.code(401).send({ error: "bad signature" });
    }

    // Validate
    const parsed = AnalyzeRequestSchema.safeParse(req.body as unknown);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }
    const { jobs } = parsed.data;

    // Initialize Notion client (optional)
    const notionClient = createNotionClient();

    const results = await Promise.all(jobs.map(async (job: AnalyzeJob) => {
      try {
        // 1) download first file (omitted)
        // 2) call vision provider (omitted; return mock values)
        const writebacks = {
          "AI Summary": "Healthy canopy, RH slightly low for stage.",
          "Health 0-100": 88,
          "AI Next Step": "Raise light",
          "VPD OK": true,
          "DLI OK": false,
          "CO2 OK": true,
          "Trend": "Improving",
          "DLI mol": 36.7,
          "VPD kPa": 1.38,
          "Sev": "Low",
        } as const;

        // 3) map and write to Notion
        const photoProps = mapWritebacksToPhotos(writebacks);
        
        if (notionClient) {
          // Update photo page with AI analysis results
          await notionClient.updatePhotoPage(job.photo_page_url, {
            ...photoProps,
            "AI Status": "Reviewed",
            "Reviewed at": new Date().toISOString(),
          });

          // Upsert history entry
          const key = `${job.photo_page_url}|${job.date}`;
          const keyHash = generateHash(key);
          const historyProps = buildHistoryProps({
            plant_id: job.plant_id,
            date: job.date,
            angle: job.angle,
            photo_page_url: job.photo_page_url,
            log_entry_url: job.log_entry_url,
            wb: writebacks,
          });
          await notionClient.upsertHistoryEntry(keyHash, historyProps);
        }

        return { photo_page_url: job.photo_page_url, status: "ok", writebacks };
      } catch (e: any) {
        // On error: leave Draft and append error string to AI Analysis
        return { photo_page_url: job.photo_page_url, status: "error", error: e?.message || "analysis failed" };
      }
    }));

    const response = {
      results,
      errors: results.filter((r) => r.status === "error").map((r) => r.error || "error"),
    };
    const validated = AnalyzeResponseSchema.parse(response);
    return reply.code(200).send(validated);
  });
}
