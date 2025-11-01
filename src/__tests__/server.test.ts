import { describe, it, expect } from 'vitest';
import { buildServer } from '../server';

describe('Server', () => {
  it('should have /health endpoint', async () => {
    const app = await buildServer();
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ ok: true });
    await app.close();
  });
});
