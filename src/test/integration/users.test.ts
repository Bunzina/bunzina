import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import {
  authRequest,
  createUserAndLogin,
  handleRequest,
  jsonRequest,
  setupIntegration,
  truncateDatabase,
  uniqueSuffix,
} from './helpers';

describe('Integration - Users endpoints', () => {
  beforeAll(async () => {
    await setupIntegration();
  });

  afterEach(async () => {
    await truncateDatabase();
  });

  test('POST /users creates a customer user', async () => {
    const suffix = uniqueSuffix();
    const email = `user.${suffix}@example.com`;
    const document = '52998224725';
    const password = 'senha123';

    const createResponse = await handleRequest(
      jsonRequest('/users', {
        method: 'POST',
        body: JSON.stringify({
          name: 'User Example',
          document,
          email,
          password,
          role: 'CUSTOMER',
        }),
      }),
    );

    expect(createResponse.status).toBe(201);

    const loginResponse = await handleRequest(
      jsonRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ document, password }),
      }),
    );

    expect(loginResponse.status).toBe(200);
  });

  test('GET/PUT/DELETE /users/:id', async () => {
    const { token, userId } = await createUserAndLogin();

    const findResponse = await handleRequest(
      authRequest(`/users/${userId}`, token, { method: 'GET' }),
    );
    expect(findResponse.status).toBe(200);

    const updateResponse = await handleRequest(
      authRequest(`/users/${userId}`, token, {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated User',
          document: '39053344705',
          email: `updated.user.${uniqueSuffix()}@example.com`,
          role: 'CUSTOMER',
          isActive: true,
        }),
      }),
    );
    expect(updateResponse.status).toBe(200);

    const deleteResponse = await handleRequest(
      authRequest(`/users/${userId}`, token, { method: 'DELETE' }),
    );
    expect(deleteResponse.status).toBe(204);
  });
});
