import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import {
  createUserAndLogin,
  handleRequest,
  jsonRequest,
  setupIntegration,
  truncateDatabase,
} from './helpers';

describe('Integration - Auth endpoints', () => {
  beforeAll(async () => {
    await setupIntegration();
  });

  afterEach(async () => {
    await truncateDatabase();
  });

  test('POST /auth/login returns 422 for invalid payload', async () => {
    const response = await handleRequest(
      jsonRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ document: 'invalid', password: '' }),
      }),
    );

    expect(response.status).toBe(422);
  });

  test('POST /auth/login returns token for valid credentials', async () => {
    const { token } = await createUserAndLogin();
    expect(token).toBeTruthy();
  });
});
