import { FastifyInstance } from "fastify";

/**
 * Health check endpoints for monitoring and orchestration
 * - GET /health: Basic liveness probe (is the server running?)
 * - GET /ready: Readiness probe (is the server ready to accept traffic?)
 */
export default async function healthRoutes(app: FastifyInstance) {
  /**
   * Liveness probe
   * Returns 200 if the server is running
   * Used by orchestrators (K8s, Docker) to detect if the process is alive
   */
  app.get("/health", async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  });

  /**
   * Readiness probe
   * Returns 200 if the server is ready to accept traffic
   * Used by load balancers to determine if the instance should receive requests
   * 
   * Future: Add checks for:
   * - Database connectivity
   * - Redis connectivity
   * - External API availability
   */
  app.get("/ready", async () => {
    // Basic readiness check
    // In the future, add checks for:
    // - Notion API connectivity
    // - Vision AI provider connectivity
    // - Redis connectivity
    
    return {
      status: "ready",
      timestamp: new Date().toISOString(),
      checks: {
        server: "ok",
        // Future checks will be added here
      },
    };
  });
}
