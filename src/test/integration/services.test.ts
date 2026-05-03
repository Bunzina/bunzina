import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import {
  authRequest,
  createService,
  createUserAndLogin,
  handleRequest,
  setupIntegration,
  truncateDatabase,
} from './helpers';

describe('Integration - Services endpoints', () => {
  beforeAll(async () => {
    await setupIntegration();
  });

  afterEach(async () => {
    await truncateDatabase();
  });

  test('POST/GET/PUT/DELETE /services', async () => {
    const { token } = await createUserAndLogin();
    const service = await createService(token);

    const findResponse = await handleRequest(
      authRequest(`/services/${service.id}`, token, { method: 'GET' }),
    );
    expect(findResponse.status).toBe(200);

    const updateResponse = await handleRequest(
      authRequest(`/services/${service.id}`, token, {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Oil Change',
          description: 'Updated description',
          price: 200,
          durationInMinutes: 90,
          isActive: true,
        }),
      }),
    );
    expect(updateResponse.status).toBe(200);

    const deleteResponse = await handleRequest(
      authRequest(`/services/${service.id}`, token, { method: 'DELETE' }),
    );
    expect(deleteResponse.status).toBe(204);
  });
});
