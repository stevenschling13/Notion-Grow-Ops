import { FastifyInstance } from "fastify";
import { createHash, createHmac, timingSafeEqual } from "crypto";
import { AnalyzeRequestSchema, AnalyzeResponseSchema, type AnalyzeJob } from "../domain/payload.js";
import { mapWritebacksToPhotos, buildHistoryProps } from "../domain/mapping.js";
import { createNotionService } from "../integrations/notion.js";

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

    let notion;
    try {
      notion = createNotionService();
    } catch (error) {
      req.log.error({ err: error }, "unable to construct Notion client");
      return reply.code(500).send({ error: "notion configuration error" });
    }

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

        // 3) map and write to Notion (omitted: client calls)
        const photoProps = mapWritebacksToPhotos(writebacks);
        const reviewedAt = new Date().toISOString();
        await notion.updatePhoto(job.photo_page_url, {
          ...photoProps,
          "AI Status": "Reviewed",
          "Reviewed at": reviewedAt,
        });

        const key = createHash("sha256").update(`${job.photo_page_url}|${job.date}`).digest("hex");
        const historyProps = buildHistoryProps({
          plant_id: job.plant_id,
          date: job.date,
          angle: job.angle,
          photo_page_url: job.photo_page_url,
          log_entry_url: job.log_entry_url,
          wb: writebacks,
        });
        await notion.upsertHistory({
          key,
          photo_page_url: job.photo_page_url,
          properties: historyProps,
        });

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
