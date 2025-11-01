import { z } from "zod";

export const WritebacksSchema = z.object({
  "AI Summary": z.string().optional(),
  "Health 0-100": z.number().int().min(0).max(100).optional(),
  "AI Next Step": z
    .enum([
      "None","RH up","RH down","Dim","Raise light","Feed","Flush","IPM","Defol","Stake"
    ])
    .or(z.string())
    .optional(),
  "VPD OK": z.boolean().optional(),
  "DLI OK": z.boolean().optional(),
  "CO2 OK": z.boolean().optional(),
  "Trend": z.enum(["Improving","Stable","Declining"]).optional(),
  "DLI mol": z.number().optional(),
  "VPD kPa": z.number().optional(),
  "Sev": z.enum(["Low","Medium","High","Critical"]).optional(),
});

export type Writebacks = z.infer<typeof WritebacksSchema>;

export const JobSchema = z.object({
  photo_page_url: z.string().url(),
  photo_file_urls: z.array(z.string().url()).min(1),
  photo_title: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  angle: z
    .enum([
      "top","close","under-canopy","trichomes",
      "canopy","bud-site","full-plant","deficiency","tent","stem","roots","other",
    ])
    .optional(),
  plant_id: z.enum(["BLUE","GREEN","OUTDOOR-A","OUTDOOR-B"]).optional(),
  log_entry_url: z.string().url().optional(),
  stage: z.string().optional(),
  room_name: z.string().optional(),
  fixture: z.string().optional(),
  photoperiod_h: z.number().optional(),
  notes: z.string().optional(),
});

export type AnalyzeJob = z.infer<typeof JobSchema>;

export const AnalyzeRequestSchema = z.object({
  action: z.literal("analyze_photos"),
  source: z.literal("Grow Photos"),
  idempotency_scope: z.literal("photo_page_url+date"),
  requested_fields_out: z.array(z.string()),
  jobs: z.array(JobSchema).min(1).max(100),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

export const AnalyzeResultSchema = z.object({
  photo_page_url: z.string().url(),
  status: z.enum(["ok","error"]),
  error: z.string().optional(),
  writebacks: WritebacksSchema.optional(),
});

export const AnalyzeResponseSchema = z.object({
  results: z.array(AnalyzeResultSchema),
  errors: z.array(z.string()),
});

export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;
