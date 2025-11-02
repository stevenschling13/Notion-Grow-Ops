import Fastify from "fastify";
import rawBody from "fastify-raw-body";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import analyzeRoute from "./routes/analyze.js";

/**
 * Builds and configures the Fastify server instance with all middleware and routes.
 * 
 * Sets up:
 * - Raw body parsing for HMAC verification
 * - Security headers via Helmet
 * - Rate limiting with bypass support
 * - Request/connection timeouts
 * - Body size limits
 * - All application routes
 * 
 * @returns Configured Fastify server instance ready to listen
 * 
 * @example
 * ```typescript
 * const server = await buildServer();
 * await server.listen({ port: 8080 });
 * ```
 */
export async function buildServer() {
  const app = Fastify({
    logger: true,
    // Limit request body size to 1 MiB to prevent memory exhaustion attacks
    bodyLimit: 1024 * 1024,
    // Set request timeout to 30 seconds to prevent slow loris attacks
    requestTimeout: 30_000,
    // Set connection timeout to 60 seconds to handle slow networks gracefully
    connectionTimeout: 60_000,
  });

  // Register raw body parser for HMAC signature verification
  // Must run first to capture the raw request body before JSON parsing
  await app.register(rawBody, {
    field: "rawBody",
    global: true,
    runFirst: true,
    encoding: "utf8",
  });

  // Apply security headers using helmet plugin
  // Protects against common web vulnerabilities (XSS, clickjacking, etc.)
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
      },
    },
    // HSTS: Force HTTPS for 1 year, including subdomains
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
  });

  // Apply rate limiting to prevent abuse and DDoS attacks
  // Limits requests to 100 per minute per IP address
  await app.register(rateLimit, {
    max: 100, // Maximum 100 requests
    timeWindow: "1 minute", // Per 1 minute window
    cache: 10000, // Cache up to 10,000 different IPs
    skipOnError: false, // Don't skip rate limiting if there's an error
    // Allow bypassing rate limits with a secret token for trusted services
    // Bypass requests get a special key that doesn't count against the IP limit
    keyGenerator: (req) => {
      const bypassToken = process.env.RATE_LIMIT_BYPASS_TOKEN;
      if (bypassToken && req.headers["x-rate-limit-bypass"] === bypassToken) {
        // Use a unique key per bypass request to effectively disable limiting
        return `bypass:${Date.now()}:${Math.random()}`;
      }
      return req.ip;
    },
  });

  await app.register(analyzeRoute);
  return app;
}
