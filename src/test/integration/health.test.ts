import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { handleRequest, setupIntegration, truncateDatabase } from './helpers';

describe('Integration - Health endpoints', () => {
  beforeAll(async () => {
    await setupIntegration();
  });

  afterEach(async () => {
    await truncateDatabase();
  });

  test('GET /health returns ok', async () => {
    const response = await handleRequest(
      new Request('http://localhost/health'),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });
});
