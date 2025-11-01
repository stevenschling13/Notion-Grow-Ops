import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createHmac } from "crypto";
import { buildServer } from "../src/server.js";
import type { FastifyInstance } from "fastify";

describe("HMAC Signature Verification", () => {
  let app: FastifyInstance;
  const secret = "test-secret-key";

  beforeAll(async () => {
    process.env.HMAC_SECRET = secret;
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  function signPayload(payload: string): string {
    return createHmac("sha256", secret).update(payload).digest("hex");
  }

  it("should accept valid signature", async () => {
    const payload = JSON.stringify({
      action: "analyze_photos",
      source: "Grow Photos",
      idempotency_scope: "photo_page_url+date",
      requested_fields_out: [],
      jobs: [{
        photo_page_url: "https://notion.so/test-12345678901234567890123456789012",
        photo_file_urls: ["https://example.com/photo.jpg"],
        date: "2024-01-01",
      }],
    });
    const signature = signPayload(payload);

    const response = await app.inject({
      method: "POST",
      url: "/analyze",
      headers: {
        "content-type": "application/json",
        "x-signature": signature,
      },
      payload,
    });

    expect(response.statusCode).toBe(200);
  });

  it("should reject invalid signature", async () => {
    const payload = JSON.stringify({
      action: "analyze_photos",
      source: "Grow Photos",
      idempotency_scope: "photo_page_url+date",
      requested_fields_out: [],
      jobs: [{
        photo_page_url: "https://notion.so/test-12345678901234567890123456789012",
        photo_file_urls: ["https://example.com/photo.jpg"],
        date: "2024-01-01",
      }],
    });
    const invalidSignature = "0".repeat(64);

    const response = await app.inject({
      method: "POST",
      url: "/analyze",
      headers: {
        "content-type": "application/json",
        "x-signature": invalidSignature,
      },
      payload,
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: "bad signature" });
  });

  it("should reject signature with different length", async () => {
    const payload = JSON.stringify({
      action: "analyze_photos",
      source: "Grow Photos",
      idempotency_scope: "photo_page_url+date",
      requested_fields_out: [],
      jobs: [{
        photo_page_url: "https://notion.so/test-12345678901234567890123456789012",
        photo_file_urls: ["https://example.com/photo.jpg"],
        date: "2024-01-01",
      }],
    });
    const shortSignature = "abc123";

    const response = await app.inject({
      method: "POST",
      url: "/analyze",
      headers: {
        "content-type": "application/json",
        "x-signature": shortSignature,
      },
      payload,
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: "bad signature" });
  });

  it("should reject missing signature header", async () => {
    const payload = JSON.stringify({
      action: "analyze_photos",
      source: "Grow Photos",
      idempotency_scope: "photo_page_url+date",
      requested_fields_out: [],
      jobs: [{
        photo_page_url: "https://notion.so/test-12345678901234567890123456789012",
        photo_file_urls: ["https://example.com/photo.jpg"],
        date: "2024-01-01",
      }],
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
    expect(response.json()).toEqual({ error: "unauthorized" });
  });

  it("should reject when HMAC_SECRET is not set", async () => {
    const originalSecret = process.env.HMAC_SECRET;
    delete process.env.HMAC_SECRET;
    const testApp = await buildServer();

    const payload = JSON.stringify({
      action: "analyze_photos",
      source: "Grow Photos",
      idempotency_scope: "photo_page_url+date",
      requested_fields_out: [],
      jobs: [{
        photo_page_url: "https://notion.so/test-12345678901234567890123456789012",
        photo_file_urls: ["https://example.com/photo.jpg"],
        date: "2024-01-01",
      }],
    });

    const response = await testApp.inject({
      method: "POST",
      url: "/analyze",
      headers: {
        "content-type": "application/json",
        "x-signature": "test",
      },
      payload,
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: "unauthorized" });

    process.env.HMAC_SECRET = originalSecret;
    await testApp.close();
  });
});
