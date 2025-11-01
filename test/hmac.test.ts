import { describe, it, expect, beforeAll } from "vitest";
import { buildServer } from "../src/server.js";
import { createHmac } from "crypto";

describe("HMAC verification", () => {
  let app: Awaited<ReturnType<typeof buildServer>>;

  beforeAll(async () => {
    process.env.HMAC_SECRET = "test-secret-key";
    app = await buildServer();
  });

  it("should reject requests without signature", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/analyze",
      payload: { action: "analyze_photos" },
    });

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body)).toEqual({ error: "unauthorized" });
  });

  it("should reject requests with invalid signature", async () => {
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
        "x-signature": "invalid-signature-value",
        "content-type": "application/json",
      },
      payload,
    });

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body)).toEqual({ error: "bad signature" });
  });

  it("should accept requests with valid signature", async () => {
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
  });

  it("should use timing-safe comparison (reject similar but wrong signature)", async () => {
    const payload = JSON.stringify({
      action: "analyze_photos",
      source: "Grow Photos",
      idempotency_scope: "photo_page_url+date",
      requested_fields_out: [],
      jobs: [],
    });

    const correctSignature = createHmac("sha256", "test-secret-key")
      .update(payload)
      .digest("hex");

    // Create a signature that's almost correct but off by one character
    const almostCorrectSignature =
      correctSignature.slice(0, -1) + (correctSignature.slice(-1) === "a" ? "b" : "a");

    const response = await app.inject({
      method: "POST",
      url: "/analyze",
      headers: {
        "x-signature": almostCorrectSignature,
        "content-type": "application/json",
      },
      payload,
    });

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body)).toEqual({ error: "bad signature" });
  });
});
