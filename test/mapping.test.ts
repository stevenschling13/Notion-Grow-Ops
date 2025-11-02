import { describe, expect, it } from "vitest";
import {
  mapWritebacksToPhotos,
  buildHistoryProps,
  buildHistoryKey,
} from "../src/domain/mapping.js";

const writebacks = {
  "AI Summary": "Healthy canopy",
  "Health 0-100": 92,
  "AI Next Step": "Raise light",
  "VPD OK": true,
  "DLI OK": false,
  "CO2 OK": true,
  "Trend": "Improving",
  "DLI mol": 37.2,
  "VPD kPa": 1.21,
  "Sev": "Low",
} as const;

describe("mapping utilities", () => {
  it("maps writebacks to photo properties", () => {
    const props = mapWritebacksToPhotos(writebacks);
    expect(props).toMatchObject({
      "AI Summary": "Healthy canopy",
      "AI Next Step": "Raise light",
      "AI Next Step (sel)": "Raise light",
      "Health 0-100": 92,
      "VPD OK": true,
    });
  });

  it("builds history keys deterministically", () => {
    const key = buildHistoryKey({ photo_page_url: "https://notion.so/test", date: "2024-01-01" });
    const keyAgain = buildHistoryKey({ photo_page_url: "https://notion.so/test", date: "2024-01-01" });
    expect(key).toEqual(keyAgain);
  });

  it("builds history properties with key", () => {
    const key = buildHistoryKey({ photo_page_url: "https://notion.so/test", date: "2024-01-01" });
    const props = buildHistoryProps({
      plant_id: "BLUE",
      date: "2024-01-01",
      angle: "top",
      photo_page_url: "https://notion.so/test",
      log_entry_url: "https://notion.so/log",
      wb: writebacks,
      key,
    });

    expect(props).toMatchObject({
      Name: "BLUE - 2024-01-01 - top",
      Key: key,
      "Related Photo": ["https://notion.so/test"],
      "Related Log Entry": ["https://notion.so/log"],
    });
  });
});
