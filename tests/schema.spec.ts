import { describe, it, expect } from "vitest";
import { AnalyzeRequestSchema, JobSchema } from "../src/domain/payload.js";

describe("Schema Validation", () => {
  describe("JobSchema", () => {
    it("should validate a valid job", () => {
      const validJob = {
        photo_page_url: "https://notion.so/test-12345678901234567890123456789012",
        photo_file_urls: ["https://example.com/photo.jpg"],
        date: "2024-01-01",
        angle: "top",
        plant_id: "BLUE",
      };

      const result = JobSchema.safeParse(validJob);
      expect(result.success).toBe(true);
    });

    it("should reject invalid photo_page_url", () => {
      const invalidJob = {
        photo_page_url: "not-a-url",
        photo_file_urls: ["https://example.com/photo.jpg"],
        date: "2024-01-01",
      };

      const result = JobSchema.safeParse(invalidJob);
      expect(result.success).toBe(false);
    });

    it("should reject invalid date format", () => {
      const invalidJob = {
        photo_page_url: "https://notion.so/test-12345678901234567890123456789012",
        photo_file_urls: ["https://example.com/photo.jpg"],
        date: "01/01/2024", // Wrong format
      };

      const result = JobSchema.safeParse(invalidJob);
      expect(result.success).toBe(false);
    });

    it("should reject empty photo_file_urls", () => {
      const invalidJob = {
        photo_page_url: "https://notion.so/test-12345678901234567890123456789012",
        photo_file_urls: [],
        date: "2024-01-01",
      };

      const result = JobSchema.safeParse(invalidJob);
      expect(result.success).toBe(false);
    });

    it("should accept valid angle enum values", () => {
      const validAngles = ["top", "close", "under-canopy", "trichomes"];

      validAngles.forEach((angle) => {
        const job = {
          photo_page_url: "https://notion.so/test-12345678901234567890123456789012",
          photo_file_urls: ["https://example.com/photo.jpg"],
          date: "2024-01-01",
          angle,
        };

        const result = JobSchema.safeParse(job);
        expect(result.success).toBe(true);
      });
    });

    it("should accept valid plant_id enum values", () => {
      const validPlantIds = ["BLUE", "GREEN", "OUTDOOR-A", "OUTDOOR-B"];

      validPlantIds.forEach((plant_id) => {
        const job = {
          photo_page_url: "https://notion.so/test-12345678901234567890123456789012",
          photo_file_urls: ["https://example.com/photo.jpg"],
          date: "2024-01-01",
          plant_id,
        };

        const result = JobSchema.safeParse(job);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("AnalyzeRequestSchema", () => {
    it("should validate a complete valid request", () => {
      const validRequest = {
        action: "analyze_photos",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: ["AI Summary", "Health 0-100"],
        jobs: [
          {
            photo_page_url: "https://notion.so/test-12345678901234567890123456789012",
            photo_file_urls: ["https://example.com/photo.jpg"],
            date: "2024-01-01",
            angle: "top",
            plant_id: "BLUE",
          },
        ],
      };

      const result = AnalyzeRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it("should reject wrong action value", () => {
      const invalidRequest = {
        action: "wrong_action",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: [],
        jobs: [
          {
            photo_page_url: "https://notion.so/test-12345678901234567890123456789012",
            photo_file_urls: ["https://example.com/photo.jpg"],
            date: "2024-01-01",
          },
        ],
      };

      const result = AnalyzeRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("should reject empty jobs array", () => {
      const invalidRequest = {
        action: "analyze_photos",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: [],
        jobs: [],
      };

      const result = AnalyzeRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("should reject more than 100 jobs", () => {
      const jobs = Array.from({ length: 101 }, (_, i) => ({
        photo_page_url: `https://notion.so/test-${i}-12345678901234567890123456789012`,
        photo_file_urls: ["https://example.com/photo.jpg"],
        date: "2024-01-01",
      }));

      const invalidRequest = {
        action: "analyze_photos",
        source: "Grow Photos",
        idempotency_scope: "photo_page_url+date",
        requested_fields_out: [],
        jobs,
      };

      const result = AnalyzeRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it("should reject missing required fields", () => {
      const invalidRequest = {
        action: "analyze_photos",
        // Missing source, idempotency_scope, requested_fields_out, jobs
      };

      const result = AnalyzeRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });
});
