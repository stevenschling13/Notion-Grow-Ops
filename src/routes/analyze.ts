import { FastifyInstance } from "fastify";
import {
  AnalyzeRequestSchema,
  AnalyzeResponseSchema,
  type AnalyzeJob,
} from "../domain/payload.js";
import {
  mapWritebacksToPhotos,
  buildHistoryProps,
  buildHistoryKey,
} from "../domain/mapping.js";
import { verifySignature } from "../security/hmac.js";

export default async function analyzeRoute(app: FastifyInstance) {
  app.post("/analyze", {
    config: { rawBody: true },
  }, async (req, reply) => {
    // HMAC verify
    const secret = app.config.hmacSecret;
    const sig = req.headers["x-signature"];
    if (typeof sig !== "string") {
      return reply.code(401).send({ error: "unauthorized" });
    }
    const raw = req.rawBody || "";
    const isValidSignature = verifySignature(raw, secret, sig);
    if (!isValidSignature) {
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

        // 3) map and write to Notion (omitted: client calls)
        const photoProps = mapWritebacksToPhotos(writebacks);
        void photoProps; // placeholder to avoid unused var until Notion client is added
        // await notion.updatePhoto(job.photo_page_url, { ...photoProps, "AI Status": "Reviewed", "Reviewed at": new Date().toISOString() });

        const key = buildHistoryKey({ photo_page_url: job.photo_page_url, date: job.date });
        const historyProps = buildHistoryProps({
          plant_id: job.plant_id,
          date: job.date,
          angle: job.angle,
          photo_page_url: job.photo_page_url,
          log_entry_url: job.log_entry_url,
          wb: writebacks,
          key,
        });
        void historyProps;
        // await notion.upsertHistory(sha256(key), historyProps);

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
