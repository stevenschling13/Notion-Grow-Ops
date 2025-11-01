import Fastify from "fastify";
import rawBody from "@fastify/raw-body";
import analyzeRoute from "./routes/analyze";

export async function buildServer() {
  const app = Fastify({ logger: true });
  await app.register(rawBody, { field: "rawBody", global: true, runFirst: true, encoding: "utf8" });
  await app.register(analyzeRoute);
  return app;
}
