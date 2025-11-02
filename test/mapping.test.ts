import { describe, it, expect } from "vitest";

import { mapWritebacksToPhotos, buildHistoryProps } from "../src/domain/mapping.js";

describe("mapping helpers", () => {
  it("maps every defined writeback to photo properties", () => {
    const writebacks = {
      "AI Summary": "Great shape",
      "Health 0-100": 92,
      "AI Next Step": "Raise light",
      "VPD OK": true,
      "DLI OK": false,
      "CO2 OK": true,
      "Trend": "Improving",
      "DLI mol": 35.2,
      "VPD kPa": 1.31,
      "Sev": "Medium",
    } as const;

    const props = mapWritebacksToPhotos(writebacks);

    expect(props).toEqual({
      "AI Summary": "Great shape",
      "Health 0-100": 92,
      "AI Next Step (sel)": "Raise light",
      "AI Next Step": "Raise light",
      "VPD OK": true,
      "DLI OK": false,
      "CO2 OK": true,
      "Trend": "Improving",
      "DLI mol": 35.2,
      "VPD kPa": 1.31,
      "Sev": "Medium",
    });
  });

  it("builds history props with contextual information", () => {
    const props = buildHistoryProps({
      plant_id: "GREEN",
      date: "2024-01-02",
      angle: "canopy",
      photo_page_url: "https://example.com/photo",
      log_entry_url: "https://example.com/log",
      wb: {
        "AI Summary": "Steady growth",
        "Health 0-100": 88,
        "DLI mol": 30,
        "VPD kPa": 1.2,
        "VPD OK": true,
        "DLI OK": false,
        "CO2 OK": true,
        "Sev": "Low",
      },
    });

    expect(props).toEqual({
      Name: "GREEN - 2024-01-02 - canopy",
      "Related Photo": ["https://example.com/photo"],
      Date: "2024-01-02",
      "Related Log Entry": ["https://example.com/log"],
      "userDefined:ID": "GREEN",
      "AI Summary": "Steady growth",
      "Health 0-100": 88,
      "DLI mol": 30,
      "VPD kPa": 1.2,
      "VPD OK": true,
      "DLI OK": false,
      "CO2 OK": true,
      "Sev": "Low",
      Status: "Complete",
    });
  });
});
