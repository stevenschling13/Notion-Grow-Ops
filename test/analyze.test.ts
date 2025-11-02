import { describe, it, expect, beforeAll } from "vitest";
import { buildServer } from "../src/server.js";
import { createHmac } from "crypto";

describe("POST /analyze endpoint", () => {
  let app: Awaited<ReturnType<typeof buildServer>>;

  beforeAll(async () => {
    process.env.HMAC_SECRET = "test-secret-key";
    app = await buildServer();
  });

  describe("validation", () => {
    it("should reject request with missing required fields", async () => {
      const payload = JSON.stringify({
        action: "analyze_photos",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: [],
        // missing jobs field
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

    it("should reject request with empty jobs array", async () => {
      const payload = JSON.stringify({
        action: "analyze_photos",
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
    });

    it("should reject request with invalid job data", async () => {
      const payload = JSON.stringify({
        action: "analyze_photos",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: [],
        jobs: [
          {
            photo_page_url: "not-a-url",
            photo_file_urls: [],
            date: "invalid-date",
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

    it("should accept valid request with single job", async () => {
      const payload = JSON.stringify({
        action: "analyze_photos",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: [],
        jobs: [
          {
            photo_page_url: "https://example.com/page",
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

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty("results");
      expect(body.results).toHaveLength(1);
      expect(body.results[0]).toHaveProperty("status", "ok");
    });

    it("should accept valid request with multiple jobs", async () => {
      const payload = JSON.stringify({
        action: "analyze_photos",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: [],
        jobs: [
          {
            photo_page_url: "https://example.com/page1",
            photo_file_urls: ["https://example.com/photo1.jpg"],
            date: "2024-01-01",
          },
          {
            photo_page_url: "https://example.com/page2",
            photo_file_urls: ["https://example.com/photo2.jpg"],
            date: "2024-01-02",
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
      expect(body.results).toHaveLength(2);
    });
  });

  describe("HMAC edge cases", () => {
    it("should reject request with non-hex signature", async () => {
      const payload = JSON.stringify({
        action: "analyze_photos",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: [],
        jobs: [
          {
            photo_page_url: "https://example.com/page",
            photo_file_urls: ["https://example.com/photo.jpg"],
            date: "2024-01-01",
          },
        ],
      });

      const response = await app.inject({
        method: "POST",
        url: "/analyze",
        headers: {
          "x-signature": "not-a-hex-string!!!",
          "content-type": "application/json",
        },
        payload,
      });

      expect(response.statusCode).toBe(401);
    });

    it("should reject request with signature of wrong length", async () => {
      const payload = JSON.stringify({
        action: "analyze_photos",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: [],
        jobs: [],
      });

      const response = await app.inject({
        method: "POST",
        url: "/analyze",
        headers: {
          "x-signature": "abcd",
          "content-type": "application/json",
        },
        payload,
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("response format", () => {
    it("should return results and errors arrays", async () => {
      const payload = JSON.stringify({
        action: "analyze_photos",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: [],
        jobs: [
          {
            photo_page_url: "https://example.com/page",
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

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty("results");
      expect(body).toHaveProperty("errors");
      expect(Array.isArray(body.results)).toBe(true);
      expect(Array.isArray(body.errors)).toBe(true);
    });

    it("should include writebacks in successful results", async () => {
      const payload = JSON.stringify({
        action: "analyze_photos",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: [],
        jobs: [
          {
            photo_page_url: "https://example.com/page",
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

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.results[0]).toHaveProperty("writebacks");
      expect(body.results[0].writebacks).toHaveProperty("AI Summary");
    });
  });
});
