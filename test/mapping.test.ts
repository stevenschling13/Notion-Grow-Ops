import { describe, it, expect } from "vitest";
import { mapWritebacksToPhotos, buildHistoryProps } from "../src/domain/mapping.js";
import type { Writebacks } from "../src/domain/payload.js";

describe("mapWritebacksToPhotos", () => {
  it("should map all writebacks to photo properties", () => {
    const writebacks: Writebacks = {
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

    const result = mapWritebacksToPhotos(writebacks);

    expect(result).toEqual({
      "AI Summary": "Plant looks healthy",
      "Health 0-100": 85,
      "AI Next Step (sel)": "Raise light",
      "AI Next Step": "Raise light",
      "VPD OK": true,
      "DLI OK": false,
      "CO2 OK": true,
      "Trend": "Improving",
      "DLI mol": 35.5,
      "VPD kPa": 1.2,
    });
  });

  it("should handle partial writebacks with only some fields", () => {
    const writebacks: Writebacks = {
      "AI Summary": "Needs attention",
      "Health 0-100": 60,
    };

    const result = mapWritebacksToPhotos(writebacks);

    expect(result).toEqual({
      "AI Summary": "Needs attention",
      "Health 0-100": 60,
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

    expect(result).toEqual({
      "AI Next Step (sel)": "Feed",
      "AI Next Step": "Feed",
    });
  });

  it("should handle boolean values correctly", () => {
    const writebacks: Writebacks = {
      "VPD OK": false,
      "DLI OK": true,
      "CO2 OK": false,
    };

    const result = mapWritebacksToPhotos(writebacks);

    expect(result).toEqual({
      "VPD OK": false,
      "DLI OK": true,
      "CO2 OK": false,
    });
  });

  it("should handle numeric values including zero", () => {
    const writebacks: Writebacks = {
      "Health 0-100": 0,
      "DLI mol": 0,
      "VPD kPa": 0,
    };

    const result = mapWritebacksToPhotos(writebacks);

    expect(result).toEqual({
      "Health 0-100": 0,
      "DLI mol": 0,
      "VPD kPa": 0,
    });
  });
});

describe("buildHistoryProps", () => {
  it("should build complete history properties with all fields", () => {
    const writebacks: Writebacks = {
      "AI Summary": "Healthy growth",
      "Health 0-100": 90,
      "DLI mol": 40.0,
      "VPD kPa": 1.5,
      "VPD OK": true,
      "DLI OK": true,
      "CO2 OK": true,
      "Sev": "Low",
    };

    const result = buildHistoryProps({
      plant_id: "BLUE",
      date: "2024-01-15",
      angle: "top",
      photo_page_url: "https://notion.so/photo-123",
      log_entry_url: "https://notion.so/log-456",
      wb: writebacks,
    });

    expect(result).toEqual({
      Name: "BLUE - 2024-01-15 - top",
      "Related Photo": ["https://notion.so/photo-123"],
      Date: "2024-01-15",
      "Related Log Entry": ["https://notion.so/log-456"],
      "userDefined:ID": "BLUE",
      "AI Summary": "Healthy growth",
      "Health 0-100": 90,
      "DLI mol": 40.0,
      "VPD kPa": 1.5,
      "VPD OK": true,
      "DLI OK": true,
      "CO2 OK": true,
      "Sev": "Low",
      "Status": "Complete",
    });
  });

  it("should build history properties without optional fields", () => {
    const writebacks: Writebacks = {
      "AI Summary": "Basic analysis",
    };

    const result = buildHistoryProps({
      date: "2024-01-15",
      photo_page_url: "https://notion.so/photo-123",
      wb: writebacks,
    });

    expect(result).toEqual({
      Name: "2024-01-15",
      "Related Photo": ["https://notion.so/photo-123"],
      Date: "2024-01-15",
      "AI Summary": "Basic analysis",
      "Status": "Complete",
    });
  });

  it("should build correct name from plant_id only", () => {
    const writebacks: Writebacks = {};

    const result = buildHistoryProps({
      plant_id: "GREEN",
      date: "2024-01-15",
      photo_page_url: "https://notion.so/photo-123",
      wb: writebacks,
    });

    expect(result.Name).toBe("GREEN - 2024-01-15");
  });

  it("should build correct name from plant_id and angle", () => {
    const writebacks: Writebacks = {};

    const result = buildHistoryProps({
      plant_id: "BLUE",
      date: "2024-01-15",
      angle: "close",
      photo_page_url: "https://notion.so/photo-123",
      wb: writebacks,
    });

    expect(result.Name).toBe("BLUE - 2024-01-15 - close");
  });

  it("should always include Status as Complete", () => {
    const writebacks: Writebacks = {};

    const result = buildHistoryProps({
      date: "2024-01-15",
      photo_page_url: "https://notion.so/photo-123",
      wb: writebacks,
    });

    expect(result.Status).toBe("Complete");
  });

  it("should handle all writeback fields", () => {
    const writebacks: Writebacks = {
      "AI Summary": "Test",
      "Health 0-100": 75,
      "DLI mol": 35.0,
      "VPD kPa": 1.3,
      "VPD OK": false,
      "DLI OK": false,
      "CO2 OK": true,
      "Sev": "Medium",
    };

    const result = buildHistoryProps({
      date: "2024-01-15",
      photo_page_url: "https://notion.so/photo-123",
      wb: writebacks,
    });

    expect(result["AI Summary"]).toBe("Test");
    expect(result["Health 0-100"]).toBe(75);
    expect(result["DLI mol"]).toBe(35.0);
    expect(result["VPD kPa"]).toBe(1.3);
    expect(result["VPD OK"]).toBe(false);
    expect(result["DLI OK"]).toBe(false);
    expect(result["CO2 OK"]).toBe(true);
    expect(result["Sev"]).toBe("Medium");
  });

  it("should not include log_entry_url if not provided", () => {
    const writebacks: Writebacks = {};

    const result = buildHistoryProps({
      date: "2024-01-15",
      photo_page_url: "https://notion.so/photo-123",
      wb: writebacks,
    });

    expect(result["Related Log Entry"]).toBeUndefined();
  });

  it("should not include plant_id property if not provided", () => {
    const writebacks: Writebacks = {};

    const result = buildHistoryProps({
      date: "2024-01-15",
      photo_page_url: "https://notion.so/photo-123",
      wb: writebacks,
    });

    expect(result["userDefined:ID"]).toBeUndefined();
  });
});
