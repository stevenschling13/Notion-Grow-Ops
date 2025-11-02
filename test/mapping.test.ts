import { describe, it, expect } from "vitest";
import { mapWritebacksToPhotos, buildHistoryProps } from "../src/domain/mapping.js";
import type { Writebacks } from "../src/domain/payload.js";

describe("mapWritebacksToPhotos", () => {
  it("should map all writeback fields to photo properties", () => {
    const writebacks: Writebacks = {
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

    const result = mapWritebacksToPhotos(writebacks);

    expect(result).toEqual({
      "AI Summary": "Healthy canopy",
      "Health 0-100": 88,
      "AI Next Step (sel)": "Raise light",
      "AI Next Step": "Raise light",
      "VPD OK": true,
      "DLI OK": false,
      "CO2 OK": true,
      "Trend": "Improving",
      "DLI mol": 36.7,
      "VPD kPa": 1.38,
    });
  });

  it("should handle optional fields gracefully", () => {
    const writebacks: Writebacks = {
      "AI Summary": "Basic summary",
    };

    const result = mapWritebacksToPhotos(writebacks);

    expect(result).toEqual({
      "AI Summary": "Basic summary",
    });
  });

  it("should handle empty writebacks", () => {
    const writebacks: Writebacks = {};
    const result = mapWritebacksToPhotos(writebacks);
    expect(result).toEqual({});
  });

  it("should map AI Next Step to both select and text fields", () => {
    const writebacks: Writebacks = {
      "AI Next Step": "Feed",
    };

    const result = mapWritebacksToPhotos(writebacks);

    expect(result).toHaveProperty("AI Next Step (sel)", "Feed");
    expect(result).toHaveProperty("AI Next Step", "Feed");
  });
});

describe("buildHistoryProps", () => {
  it("should build complete history properties", () => {
    const writebacks: Writebacks = {
      "AI Summary": "Healthy canopy",
      "Health 0-100": 88,
      "DLI mol": 36.7,
      "VPD kPa": 1.38,
      "VPD OK": true,
      "DLI OK": false,
      "CO2 OK": true,
      "Sev": "Low",
    };

    const result = buildHistoryProps({
      plant_id: "BLUE",
      date: "2024-01-01",
      angle: "top",
      photo_page_url: "https://notion.so/photo",
      log_entry_url: "https://notion.so/log",
      wb: writebacks,
    });

    expect(result).toEqual({
      Name: "BLUE - 2024-01-01 - top",
      "Related Photo": ["https://notion.so/photo"],
      Date: "2024-01-01",
      "Related Log Entry": ["https://notion.so/log"],
      "userDefined:ID": "BLUE",
      "AI Summary": "Healthy canopy",
      "Health 0-100": 88,
      "DLI mol": 36.7,
      "VPD kPa": 1.38,
      "VPD OK": true,
      "DLI OK": false,
      "CO2 OK": true,
      "Sev": "Low",
      Status: "Complete",
    });
  });

  it("should handle minimal input", () => {
    const writebacks: Writebacks = {};

    const result = buildHistoryProps({
      date: "2024-01-01",
      photo_page_url: "https://notion.so/photo",
      wb: writebacks,
    });

    expect(result).toEqual({
      Name: "2024-01-01",
      "Related Photo": ["https://notion.so/photo"],
      Date: "2024-01-01",
      Status: "Complete",
    });
  });

  it("should construct name from available fields", () => {
    const writebacks: Writebacks = {};

    const result = buildHistoryProps({
      plant_id: "GREEN",
      date: "2024-01-15",
      photo_page_url: "https://notion.so/photo",
      wb: writebacks,
    });

    expect(result.Name).toBe("GREEN - 2024-01-15");
  });

  it("should omit optional fields when not provided", () => {
    const writebacks: Writebacks = {
      "AI Summary": "Test summary",
    };

    const result = buildHistoryProps({
      date: "2024-01-01",
      photo_page_url: "https://notion.so/photo",
      wb: writebacks,
    });

    expect(result).not.toHaveProperty("Related Log Entry");
    expect(result).not.toHaveProperty("userDefined:ID");
  });
});
