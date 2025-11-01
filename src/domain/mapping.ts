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
  
  // Direct mapping for simple properties - only access each property once
  const mappings = [
    ["AI Summary", "AI Summary"],
    ["Health 0-100", "Health 0-100"],
    ["VPD OK", "VPD OK"],
    ["DLI OK", "DLI OK"],
    ["CO2 OK", "CO2 OK"],
    ["Trend", "Trend"],
    ["DLI mol", "DLI mol"],
    ["VPD kPa", "VPD kPa"],
  ] as const;
  
  for (const [key, propName] of mappings) {
    const value = wb[key];
    if (value !== undefined) {
      props[propName] = value;
    }
  }
  
  // Special handling for AI Next Step
  const nextStep = wb["AI Next Step"];
  if (nextStep !== undefined) {
    props["AI Next Step (sel)"] = nextStep;
    props["AI Next Step"] = nextStep;
  }
  
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
  // Build name parts efficiently without intermediate array
  const nameParts: string[] = [];
  if (input.plant_id) nameParts.push(input.plant_id);
  nameParts.push(input.date);
  if (input.angle) nameParts.push(input.angle);
  
  const props: Record<string, unknown> = {
    Name: nameParts.join(" - "),
    "Related Photo": [input.photo_page_url],
    Date: input.date,
    Status: "Complete",
  };
  
  // Optional properties - only check once per property
  if (input.log_entry_url) props["Related Log Entry"] = [input.log_entry_url];
  if (input.plant_id) props["userDefined:ID"] = input.plant_id;
  
  // Map writeback properties - only access each once
  const wbMappings = [
    ["AI Summary", "AI Summary"],
    ["Health 0-100", "Health 0-100"],
    ["DLI mol", "DLI mol"],
    ["VPD kPa", "VPD kPa"],
    ["VPD OK", "VPD OK"],
    ["DLI OK", "DLI OK"],
    ["CO2 OK", "CO2 OK"],
    ["Sev", "Sev"],
  ] as const;
  
  for (const [key, propName] of wbMappings) {
    const value = input.wb[key];
    if (value !== undefined) {
      props[propName] = value;
    }
  }
  
  return props;
}
