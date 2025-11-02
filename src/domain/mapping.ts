import type { Writebacks } from "./payload.js";

export type PhotosUpdate = {
  pageUrl: string;
  properties: Record<string, unknown>;
};

export type HistoryUpsert = {
  key: string; // sha256(photo_page_url + date)
  properties: Record<string, unknown>;
};

/**
 * Maps AI analysis writebacks to Notion Photos database properties.
 * 
 * Transforms the AI analysis results into the format expected by the Notion Photos database.
 * Special handling for "AI Next Step" which maps to both a select field and a text field.
 * 
 * @param wb - Writebacks object containing AI analysis results
 * @returns Object with Notion property names mapped to their corresponding values
 * 
 * @example
 * ```typescript
 * const writebacks = {
 *   "AI Summary": "Plant looks healthy",
 *   "Health 0-100": 85,
 *   "AI Next Step": "Raise light"
 * };
 * const properties = mapWritebacksToPhotos(writebacks);
 * // Returns: {
 * //   "AI Summary": "Plant looks healthy",
 * //   "Health 0-100": 85,
 * //   "AI Next Step (sel)": "Raise light",
 * //   "AI Next Step": "Raise light"
 * // }
 * ```
 */
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

/**
 * Builds Notion AI History database properties from job context and writebacks.
 * 
 * Creates a complete property object for the AI History database, including:
 * - A generated name combining plant ID, date, and angle
 * - Links to related photo and log entry pages
 * - All relevant analysis metrics from writebacks
 * - Status set to "Complete"
 * 
 * @param input - Object containing job context and writebacks
 * @param input.plant_id - Optional plant identifier (e.g., "BLUE", "GREEN")
 * @param input.date - Date in YYYY-MM-DD format
 * @param input.angle - Optional photo angle (e.g., "top", "close")
 * @param input.photo_page_url - URL of the photo page in Notion
 * @param input.log_entry_url - Optional URL of the related log entry
 * @param input.wb - Writebacks object with AI analysis results
 * @returns Object with Notion AI History database properties
 * 
 * @example
 * ```typescript
 * const props = buildHistoryProps({
 *   plant_id: "BLUE",
 *   date: "2024-01-15",
 *   angle: "top",
 *   photo_page_url: "https://notion.so/photo-123",
 *   log_entry_url: "https://notion.so/log-456",
 *   wb: { "AI Summary": "Healthy", "Health 0-100": 90 }
 * });
 * // Returns: {
 * //   Name: "BLUE - 2024-01-15 - top",
 * //   "Related Photo": ["https://notion.so/photo-123"],
 * //   Date: "2024-01-15",
 * //   "Related Log Entry": ["https://notion.so/log-456"],
 * //   "userDefined:ID": "BLUE",
 * //   "AI Summary": "Healthy",
 * //   "Health 0-100": 90,
 * //   Status: "Complete"
 * // }
 * ```
 */
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
