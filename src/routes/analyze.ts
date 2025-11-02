import { FastifyInstance } from "fastify";
import { createHmac, timingSafeEqual, createHash } from "crypto";
import { AnalyzeRequestSchema, AnalyzeResponseSchema, type AnalyzeJob } from "../domain/payload.js";
import { mapWritebacksToPhotos, buildHistoryProps } from "../domain/mapping.js";
import { createNotionClient } from "../notion/client.js";

export default async function analyzeRoute(app: FastifyInstance) {
  app.post("/analyze", {
    config: { rawBody: true },
  }, async (req, reply) => {
    // Initialize Notion client if configured
    let notion: ReturnType<typeof createNotionClient> | undefined;
    try {
      if (process.env.NOTION_API_TOKEN) {
        notion = createNotionClient();
      }
    } catch (error) {
      app.log.warn({ error }, "Notion client initialization failed, continuing without Notion integration");
    }
    // HMAC verify
    const secret = process.env.HMAC_SECRET || "";
    const sig = req.headers["x-signature"];
    if (!secret || typeof sig !== "string") {
      return reply.code(401).send({ error: "unauthorized" });
    }
    const raw = req.rawBody || "";
    const h = createHmac("sha256", secret).update(raw).digest();
    const provided = Buffer.from(String(sig), "hex");
    if (provided.length !== h.length || !timingSafeEqual(h, provided)) {
      return reply.code(401).send({ error: "bad signature" });
    }

    // Validate
    const parsed = AnalyzeRequestSchema.safeParse(req.body as unknown);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }
    const { jobs } = parsed.data;

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
        if (notion) {
          const photoProps = mapWritebacksToPhotos(writebacks);
          await notion.updatePhoto(job.photo_page_url, { 
            ...photoProps, 
            "AI Status": "Reviewed", 
            "Reviewed at": new Date().toISOString() 
          });

          const key = `${job.photo_page_url}|${job.date}`;
          const keyHash = createHash("sha256").update(key).digest("hex");
          const historyProps = buildHistoryProps({
            plant_id: job.plant_id,
            date: job.date,
            angle: job.angle,
            photo_page_url: job.photo_page_url,
            log_entry_url: job.log_entry_url,
            wb: writebacks,
          });
          await notion.upsertHistory(keyHash, historyProps);
        }

        return { photo_page_url: job.photo_page_url, status: "ok", writebacks };
      } catch (e: unknown) {
        // On error: leave Draft and append error string to AI Analysis
        return { photo_page_url: job.photo_page_url, status: "error", error: e instanceof Error ? e.message : "analysis failed" };
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
