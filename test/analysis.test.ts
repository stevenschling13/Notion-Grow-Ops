import { describe, it, expect } from "vitest";
import { analyzeJob } from "../src/domain/analysis.js";
import type { AnalyzeJob } from "../src/domain/payload.js";

describe("analyzeJob", () => {
  it("produces stage-aware writebacks", () => {
    const job: AnalyzeJob = {
      photo_page_url: "https://notion.so/photo",
      photo_file_urls: ["https://example.com/photo.jpg"],
      date: "2024-01-01",
      stage: "vegetative",
      angle: "canopy",
      notes: "Plants look vigorous after last feed.",
    };

    const { writebacks } = analyzeJob(job);

    expect(writebacks["AI Summary"]).toContain("Vegetative");
    expect(writebacks["Health 0-100"]).toBeGreaterThanOrEqual(80);
    expect(writebacks["AI Next Step"]).toBe("Raise light");
    expect(writebacks["Trend"]).toBe("Improving");
    expect(typeof writebacks["DLI mol"]).toBe("number");
    expect(typeof writebacks["VPD kPa"]).toBe("number");
  });

  it("downgrades health and recommends intervention when issues are noted", () => {
    const job: AnalyzeJob = {
      photo_page_url: "https://notion.so/photo2",
      photo_file_urls: ["https://example.com/photo2.jpg"],
      date: "2024-01-02",
      stage: "flower",
      angle: "bud-site",
      notes: "Seeing mites on lower leaves, RH feels dry.",
    };

    const { writebacks } = analyzeJob(job);

    expect(writebacks["Health 0-100"]).toBeLessThan(80);
    expect(writebacks["AI Next Step"]).toBe("Defol");
    expect(writebacks["VPD OK"]).toBe(false);
    expect(writebacks["Trend"]).toBe("Declining");
    expect(writebacks["Sev"]).not.toBe("Low");
  });
});
