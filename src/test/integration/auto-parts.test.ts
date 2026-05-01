import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import {
  authRequest,
  createAutoPart,
  createUserAndLogin,
  handleRequest,
  setupIntegration,
  truncateDatabase,
} from './helpers';

describe('Integration - Auto-parts endpoints', () => {
  beforeAll(async () => {
    await setupIntegration();
  });

  afterEach(async () => {
    await truncateDatabase();
  });

  test('POST/GET/LIST/PUT /auto-parts', async () => {
    const { token } = await createUserAndLogin();
    const autoPart = await createAutoPart(token);

    const listResponse = await handleRequest(
      authRequest('/auto-parts?page=1&limit=10', token, { method: 'GET' }),
    );
    expect(listResponse.status).toBe(200);

    const findResponse = await handleRequest(
      authRequest(`/auto-parts/${autoPart.id}`, token, { method: 'GET' }),
    );
    expect(findResponse.status).toBe(200);

    const updateResponse = await handleRequest(
      authRequest(`/auto-parts/${autoPart.id}`, token, {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Oil Filter',
          description: 'Updated description',
          price: 4800,
          stock: 12,
        }),
      }),
    );
    expect(updateResponse.status).toBe(200);
  });
});
