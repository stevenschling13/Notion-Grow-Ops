import { describe, it, expect, beforeAll } from "vitest";
import { buildServer } from "../src/server.js";
import { createHmac } from "crypto";

describe("POST /analyze - Integration Tests", () => {
  let app: Awaited<ReturnType<typeof buildServer>>;

  beforeAll(async () => {
    process.env.HMAC_SECRET = "test-secret-key";
    app = await buildServer();
  });

  function signPayload(payload: string): string {
    return createHmac("sha256", "test-secret-key")
      .update(payload)
      .digest("hex");
  }

  describe("Full endpoint flow", () => {
    it("should process a complete valid request successfully", async () => {
      const payload = JSON.stringify({
        action: "analyze_photos",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: ["AI Summary", "Health 0-100"],
        jobs: [
          {
            photo_page_url: "https://example.com/photo-1",
            photo_file_urls: ["https://example.com/photo1.jpg"],
            photo_title: "Plant Top View",
            date: "2024-01-15",
            angle: "top",
            plant_id: "BLUE",
            log_entry_url: "https://example.com/log-1",
            stage: "vegetative",
            room_name: "Grow Room A",
            fixture: "LED 1000W",
            photoperiod_h: 18,
            notes: "Looking healthy",
          },
        ],
      });

      const signature = signPayload(payload);

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
      expect(body.errors).toHaveLength(0);

      const result = body.results[0];
      expect(result.photo_page_url).toBe("https://example.com/photo-1");
      expect(result.status).toBe("ok");
      expect(result).toHaveProperty("writebacks");
      expect(result.writebacks).toHaveProperty("AI Summary");
      expect(result.writebacks).toHaveProperty("Health 0-100");
    });

    it("should process multiple jobs successfully", async () => {
      const payload = JSON.stringify({
        action: "analyze_photos",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: ["AI Summary"],
        jobs: [
          {
            photo_page_url: "https://example.com/photo-1",
            photo_file_urls: ["https://example.com/photo1.jpg"],
            date: "2024-01-15",
          },
          {
            photo_page_url: "https://example.com/photo-2",
            photo_file_urls: ["https://example.com/photo2.jpg"],
            date: "2024-01-16",
          },
          {
            photo_page_url: "https://example.com/photo-3",
            photo_file_urls: ["https://example.com/photo3.jpg"],
            date: "2024-01-17",
          },
        ],
      });

      const signature = signPayload(payload);

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
      expect(body.errors).toHaveLength(0);

      for (let i = 0; i < 3; i++) {
        const result = body.results[i];
        expect(result.status).toBe("ok");
        expect(result).toHaveProperty("writebacks");
      }
    });

    it("should handle minimal job configuration", async () => {
      const payload = JSON.stringify({
        action: "analyze_photos",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: [],
        jobs: [
          {
            photo_page_url: "https://example.com/minimal",
            photo_file_urls: ["https://example.com/minimal.jpg"],
            date: "2024-01-15",
          },
        ],
      });

      const signature = signPayload(payload);

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
      expect(body.results).toHaveLength(1);
      expect(body.results[0].status).toBe("ok");
    });
  });

  describe("Validation errors", () => {
    it("should reject request with invalid action", async () => {
      const payload = JSON.stringify({
        action: "invalid_action",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: [],
        jobs: [
          {
            photo_page_url: "https://example.com/photo",
            photo_file_urls: ["https://example.com/photo.jpg"],
            date: "2024-01-15",
          },
        ],
      });

      const signature = signPayload(payload);

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

    it("should reject request with missing required fields", async () => {
      const payload = JSON.stringify({
        action: "analyze_photos",
        source: "Grow Photos",
        // Missing idempotency_scope
        requested_fields_out: [],
        jobs: [],
      });

      const signature = signPayload(payload);

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

    it("should reject request with empty jobs array", async () => {
      const payload = JSON.stringify({
        action: "analyze_photos",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: [],
        jobs: [],
      });

      const signature = signPayload(payload);

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

    it("should reject request with invalid date format", async () => {
      const payload = JSON.stringify({
        action: "analyze_photos",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: [],
        jobs: [
          {
            photo_page_url: "https://example.com/photo",
            photo_file_urls: ["https://example.com/photo.jpg"],
            date: "2024/01/15", // Invalid format
          },
        ],
      });

      const signature = signPayload(payload);

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

    it("should reject request with invalid URL", async () => {
      const payload = JSON.stringify({
        action: "analyze_photos",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: [],
        jobs: [
          {
            photo_page_url: "not-a-valid-url",
            photo_file_urls: ["https://example.com/photo.jpg"],
            date: "2024-01-15",
          },
        ],
      });

      const signature = signPayload(payload);

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

    it("should reject request with invalid plant_id", async () => {
      const payload = JSON.stringify({
        action: "analyze_photos",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: [],
        jobs: [
          {
            photo_page_url: "https://example.com/photo",
            photo_file_urls: ["https://example.com/photo.jpg"],
            date: "2024-01-15",
            plant_id: "INVALID_ID",
          },
        ],
      });

      const signature = signPayload(payload);

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

    it("should reject request with invalid angle", async () => {
      const payload = JSON.stringify({
        action: "analyze_photos",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: [],
        jobs: [
          {
            photo_page_url: "https://example.com/photo",
            photo_file_urls: ["https://example.com/photo.jpg"],
            date: "2024-01-15",
            angle: "invalid_angle",
          },
        ],
      });

      const signature = signPayload(payload);

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
  });

  describe("Response structure", () => {
    it("should return expected writeback fields in response", async () => {
      const payload = JSON.stringify({
        action: "analyze_photos",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: ["AI Summary", "Health 0-100", "VPD OK", "DLI OK"],
        jobs: [
          {
            photo_page_url: "https://example.com/photo",
            photo_file_urls: ["https://example.com/photo.jpg"],
            date: "2024-01-15",
          },
        ],
      });

      const signature = signPayload(payload);

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
      const result = body.results[0];
      const writebacks = result.writebacks;

      // Check that response includes expected writeback fields from mock data
      expect(writebacks).toHaveProperty("AI Summary");
      expect(writebacks).toHaveProperty("Health 0-100");
      expect(writebacks).toHaveProperty("VPD OK");
      expect(writebacks).toHaveProperty("DLI OK");
      expect(writebacks).toHaveProperty("CO2 OK");
      expect(writebacks).toHaveProperty("Trend");
      expect(writebacks).toHaveProperty("DLI mol");
      expect(writebacks).toHaveProperty("VPD kPa");
      expect(writebacks).toHaveProperty("Sev");

      // Validate data types
      expect(typeof writebacks["AI Summary"]).toBe("string");
      expect(typeof writebacks["Health 0-100"]).toBe("number");
      expect(typeof writebacks["VPD OK"]).toBe("boolean");
      expect(typeof writebacks["DLI OK"]).toBe("boolean");
    });
  });

  describe("Special cases", () => {
    it("should handle all valid plant_id values", async () => {
      const plantIds = ["BLUE", "GREEN", "OUTDOOR-A", "OUTDOOR-B"];

      for (const plant_id of plantIds) {
        const payload = JSON.stringify({
          action: "analyze_photos",
          source: "Grow Photos",
          idempotency_scope: "photo_page_url+date",
          requested_fields_out: [],
          jobs: [
            {
              photo_page_url: "https://example.com/photo",
              photo_file_urls: ["https://example.com/photo.jpg"],
              date: "2024-01-15",
              plant_id,
            },
          ],
        });

        const signature = signPayload(payload);

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
      }
    });

    it("should handle all valid angle values", async () => {
      const angles = [
        "top", "close", "under-canopy", "trichomes",
        "canopy", "bud-site", "full-plant", "deficiency",
        "tent", "stem", "roots", "other"
      ];

      for (const angle of angles) {
        const payload = JSON.stringify({
          action: "analyze_photos",
          source: "Grow Photos",
          idempotency_scope: "photo_page_url+date",
          requested_fields_out: [],
          jobs: [
            {
              photo_page_url: "https://example.com/photo",
              photo_file_urls: ["https://example.com/photo.jpg"],
              date: "2024-01-15",
              angle,
            },
          ],
        });

        const signature = signPayload(payload);

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
      }
    });

    it("should handle multiple photo file URLs", async () => {
      const payload = JSON.stringify({
        action: "analyze_photos",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: [],
        jobs: [
          {
            photo_page_url: "https://example.com/photo",
            photo_file_urls: [
              "https://example.com/photo1.jpg",
              "https://example.com/photo2.jpg",
              "https://example.com/photo3.jpg",
            ],
            date: "2024-01-15",
          },
        ],
      });

      const signature = signPayload(payload);

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
    });
  });
});
