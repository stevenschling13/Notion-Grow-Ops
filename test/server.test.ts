import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createHmac } from "crypto";
import { buildServer } from "../src/server.js";

function createSignedPayload(secret: string) {
  const payload = {
    action: "analyze_photos" as const,
    source: "Grow Photos" as const,
    idempotency_scope: "photo_page_url+date" as const,
    requested_fields_out: ["AI Summary"],
    jobs: [
      {
        plant_id: "BLUE" as const,
        photo_page_url: "https://notion.so/photo",
        photo_file_urls: ["https://storage.googleapis.com/sample.jpg"],
        log_entry_url: "https://notion.so/log",
        date: "2024-01-01",
        angle: "canopy" as const,
      },
    ],
  };
  const body = JSON.stringify(payload);
  const signature = createHmac("sha256", secret).update(body).digest("hex");
  return { body, signature };
}

describe("server security", () => {
  const secret = "test-secret";
  const bypass = "bypass-token";

  beforeEach(() => {
    process.env.HMAC_SECRET = secret;
    process.env.RATE_LIMIT_BYPASS_TOKEN = bypass;
  });

  afterEach(() => {
    delete process.env.HMAC_SECRET;
    delete process.env.RATE_LIMIT_BYPASS_TOKEN;
  });

  it("applies security headers on successful responses", async () => {
    const server = await buildServer();
    const { body, signature } = createSignedPayload(secret);

    const response = await server.inject({
      method: "POST",
      url: "/analyze",
      payload: body,
      headers: {
        "content-type": "application/json",
        "x-signature": signature,
      },
    });

    await server.close();

    expect(response.statusCode).toBe(200);
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-frame-options"]).toBe("DENY");
    expect(response.headers["strict-transport-security"]).toContain("max-age=31536000");
    expect(response.headers["content-security-policy"]).toBe("default-src 'self'");
  });

  it("rate limits after 100 requests per minute", async () => {
    const server = await buildServer();
    const { body, signature } = createSignedPayload(secret);

    let lastStatus = 0;
    for (let i = 0; i < 101; i += 1) {
      const response = await server.inject({
        method: "POST",
        url: "/analyze",
        payload: body,
        headers: {
          "content-type": "application/json",
          "x-signature": signature,
        },
      });
      lastStatus = response.statusCode;
    }

    await server.close();

    expect(lastStatus).toBe(429);
  });

  it("allows trusted callers to bypass rate limiting", async () => {
    const server = await buildServer();
    const { body, signature } = createSignedPayload(secret);

    let blocked = false;
    for (let i = 0; i < 150; i += 1) {
      const response = await server.inject({
        method: "POST",
        url: "/analyze",
        payload: body,
        headers: {
          "content-type": "application/json",
          "x-signature": signature,
          "x-rate-limit-bypass": bypass,
        },
      });
      if (response.statusCode === 429) {
        blocked = true;
        break;
      }
    }

    await server.close();

    expect(blocked).toBe(false);
  });
});
