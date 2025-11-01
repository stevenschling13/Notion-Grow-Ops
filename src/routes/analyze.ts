import { FastifyInstance } from 'fastify';
import { createHmac } from 'crypto';
import { AnalyzeRequestSchema, AnalyzeResponseSchema } from '../domain/payload';
import { mapWritebacksToPhotos, buildHistoryProps } from '../domain/mapping';
import { updatePhoto, upsertHistory } from '../notion';

async function findHistoryByPhotoAndDate(_photoUrl: string, _date: string): Promise<string | null> {
  // TODO: implement Notion query; placeholder returns null to create
  return null;
}

export default async function analyzeRoute(app: FastifyInstance) {
  app.post('/analyze', { config: { rawBody: true } }, async (req, reply) => {
    if ((req.headers['content-type'] || '').indexOf('application/json') !== 0) {
      return reply.code(415).send({ error: 'unsupported media type' });
    }
    const secret = process.env.HMAC_SECRET || '';
    const sig = req.headers['x-signature'];
    if (!secret || typeof sig !== 'string') {
      return reply.code(401).send({ error: 'unauthorized' });
    }
    const raw = (req as any).rawBody || '';
    const h = createHmac('sha256', secret).update(raw).digest('hex');
    if (h !== sig) return reply.code(401).send({ error: 'bad signature' });

    const parsed = AnalyzeRequestSchema.safeParse(req.body as unknown);
    if (!parsed.success) {
      return reply.code(422).send({ error: parsed.error.flatten() });
    }

    const { jobs } = parsed.data;
    const results = await Promise.all(jobs.map(async (job) => {
      try {
        // mock writebacks as before (vision omitted)
        const writebacks = {
          'AI Summary': 'Healthy canopy, RH slightly low for stage.',
          'Health 0-100': 88,
          'AI Next Step': 'Raise light'
        } as const;

        // Photos update (Reviewed + Reviewed at)
        const photoProps = mapWritebacksToPhotos(writebacks);
        photoProps['AI Status'] = 'Reviewed';
        photoProps['Reviewed at'] = new Date().toISOString();
        // NOTE: pageId resolution from URL still to implement
        // await updatePhoto(pageIdFromUrl(job.photo_page_url), photoProps);

        // AI History upsert (Entry/Timestamp mapping)
        const historyProps = buildHistoryProps({
          photo_page_url: job.photo_page_url,
          date: job.date,
          wb: writebacks,
        });
        await upsertHistory({
          historyDataSourceId: process.env.NOTION_AI_HISTORY_DATA_SOURCE_ID,
          historyParentId: process.env.NOTION_AI_HISTORY_DATABASE_ID,
          properties: historyProps,
          findExisting: () => findHistoryByPhotoAndDate(job.photo_page_url, job.date),
        });

        return { photo_page_url: job.photo_page_url, status: 'ok', writebacks };
      } catch (e: any) {
        return { photo_page_url: job.photo_page_url, status: 'error', error: e?.message || 'analysis failed' };
      }
    }));

    const response = { results, errors: results.filter(r => r.status === 'error').map(r => r.error || 'error') };
    const validated = AnalyzeResponseSchema.parse(response);
    return reply.code(200).send(validated);
  });
}
