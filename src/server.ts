import Fastify from "fastify";
import analyzeRoute from "./routes/analyze.js";

export async function buildServer() {
  const app = Fastify({ logger: true });
  app.decorateRequest("rawBody", undefined);

  app.addContentTypeParser("application/json", { parseAs: "string" }, (request, body, done) => {
    const raw = typeof body === "string" ? body : body.toString("utf8");
    request.rawBody = raw;
    try {
      done(null, raw.length ? JSON.parse(raw) : {});
    } catch (error) {
      done(error as Error);
    }
  });

  await app.register(analyzeRoute);
  return app;
}
