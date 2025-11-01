import { z } from 'zod';

export const WritebacksSchema = z.object({
  'AI Summary': z.string().optional(),
  'Health 0-100': z.number().optional(),
  'AI Next Step': z.string().optional(),
  'DLI mol': z.number().optional(),
  'VPD kPa': z.number().optional(),
  'VPD OK': z.boolean().optional(),
  'DLI OK': z.boolean().optional(),
  'CO2 OK': z.boolean().optional(),
  'Sev': z.string().optional(),
  'Trend': z.string().optional(),
});

export type Writebacks = z.infer<typeof WritebacksSchema>;

export const AnalyzeJobSchema = z.object({
  photo_page_url: z.string(),
  date: z.string(),
});

export const AnalyzeRequestSchema = z.object({
  jobs: z.array(AnalyzeJobSchema),
});

export const AnalyzeResultSchema = z.object({
  photo_page_url: z.string(),
  status: z.enum(['ok', 'error']),
  writebacks: WritebacksSchema.optional(),
  error: z.string().optional(),
});

export const AnalyzeResponseSchema = z.object({
  results: z.array(AnalyzeResultSchema),
  errors: z.array(z.string()),
});
