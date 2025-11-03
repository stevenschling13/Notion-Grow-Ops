import Fastify, { type FastifyInstance } from "fastify";
import rawBody from "fastify-raw-body";
import analyzeRoute from "./routes/analyze.js";
import healthRoutes from "./routes/health.js";

export async function buildServer() {
  const app = Fastify({
    logger: true,
    bodyLimit: 1024 * 1024, // 1 MiB
    requestTimeout: 30_000,
    connectionTimeout: 60_000,
  });

  await app.register(rawBody, {
    field: "rawBody",
    global: true,
    runFirst: true,
    encoding: "utf8",
  });

  applySecurityHeaders(app);
  applyInMemoryRateLimit(app);

  // Register health check endpoints (no rate limiting or auth required)
  await app.register(healthRoutes);
  
  await app.register(analyzeRoute);
  return app;
}

function applySecurityHeaders(app: FastifyInstance) {
  app.addHook("onSend", async (request, reply, payload) => {
    reply.headers({
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
      "x-xss-protection": "1; mode=block",
      "referrer-policy": "no-referrer",
      "cross-origin-opener-policy": "same-origin",
      "cross-origin-resource-policy": "same-origin",
      "permissions-policy": "camera=(), microphone=(), geolocation=()",
      "strict-transport-security": "max-age=31536000; includeSubDomains",
      "content-security-policy": "default-src 'self'"
    });
    return payload;
  });
}

function applyInMemoryRateLimit(app: FastifyInstance) {
  const windowMs = 60_000;
  const maxRequests = 100;
  const requestCounts = new Map<string, { count: number; expiresAt: number }>();

  app.addHook("onRequest", async (request, reply) => {
    if (process.env.RATE_LIMIT_BYPASS_TOKEN && request.headers["x-rate-limit-bypass"] === process.env.RATE_LIMIT_BYPASS_TOKEN) {
      return;
    }

    const identifier = request.ip;
    const now = Date.now();
    const existing = requestCounts.get(identifier);

    if (!existing || existing.expiresAt <= now) {
      requestCounts.set(identifier, { count: 1, expiresAt: now + windowMs });
      return;
    }

    existing.count += 1;
    if (existing.count > maxRequests) {
      await reply.code(429).send({ error: "Too Many Requests" });
      return reply;
    }
  });

  // Periodically clean up expired entries to avoid memory leaks.
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of requestCounts.entries()) {
      if (value.expiresAt <= now) {
        requestCounts.delete(key);
      }
    }
  }, windowMs).unref();
}
