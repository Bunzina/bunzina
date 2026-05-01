import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import {
  authRequest,
  createCustomer,
  createUserAndLogin,
  handleRequest,
  setupIntegration,
  truncateDatabase,
  uniqueSuffix,
} from './helpers';

describe('Integration - Customers endpoints', () => {
  beforeAll(async () => {
    await setupIntegration();
  });

  afterEach(async () => {
    await truncateDatabase();
  });

  test('GET /customers/:documentNumber returns 401 without token', async () => {
    const response = await handleRequest(
      new Request('http://localhost/customers/11144477735'),
    );

    expect(response.status).toBe(401);
  });

  test('POST/GET/PUT/DELETE /customers', async () => {
    const { token } = await createUserAndLogin();
    const { customer, payload } = await createCustomer(token);

    const findResponse = await handleRequest(
      authRequest(`/customers/${customer.document}`, token, { method: 'GET' }),
    );
    expect(findResponse.status).toBe(200);

    const updateResponse = await handleRequest(
      authRequest(`/customers/${customer.document}`, token, {
        method: 'PUT',
        body: JSON.stringify({
          ...payload,
          name: 'Updated Customer',
          email: `updated.customer.${uniqueSuffix()}@example.com`,
        }),
      }),
    );
    expect(updateResponse.status).toBe(200);

    const deleteResponse = await handleRequest(
      authRequest(`/customers/${customer.document}`, token, {
        method: 'DELETE',
      }),
    );
    expect(deleteResponse.status).toBe(204);
  });
});
