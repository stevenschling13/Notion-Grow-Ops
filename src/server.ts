import Fastify from "fastify";
import rawBody from "fastify-raw-body";
import analyzeRoute from "./routes/analyze.js";
import { loadEnv } from "./config/env.js";
import { createNotionService } from "./services/notion.js";

export async function buildServer() {
  const app = Fastify({ logger: true });
  const env = loadEnv();
  await app.register(rawBody, { field: "rawBody", global: true, runFirst: true, encoding: "utf8" });
  const notion = createNotionService({ env, logger: app.log });
  await app.register(analyzeRoute, { env, notion });
  return app;
}
