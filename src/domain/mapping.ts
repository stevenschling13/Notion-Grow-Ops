import type { Writebacks } from './payload';

export function mapWritebacksToPhotos(wb: Writebacks): Record<string, any> {
  const props: Record<string, any> = {};
  if (wb['AI Summary'] !== undefined) props['AI Summary'] = wb['AI Summary'];
  if (wb['Health 0-100'] !== undefined) props['Health 0-100'] = wb['Health 0-100'];
  if (wb['AI Next Step'] !== undefined) props['AI Next Step'] = wb['AI Next Step'];
  if (wb['DLI mol'] !== undefined) props['DLI mol'] = wb['DLI mol'];
  if (wb['VPD kPa'] !== undefined) props['VPD kPa'] = wb['VPD kPa'];
  if (wb['VPD OK'] !== undefined) props['VPD OK'] = wb['VPD OK'];
  if (wb['DLI OK'] !== undefined) props['DLI OK'] = wb['DLI OK'];
  if (wb['CO2 OK'] !== undefined) props['CO2 OK'] = wb['CO2 OK'];
  if (wb['Sev'] !== undefined) props['Sev'] = wb['Sev'];
  if (wb['Trend'] !== undefined) props['Trend'] = wb['Trend'];
  return props;
}

export function buildHistoryProps(input: {
  photo_page_url: string;
  date: string;
  wb: Writebacks;
  entryId?: string;
  canopyIndex?: number;
}): Record<string, any> {
  const props: Record<string, any> = {
    Entry: `${input.date}`,
    Timestamp: input.date,
    Photo: [input.photo_page_url],
  };
  if (input.wb['AI Summary'] !== undefined) props['AI Summary'] = input.wb['AI Summary'];
  if (input.wb['AI Next Step'] !== undefined) props['AI Next Step'] = input.wb['AI Next Step'];
  if (input.wb['Health 0-100'] !== undefined) props['Health 0-100'] = input.wb['Health 0-100'];
  if (input.canopyIndex !== undefined) props['Canopy Index'] = input.canopyIndex;
  if (input.entryId !== undefined) props['Entry ID'] = input.entryId;
  return props;
}
