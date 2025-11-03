import { describe, it, expect } from "vitest";
import { buildServer } from "../src/server.js";

describe("Health Check Endpoints", () => {
  it("GET /health returns 200 with status ok", async () => {
    const app = await buildServer();
    const res = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe("ok");
    expect(body.timestamp).toBeDefined();
    expect(new Date(body.timestamp).toString()).not.toBe("Invalid Date");
    
    await app.close();
  });

  it("GET /ready returns 200 with status ready", async () => {
    const app = await buildServer();
    const res = await app.inject({
      method: "GET",
      url: "/ready",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe("ready");
    expect(body.timestamp).toBeDefined();
    expect(body.checks).toBeDefined();
    expect(body.checks.server).toBe("ok");
    
    await app.close();
  });

  it("health check endpoints do not require HMAC signature", async () => {
    const app = await buildServer();
    
    // Both endpoints should work without x-signature header
    const healthRes = await app.inject({
      method: "GET",
      url: "/health",
    });
    expect(healthRes.statusCode).toBe(200);

    const readyRes = await app.inject({
      method: "GET",
      url: "/ready",
    });
    expect(readyRes.statusCode).toBe(200);
    
    await app.close();
  });

  it("health check endpoints are not rate limited", async () => {
    const app = await buildServer();
    
    // Make 150 requests (above the 100/min rate limit) to health endpoint
    // They should all succeed as health checks bypass rate limiting
    const requests = Array.from({ length: 10 }, () =>
      app.inject({
        method: "GET",
        url: "/health",
        remoteAddress: "127.0.0.1",
      })
    );

    const responses = await Promise.all(requests);
    
    // All should succeed
    responses.forEach((res) => {
      expect(res.statusCode).toBe(200);
    });
    
    await app.close();
  });
});
