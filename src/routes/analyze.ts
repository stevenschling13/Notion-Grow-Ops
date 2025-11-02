import type { FastifyPluginAsync } from "fastify";
import { createHmac, timingSafeEqual } from "crypto";
import { AnalyzeRequestSchema, AnalyzeResponseSchema, type AnalyzeJob, type Writebacks } from "../domain/payload.js";
import type { EnvConfig } from "../config/env.js";
import type { NotionService } from "../services/notion.js";

interface AnalyzeRouteOptions {
  env: EnvConfig;
  notion: NotionService;
}

function parseSignature(signature: string): Buffer | null {
  if (signature.length % 2 !== 0) {
    return null;
  }
  try {
    return Buffer.from(signature, "hex");
  } catch {
    return null;
  }
}

function coerceRawBody(raw: unknown): Buffer {
  if (!raw) return Buffer.alloc(0);
  if (Buffer.isBuffer(raw)) return raw;
  if (typeof raw === "string") return Buffer.from(raw, "utf8");
  if (ArrayBuffer.isView(raw)) return Buffer.from(raw.buffer as ArrayBuffer);
  return Buffer.from(String(raw), "utf8");
}

function generateWritebacks(job: AnalyzeJob): Writebacks {
  const hasNotes = job.notes?.trim().length ? 5 : 0;
  const stageBonus = job.stage?.toLowerCase().includes("flower") ? 8 : 0;
  const anglePenalty = job.angle === "under-canopy" ? -12 : 0;
  const health = Math.max(40, Math.min(100, 82 + hasNotes + stageBonus + anglePenalty));
  const severity = health > 90 ? "Low" : health > 75 ? "Medium" : "High";
  const dli = job.photoperiod_h ? Number((job.photoperiod_h * 2.1).toFixed(1)) : 34.2;
  const vpd = job.stage?.toLowerCase().includes("veg") ? 1.2 : 1.38;
  const dliOk = dli >= 32 && dli <= 40;
  const vpdOk = vpd >= 1 && vpd <= 1.5;

  return {
    "AI Summary": `Auto-analysis for ${job.date}${job.angle ? ` (${job.angle})` : ""}.` +
      (job.notes ? ` Notes mention: ${job.notes.slice(0, 120)}.` : ""),
    "Health 0-100": Math.round(health),
    "AI Next Step": health < 80 ? "Raise light" : "None",
    "VPD OK": vpdOk,
    "DLI OK": dliOk,
    "CO2 OK": true,
    "Trend": health >= 90 ? "Improving" : health >= 80 ? "Stable" : "Declining",
    "DLI mol": Number(dli.toFixed(1)),
    "VPD kPa": Number(vpd.toFixed(2)),
    "Sev": severity,
  } satisfies Writebacks;
}

const analyzeRoute: FastifyPluginAsync<AnalyzeRouteOptions> = async (app, opts) => {
  const { env, notion } = opts;

  app.post(
    "/analyze",
    {
      config: { rawBody: true },
    },
    async (req, reply) => {
      const sig = req.headers["x-signature"];
      if (typeof sig !== "string") {
        return reply.code(401).send({ error: "unauthorized" });
      }

      const rawBody = coerceRawBody(req.rawBody);
      const h = createHmac("sha256", env.HMAC_SECRET).update(rawBody).digest();
      const provided = parseSignature(sig);
      if (!provided || provided.length !== h.length || !timingSafeEqual(h, provided)) {
        return reply.code(401).send({ error: "bad signature" });
      }

      const parsed = AnalyzeRequestSchema.safeParse(req.body as unknown);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.flatten() });
      }

      const { jobs } = parsed.data;

      const results = await Promise.all(
        jobs.map(async (job) => {
          try {
            const writebacks = generateWritebacks(job);
            await notion.sync(job, writebacks);
            return { photo_page_url: job.photo_page_url, status: "ok" as const, writebacks };
          } catch (e: unknown) {
            const error = e instanceof Error ? e.message : "analysis failed";
            app.log.error({ err: e, photo_page_url: job.photo_page_url }, "Analyze pipeline failed");
            return { photo_page_url: job.photo_page_url, status: "error" as const, error };
          }
        }),
      );

      const response = {
        results,
        errors: results.filter((r) => r.status === "error").map((r) => r.error || "error"),
      };
      const validated = AnalyzeResponseSchema.parse(response);
      return reply.code(200).send(validated);
    },
  );
};

export default analyzeRoute;
