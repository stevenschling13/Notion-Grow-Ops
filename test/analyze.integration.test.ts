import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildServer } from "../src/server.js";
import { createHmac } from "crypto";
import type { FastifyInstance } from "fastify";

describe("POST /analyze integration", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env.HMAC_SECRET = "test-secret-key";
    process.env.RATE_LIMIT_BYPASS_TOKEN = "bypass-token";
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should process a valid analyze request", async () => {
    const payload = JSON.stringify({
      action: "analyze_photos",
      source: "Grow Photos",
      idempotency_scope: "photo_page_url+date",
      requested_fields_out: ["AI Summary", "Health 0-100"],
      jobs: [
        {
          photo_page_url: "https://notion.so/photo",
          photo_file_urls: ["https://example.com/photo.jpg"],
          photo_title: "Top view",
          date: "2024-01-01",
          angle: "top",
          plant_id: "BLUE",
          log_entry_url: "https://notion.so/log",
          stage: "vegetative",
          room_name: "Grow Room A",
        },
      ],
    });

    const signature = createHmac("sha256", "test-secret-key")
      .update(payload)
      .digest("hex");

    const response = await app.inject({
      method: "POST",
      url: "/analyze",
      headers: {
        "x-signature": signature,
        "content-type": "application/json",
      },
      payload,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("results");
    expect(body).toHaveProperty("errors");
    expect(body.results).toHaveLength(1);
    expect(body.results[0].status).toBe("ok");
    expect(body.results[0]).toHaveProperty("writebacks");
    expect(body.results[0].writebacks).toHaveProperty("AI Summary");
    expect(body.results[0].writebacks).toHaveProperty("Health 0-100");
  });

  it("should process multiple jobs in a single request", async () => {
    const payload = JSON.stringify({
      action: "analyze_photos",
      source: "Grow Photos",
      idempotency_scope: "photo_page_url+date",
      requested_fields_out: [],
      jobs: [
        {
          photo_page_url: "https://notion.so/photo1",
          photo_file_urls: ["https://example.com/photo1.jpg"],
          date: "2024-01-01",
        },
        {
          photo_page_url: "https://notion.so/photo2",
          photo_file_urls: ["https://example.com/photo2.jpg"],
          date: "2024-01-02",
        },
        {
          photo_page_url: "https://notion.so/photo3",
          photo_file_urls: ["https://example.com/photo3.jpg"],
          date: "2024-01-03",
        },
      ],
    });

    const signature = createHmac("sha256", "test-secret-key")
      .update(payload)
      .digest("hex");

    const response = await app.inject({
      method: "POST",
      url: "/analyze",
      headers: {
        "x-signature": signature,
        "content-type": "application/json",
      },
      payload,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.results).toHaveLength(3);
    expect(body.results.every((r: { status: string }) => r.status === "ok")).toBe(true);
  });

  it("should return 400 for invalid request body", async () => {
    const payload = JSON.stringify({
      action: "wrong_action",
      source: "Grow Photos",
      idempotency_scope: "photo_page_url+date",
      requested_fields_out: [],
      jobs: [],
    });

    const signature = createHmac("sha256", "test-secret-key")
      .update(payload)
      .digest("hex");

    const response = await app.inject({
      method: "POST",
      url: "/analyze",
      headers: {
        "x-signature": signature,
        "content-type": "application/json",
      },
      payload,
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("error");
  });

  it("should validate job date format", async () => {
    const payload = JSON.stringify({
      action: "analyze_photos",
      source: "Grow Photos",
      idempotency_scope: "photo_page_url+date",
      requested_fields_out: [],
      jobs: [
        {
          photo_page_url: "https://notion.so/photo",
          photo_file_urls: ["https://example.com/photo.jpg"],
          date: "01-01-2024", // Invalid format
        },
      ],
    });

    const signature = createHmac("sha256", "test-secret-key")
      .update(payload)
      .digest("hex");

    const response = await app.inject({
      method: "POST",
      url: "/analyze",
      headers: {
        "x-signature": signature,
        "content-type": "application/json",
      },
      payload,
    });

    expect(response.statusCode).toBe(400);
  });

  it("should handle rate limiting bypass token", async () => {
    const payload = JSON.stringify({
      action: "analyze_photos",
      source: "Grow Photos",
      idempotency_scope: "photo_page_url+date",
      requested_fields_out: [],
      jobs: [
        {
          photo_page_url: "https://notion.so/photo",
          photo_file_urls: ["https://example.com/photo.jpg"],
          date: "2024-01-01",
        },
      ],
    });

    const signature = createHmac("sha256", "test-secret-key")
      .update(payload)
      .digest("hex");

    const response = await app.inject({
      method: "POST",
      url: "/analyze",
      headers: {
        "x-signature": signature,
        "x-rate-limit-bypass": "bypass-token",
        "content-type": "application/json",
      },
      payload,
    });

    expect(response.statusCode).toBe(200);
  });

  it("should return 401 for missing HMAC signature", async () => {
    const payload = JSON.stringify({
      action: "analyze_photos",
      source: "Grow Photos",
      idempotency_scope: "photo_page_url+date",
      requested_fields_out: [],
      jobs: [
        {
          photo_page_url: "https://notion.so/photo",
          photo_file_urls: ["https://example.com/photo.jpg"],
          date: "2024-01-01",
        },
      ],
    });

    const response = await app.inject({
      method: "POST",
      url: "/analyze",
      headers: {
        "content-type": "application/json",
      },
      payload,
    });

    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.body);
    expect(body).toEqual({ error: "unauthorized" });
  });

  it("should return 401 for invalid HMAC signature", async () => {
    const payload = JSON.stringify({
      action: "analyze_photos",
      source: "Grow Photos",
      idempotency_scope: "photo_page_url+date",
      requested_fields_out: [],
      jobs: [
        {
          photo_page_url: "https://notion.so/photo",
          photo_file_urls: ["https://example.com/photo.jpg"],
          date: "2024-01-01",
        },
      ],
    });

    const response = await app.inject({
      method: "POST",
      url: "/analyze",
      headers: {
        "x-signature": "invalid-signature",
        "content-type": "application/json",
      },
      payload,
    });

    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.body);
    expect(body).toEqual({ error: "bad signature" });
  });

  it("should include security headers in response", async () => {
    const payload = JSON.stringify({
      action: "analyze_photos",
      source: "Grow Photos",
      idempotency_scope: "photo_page_url+date",
      requested_fields_out: [],
      jobs: [
        {
          photo_page_url: "https://notion.so/photo",
          photo_file_urls: ["https://example.com/photo.jpg"],
          date: "2024-01-01",
        },
      ],
    });

    const signature = createHmac("sha256", "test-secret-key")
      .update(payload)
      .digest("hex");

    const response = await app.inject({
      method: "POST",
      url: "/analyze",
      headers: {
        "x-signature": signature,
        "content-type": "application/json",
      },
      payload,
    });

    expect(response.headers).toHaveProperty("x-content-type-options", "nosniff");
    expect(response.headers).toHaveProperty("x-frame-options", "DENY");
    expect(response.headers).toHaveProperty("x-xss-protection", "1; mode=block");
    expect(response.headers).toHaveProperty("referrer-policy", "no-referrer");
  });
});
