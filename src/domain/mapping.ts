import type { Writebacks } from "./payload.js";

export type PhotosUpdate = {
  pageUrl: string;
  properties: Record<string, unknown>;
};

export type HistoryUpsert = {
  key: string; // sha256(photo_page_url + date)
  properties: Record<string, unknown>;
};

// Map writebacks to Photos DB property names
export function mapWritebacksToPhotos(wb: Writebacks): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  if (wb["AI Summary"] !== undefined) props["AI Summary"] = wb["AI Summary"];
  if (wb["Health 0-100"] !== undefined) props["Health 0-100"] = wb["Health 0-100"];
  if (wb["AI Next Step"] !== undefined) {
    // Prefer select if configured; also set text as fallback
    props["AI Next Step (sel)"] = wb["AI Next Step"];
    props["AI Next Step"] = wb["AI Next Step"];
  }
  if (wb["VPD OK"] !== undefined) props["VPD OK"] = wb["VPD OK"];
  if (wb["DLI OK"] !== undefined) props["DLI OK"] = wb["DLI OK"];
  if (wb["CO2 OK"] !== undefined) props["CO2 OK"] = wb["CO2 OK"];
  if (wb["Trend"] !== undefined) props["Trend"] = wb["Trend"];
  if (wb["DLI mol"] !== undefined) props["DLI mol"] = wb["DLI mol"];
  if (wb["VPD kPa"] !== undefined) props["VPD kPa"] = wb["VPD kPa"];
  return props;
}

// Build AI History properties from context + writebacks
export function buildHistoryProps(input: {
  plant_id?: string;
  date: string;
  angle?: string;
  photo_page_url: string;
  log_entry_url?: string;
  wb: Writebacks;
}): Record<string, unknown> {
  const nameParts = [input.plant_id, input.date, input.angle].filter(Boolean) as string[];
  const props: Record<string, unknown> = {
    Name: nameParts.join(" - "),
    "Related Photo": [input.photo_page_url],
    Date: input.date,
  };
  if (input.log_entry_url) props["Related Log Entry"] = [input.log_entry_url];
  if (input.plant_id) props["userDefined:ID"] = input.plant_id;
  if (input.wb["AI Summary"] !== undefined) props["AI Summary"] = input.wb["AI Summary"];
  if (input.wb["Health 0-100"] !== undefined) props["Health 0-100"] = input.wb["Health 0-100"];
  if (input.wb["DLI mol"] !== undefined) props["DLI mol"] = input.wb["DLI mol"];
  if (input.wb["VPD kPa"] !== undefined) props["VPD kPa"] = input.wb["VPD kPa"];
  if (input.wb["VPD OK"] !== undefined) props["VPD OK"] = input.wb["VPD OK"];
  if (input.wb["DLI OK"] !== undefined) props["DLI OK"] = input.wb["DLI OK"];
  if (input.wb["CO2 OK"] !== undefined) props["CO2 OK"] = input.wb["CO2 OK"];
  if (input.wb["Sev"] !== undefined) props["Sev"] = input.wb["Sev"];
  props["Status"] = "Complete";
  return props;
}
