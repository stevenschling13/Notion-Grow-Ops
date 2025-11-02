import { describe, it, expect } from "vitest";
import { mapWritebacksToPhotos, buildHistoryProps } from "../src/domain/mapping.js";

describe("mapping helpers", () => {
  it("maps severity and select fields to photo properties", () => {
    const props = mapWritebacksToPhotos({
      "AI Summary": "Summary",
      "Health 0-100": 77,
      "AI Next Step": "Raise light",
      "VPD OK": true,
      "DLI OK": false,
      "CO2 OK": true,
      "Trend": "Improving",
      "DLI mol": 33.5,
      "VPD kPa": 1.25,
      "Sev": "Medium",
    });

    expect(props).toMatchObject({
      "AI Summary": "Summary",
      "Health 0-100": 77,
      "AI Next Step": "Raise light",
      "AI Next Step (sel)": "Raise light",
      "VPD OK": true,
      "DLI OK": false,
      "CO2 OK": true,
      "Trend": "Improving",
      "DLI mol": 33.5,
      "VPD kPa": 1.25,
      "Sev": "Medium",
    });
  });

  it("builds history props with related fields", () => {
    const props = buildHistoryProps({
      plant_id: "BLUE",
      date: "2024-06-01",
      angle: "top",
      photo_page_url: "https://notion.so/photo",
      log_entry_url: "https://notion.so/log",
      wb: {
        "AI Summary": "Looks good",
        "Health 0-100": 92,
        "VPD OK": true,
        "DLI OK": true,
        "CO2 OK": true,
        "Sev": "Low",
      },
    });

    expect(props).toMatchObject({
      Name: "BLUE - 2024-06-01 - top",
      "Related Photo": ["https://notion.so/photo"],
      "Related Log Entry": ["https://notion.so/log"],
      Date: "2024-06-01",
      "userDefined:ID": "BLUE",
      "AI Summary": "Looks good",
      "Health 0-100": 92,
      "VPD OK": true,
      "DLI OK": true,
      "CO2 OK": true,
      "Sev": "Low",
      Status: "Complete",
    });
  });
});
