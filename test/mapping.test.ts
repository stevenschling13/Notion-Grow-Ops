import { describe, it, expect } from "vitest";
import { mapWritebacksToPhotos, buildHistoryProps } from "../src/domain/mapping.js";
import type { Writebacks } from "../src/domain/payload.js";

describe("mapWritebacksToPhotos", () => {
  it("should map all defined properties correctly", () => {
    const writebacks: Writebacks = {
      "AI Summary": "Test summary",
      "Health 0-100": 85,
      "AI Next Step": "Feed",
      "VPD OK": true,
      "DLI OK": false,
      "CO2 OK": true,
      "Trend": "Improving",
      "DLI mol": 40.5,
      "VPD kPa": 1.2,
      "Sev": "Low",
    };

    const result = mapWritebacksToPhotos(writebacks);

    expect(result).toEqual({
      "AI Summary": "Test summary",
      "Health 0-100": 85,
      "AI Next Step (sel)": "Feed",
      "AI Next Step": "Feed",
      "VPD OK": true,
      "DLI OK": false,
      "CO2 OK": true,
      "Trend": "Improving",
      "DLI mol": 40.5,
      "VPD kPa": 1.2,
    });
  });

  it("should handle partial writebacks", () => {
    const writebacks: Writebacks = {
      "AI Summary": "Partial test",
      "Health 0-100": 90,
    };

    const result = mapWritebacksToPhotos(writebacks);

    expect(result).toEqual({
      "AI Summary": "Partial test",
      "Health 0-100": 90,
    });
  });

  it("should handle empty writebacks", () => {
    const writebacks: Writebacks = {};
    const result = mapWritebacksToPhotos(writebacks);
    expect(result).toEqual({});
  });

  it("should handle AI Next Step correctly", () => {
    const writebacks: Writebacks = {
      "AI Next Step": "Raise light",
    };

    const result = mapWritebacksToPhotos(writebacks);

    expect(result).toEqual({
      "AI Next Step (sel)": "Raise light",
      "AI Next Step": "Raise light",
    });
  });
});

describe("buildHistoryProps", () => {
  it("should build history props with all fields", () => {
    const input = {
      plant_id: "BLUE",
      date: "2024-01-01",
      angle: "top" as const,
      photo_page_url: "https://example.com/page",
      log_entry_url: "https://example.com/log",
      wb: {
        "AI Summary": "Test summary",
        "Health 0-100": 95,
        "DLI mol": 38.5,
        "VPD kPa": 1.3,
        "VPD OK": true,
        "DLI OK": true,
        "CO2 OK": false,
        "Sev": "Medium" as const,
      },
    };

    const result = buildHistoryProps(input);

    expect(result).toEqual({
      Name: "BLUE - 2024-01-01 - top",
      "Related Photo": ["https://example.com/page"],
      Date: "2024-01-01",
      Status: "Complete",
      "Related Log Entry": ["https://example.com/log"],
      "userDefined:ID": "BLUE",
      "AI Summary": "Test summary",
      "Health 0-100": 95,
      "DLI mol": 38.5,
      "VPD kPa": 1.3,
      "VPD OK": true,
      "DLI OK": true,
      "CO2 OK": false,
      "Sev": "Medium",
    });
  });

  it("should build history props with minimal fields", () => {
    const input = {
      date: "2024-01-15",
      photo_page_url: "https://example.com/page2",
      wb: {},
    };

    const result = buildHistoryProps(input);

    expect(result).toEqual({
      Name: "2024-01-15",
      "Related Photo": ["https://example.com/page2"],
      Date: "2024-01-15",
      Status: "Complete",
    });
  });

  it("should build name correctly with only plant_id and date", () => {
    const input = {
      plant_id: "GREEN",
      date: "2024-02-01",
      photo_page_url: "https://example.com/page3",
      wb: {},
    };

    const result = buildHistoryProps(input);

    expect(result.Name).toBe("GREEN - 2024-02-01");
  });

  it("should build name correctly with date and angle but no plant_id", () => {
    const input = {
      date: "2024-02-01",
      angle: "close" as const,
      photo_page_url: "https://example.com/page4",
      wb: {},
    };

    const result = buildHistoryProps(input);

    expect(result.Name).toBe("2024-02-01 - close");
  });
});
