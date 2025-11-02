import { describe, it, expect } from "vitest";
import {
  WritebacksSchema,
  JobSchema,
  AnalyzeRequestSchema,
  AnalyzeResponseSchema,
} from "../src/domain/payload.js";

describe("WritebacksSchema", () => {
  it("should validate complete writebacks object", () => {
    const writebacks = {
      "AI Summary": "Healthy canopy",
      "Health 0-100": 88,
      "AI Next Step": "Raise light",
      "VPD OK": true,
      "DLI OK": false,
      "CO2 OK": true,
      "Trend": "Improving",
      "DLI mol": 36.7,
      "VPD kPa": 1.38,
      "Sev": "Low",
    };

    const result = WritebacksSchema.safeParse(writebacks);
    expect(result.success).toBe(true);
  });

  it("should validate empty writebacks object", () => {
    const result = WritebacksSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should reject invalid Health 0-100 values", () => {
    const writebacks = { "Health 0-100": 150 };
    const result = WritebacksSchema.safeParse(writebacks);
    expect(result.success).toBe(false);
  });

  it("should reject negative Health 0-100 values", () => {
    const writebacks = { "Health 0-100": -5 };
    const result = WritebacksSchema.safeParse(writebacks);
    expect(result.success).toBe(false);
  });

  it("should validate enum values for AI Next Step", () => {
    const writebacks = { "AI Next Step": "Feed" };
    const result = WritebacksSchema.safeParse(writebacks);
    expect(result.success).toBe(true);
  });

  it("should validate enum values for Trend", () => {
    const writebacks = { "Trend": "Stable" };
    const result = WritebacksSchema.safeParse(writebacks);
    expect(result.success).toBe(true);
  });

  it("should validate enum values for Sev", () => {
    const writebacks = { "Sev": "Critical" };
    const result = WritebacksSchema.safeParse(writebacks);
    expect(result.success).toBe(true);
  });
});

describe("JobSchema", () => {
  it("should validate complete job object", () => {
    const job = {
      photo_page_url: "https://notion.so/photo",
      photo_file_urls: ["https://example.com/photo.jpg"],
      photo_title: "Top view",
      date: "2024-01-01",
      angle: "top",
      plant_id: "BLUE",
      log_entry_url: "https://notion.so/log",
      stage: "vegetative",
      room_name: "Grow Room A",
      fixture: "LED 1000W",
      photoperiod_h: 18,
      notes: "Looking healthy",
    };

    const result = JobSchema.safeParse(job);
    expect(result.success).toBe(true);
  });

  it("should validate minimal job object", () => {
    const job = {
      photo_page_url: "https://notion.so/photo",
      photo_file_urls: ["https://example.com/photo.jpg"],
      date: "2024-01-01",
    };

    const result = JobSchema.safeParse(job);
    expect(result.success).toBe(true);
  });

  it("should reject invalid URLs", () => {
    const job = {
      photo_page_url: "not-a-url",
      photo_file_urls: ["https://example.com/photo.jpg"],
      date: "2024-01-01",
    };

    const result = JobSchema.safeParse(job);
    expect(result.success).toBe(false);
  });

  it("should reject invalid date formats", () => {
    const job = {
      photo_page_url: "https://notion.so/photo",
      photo_file_urls: ["https://example.com/photo.jpg"],
      date: "01-01-2024",
    };

    const result = JobSchema.safeParse(job);
    expect(result.success).toBe(false);
  });

  it("should require at least one photo file URL", () => {
    const job = {
      photo_page_url: "https://notion.so/photo",
      photo_file_urls: [],
      date: "2024-01-01",
    };

    const result = JobSchema.safeParse(job);
    expect(result.success).toBe(false);
  });

  it("should validate angle enum values", () => {
    const job = {
      photo_page_url: "https://notion.so/photo",
      photo_file_urls: ["https://example.com/photo.jpg"],
      date: "2024-01-01",
      angle: "close",
    };

    const result = JobSchema.safeParse(job);
    expect(result.success).toBe(true);
  });

  it("should validate plant_id enum values", () => {
    const job = {
      photo_page_url: "https://notion.so/photo",
      photo_file_urls: ["https://example.com/photo.jpg"],
      date: "2024-01-01",
      plant_id: "GREEN",
    };

    const result = JobSchema.safeParse(job);
    expect(result.success).toBe(true);
  });
});

describe("AnalyzeRequestSchema", () => {
  it("should validate complete request", () => {
    const request = {
      action: "analyze_photos",
      source: "Grow Photos",
      idempotency_scope: "photo_page_url+date",
      requested_fields_out: ["AI Summary", "Health 0-100"],
      jobs: [
        {
          photo_page_url: "https://notion.so/photo",
          photo_file_urls: ["https://example.com/photo.jpg"],
          date: "2024-01-01",
        },
      ],
    };

    const result = AnalyzeRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it("should reject requests with wrong action", () => {
    const request = {
      action: "wrong_action",
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
    };

    const result = AnalyzeRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it("should require at least one job", () => {
    const request = {
      action: "analyze_photos",
      source: "Grow Photos",
      idempotency_scope: "photo_page_url+date",
      requested_fields_out: [],
      jobs: [],
    };

    const result = AnalyzeRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it("should reject more than 100 jobs", () => {
    const jobs = Array(101).fill({
      photo_page_url: "https://notion.so/photo",
      photo_file_urls: ["https://example.com/photo.jpg"],
      date: "2024-01-01",
    });

    const request = {
      action: "analyze_photos",
      source: "Grow Photos",
      idempotency_scope: "photo_page_url+date",
      requested_fields_out: [],
      jobs,
    };

    const result = AnalyzeRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });
});

describe("AnalyzeResponseSchema", () => {
  it("should validate successful response", () => {
    const response = {
      results: [
        {
          photo_page_url: "https://notion.so/photo",
          status: "ok",
          writebacks: {
            "AI Summary": "Healthy canopy",
            "Health 0-100": 88,
          },
        },
      ],
      errors: [],
    };

    const result = AnalyzeResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it("should validate error response", () => {
    const response = {
      results: [
        {
          photo_page_url: "https://notion.so/photo",
          status: "error",
          error: "Analysis failed",
        },
      ],
      errors: ["Analysis failed"],
    };

    const result = AnalyzeResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it("should validate mixed results", () => {
    const response = {
      results: [
        {
          photo_page_url: "https://notion.so/photo1",
          status: "ok",
          writebacks: {
            "AI Summary": "Healthy",
          },
        },
        {
          photo_page_url: "https://notion.so/photo2",
          status: "error",
          error: "Failed",
        },
      ],
      errors: ["Failed"],
    };

    const result = AnalyzeResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });
});
