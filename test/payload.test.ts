import { describe, it, expect } from "vitest";
import {
  WritebacksSchema,
  JobSchema,
  AnalyzeRequestSchema,
  AnalyzeResultSchema,
  AnalyzeResponseSchema,
} from "../src/domain/payload.js";

describe("WritebacksSchema", () => {
  it("should accept valid writebacks with all fields", () => {
    const data = {
      "AI Summary": "Plant looks healthy",
      "Health 0-100": 85,
      "AI Next Step": "Raise light",
      "VPD OK": true,
      "DLI OK": false,
      "CO2 OK": true,
      "Trend": "Improving",
      "DLI mol": 35.5,
      "VPD kPa": 1.2,
      "Sev": "Low",
    };

    const result = WritebacksSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should accept partial writebacks", () => {
    const data = {
      "AI Summary": "Test",
      "Health 0-100": 50,
    };

    const result = WritebacksSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should accept empty writebacks", () => {
    const data = {};

    const result = WritebacksSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject health score below 0", () => {
    const data = {
      "Health 0-100": -1,
    };

    const result = WritebacksSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject health score above 100", () => {
    const data = {
      "Health 0-100": 101,
    };

    const result = WritebacksSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject non-integer health scores", () => {
    const data = {
      "Health 0-100": 85.5,
    };

    const result = WritebacksSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should accept valid AI Next Step enum values", () => {
    const validSteps = [
      "None", "RH up", "RH down", "Dim", "Raise light",
      "Feed", "Flush", "IPM", "Defol", "Stake"
    ];

    for (const step of validSteps) {
      const result = WritebacksSchema.safeParse({ "AI Next Step": step });
      expect(result.success).toBe(true);
    }
  });

  it("should accept custom string for AI Next Step", () => {
    const data = {
      "AI Next Step": "Custom action not in enum",
    };

    const result = WritebacksSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should accept valid Trend values", () => {
    const trends = ["Improving", "Stable", "Declining"];

    for (const trend of trends) {
      const result = WritebacksSchema.safeParse({ "Trend": trend });
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid Trend values", () => {
    const data = {
      "Trend": "Invalid",
    };

    const result = WritebacksSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should accept valid Sev values", () => {
    const sevs = ["Low", "Medium", "High", "Critical"];

    for (const sev of sevs) {
      const result = WritebacksSchema.safeParse({ "Sev": sev });
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid Sev values", () => {
    const data = {
      "Sev": "Invalid",
    };

    const result = WritebacksSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("JobSchema", () => {
  const validJob = {
    photo_page_url: "https://example.com/photo",
    photo_file_urls: ["https://example.com/photo.jpg"],
    date: "2024-01-15",
  };

  it("should accept valid minimal job", () => {
    const result = JobSchema.safeParse(validJob);
    expect(result.success).toBe(true);
  });

  it("should accept job with all fields", () => {
    const data = {
      ...validJob,
      photo_title: "Top view",
      angle: "top",
      plant_id: "BLUE",
      log_entry_url: "https://example.com/log",
      stage: "vegetative",
      room_name: "Grow Room A",
      fixture: "LED 1000W",
      photoperiod_h: 18,
      notes: "Looking good",
    };

    const result = JobSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject invalid photo_page_url", () => {
    const data = {
      ...validJob,
      photo_page_url: "not-a-url",
    };

    const result = JobSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject empty photo_file_urls array", () => {
    const data = {
      ...validJob,
      photo_file_urls: [],
    };

    const result = JobSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject invalid date format", () => {
    const invalidDates = [
      "2024/01/15",  // Wrong separator
      "01-15-2024",  // Wrong order
      "2024-1-15",   // Missing leading zero
      "not-a-date",  // Not a date
    ];

    for (const date of invalidDates) {
      const result = JobSchema.safeParse({ ...validJob, date });
      expect(result.success).toBe(false);
    }
  });

  it("should accept valid date formats", () => {
    const validDates = [
      "2024-01-15",
      "2024-12-31",
      "2000-01-01",
    ];

    for (const date of validDates) {
      const result = JobSchema.safeParse({ ...validJob, date });
      expect(result.success).toBe(true);
    }
  });

  it("should accept valid angle values", () => {
    const validAngles = [
      "top", "close", "under-canopy", "trichomes",
      "canopy", "bud-site", "full-plant", "deficiency",
      "tent", "stem", "roots", "other"
    ];

    for (const angle of validAngles) {
      const result = JobSchema.safeParse({ ...validJob, angle });
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid angle values", () => {
    const data = {
      ...validJob,
      angle: "invalid-angle",
    };

    const result = JobSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should accept valid plant_id values", () => {
    const validIds = ["BLUE", "GREEN", "OUTDOOR-A", "OUTDOOR-B"];

    for (const plant_id of validIds) {
      const result = JobSchema.safeParse({ ...validJob, plant_id });
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid plant_id values", () => {
    const data = {
      ...validJob,
      plant_id: "INVALID",
    };

    const result = JobSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject invalid log_entry_url", () => {
    const data = {
      ...validJob,
      log_entry_url: "not-a-url",
    };

    const result = JobSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("AnalyzeRequestSchema", () => {
  const validRequest = {
    action: "analyze_photos",
    source: "Grow Photos",
    idempotency_scope: "photo_page_url+date",
    requested_fields_out: ["AI Summary", "Health 0-100"],
    jobs: [
      {
        photo_page_url: "https://example.com/photo",
        photo_file_urls: ["https://example.com/photo.jpg"],
        date: "2024-01-15",
      },
    ],
  };

  it("should accept valid request", () => {
    const result = AnalyzeRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it("should reject wrong action", () => {
    const data = {
      ...validRequest,
      action: "wrong_action",
    };

    const result = AnalyzeRequestSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject wrong source", () => {
    const data = {
      ...validRequest,
      source: "Wrong Source",
    };

    const result = AnalyzeRequestSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject wrong idempotency_scope", () => {
    const data = {
      ...validRequest,
      idempotency_scope: "wrong_scope",
    };

    const result = AnalyzeRequestSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject empty jobs array", () => {
    const data = {
      ...validRequest,
      jobs: [],
    };

    const result = AnalyzeRequestSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject more than 100 jobs", () => {
    const data = {
      ...validRequest,
      jobs: Array(101).fill(validRequest.jobs[0]),
    };

    const result = AnalyzeRequestSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should accept exactly 100 jobs", () => {
    const data = {
      ...validRequest,
      jobs: Array(100).fill(validRequest.jobs[0]),
    };

    const result = AnalyzeRequestSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});

describe("AnalyzeResultSchema", () => {
  it("should accept valid successful result", () => {
    const data = {
      photo_page_url: "https://example.com/photo",
      status: "ok",
      writebacks: {
        "AI Summary": "Healthy",
        "Health 0-100": 85,
      },
    };

    const result = AnalyzeResultSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should accept valid error result", () => {
    const data = {
      photo_page_url: "https://example.com/photo",
      status: "error",
      error: "Failed to process",
    };

    const result = AnalyzeResultSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject invalid status", () => {
    const data = {
      photo_page_url: "https://example.com/photo",
      status: "invalid",
    };

    const result = AnalyzeResultSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject invalid photo_page_url", () => {
    const data = {
      photo_page_url: "not-a-url",
      status: "ok",
    };

    const result = AnalyzeResultSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("AnalyzeResponseSchema", () => {
  it("should accept valid response with results", () => {
    const data = {
      results: [
        {
          photo_page_url: "https://example.com/photo",
          status: "ok",
          writebacks: {
            "AI Summary": "Healthy",
          },
        },
      ],
      errors: [],
    };

    const result = AnalyzeResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should accept response with errors", () => {
    const data = {
      results: [
        {
          photo_page_url: "https://example.com/photo",
          status: "error",
          error: "Processing failed",
        },
      ],
      errors: ["Processing failed"],
    };

    const result = AnalyzeResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should accept empty results", () => {
    const data = {
      results: [],
      errors: [],
    };

    const result = AnalyzeResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject missing results field", () => {
    const data = {
      errors: [],
    };

    const result = AnalyzeResponseSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should reject missing errors field", () => {
    const data = {
      results: [],
    };

    const result = AnalyzeResponseSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
