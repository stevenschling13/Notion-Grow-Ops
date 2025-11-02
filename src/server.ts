import Fastify from "fastify";
import rawBody from "fastify-raw-body";
import analyzeRoute from "./routes/analyze.js";
import { loadConfig, type AppConfig } from "./config.js";

export async function buildServer(overrides?: Partial<AppConfig>) {
  const config = overrides ? { ...loadConfig(), ...overrides } : loadConfig();
  const app = Fastify({ logger: { level: config.logLevel } });

  app.decorate("config", config);

  await app.register(rawBody, { field: "rawBody", global: true, runFirst: true, encoding: "utf8" });
  await app.register(analyzeRoute);

  return app;
}

declare module "fastify" {
  interface FastifyInstance {
    config: AppConfig;
  }
}
