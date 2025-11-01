import Fastify from 'fastify';
import rawBody from 'fastify-raw-body';
import analyzeRoute from './routes/analyze.js';
import rateLimit from '@fastify/rate-limit';

export async function buildServer() {
  const app = Fastify({ logger: true, bodyLimit: 2 * 1024 * 1024, requestTimeout: 15000 });
  await app.register(rawBody, { field: 'rawBody', global: true, runFirst: true, encoding: 'utf8' });
  await app.register(rateLimit, { max: 300, timeWindow: '1 minute' });
  app.get('/health', async () => ({ ok: true }));
  await app.register(analyzeRoute);
  return app;
}
