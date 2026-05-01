import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import {
  authRequest,
  createCustomer,
  createUserAndLogin,
  createVehicle,
  handleRequest,
  setupIntegration,
  truncateDatabase,
} from './helpers';

describe('Integration - Vehicles endpoints', () => {
  beforeAll(async () => {
    await setupIntegration();
  });

  afterEach(async () => {
    await truncateDatabase();
  });

  test('POST/GET/LIST/PUT/DELETE /vehicles', async () => {
    const { token } = await createUserAndLogin();
    const { customer } = await createCustomer(token);
    const vehicle = await createVehicle(token, customer.id);

    const listResponse = await handleRequest(
      authRequest('/vehicles?page=1&limit=10', token, { method: 'GET' }),
    );
    expect(listResponse.status).toBe(200);

    const findResponse = await handleRequest(
      authRequest(`/vehicles/${vehicle.id}`, token, { method: 'GET' }),
    );
    expect(findResponse.status).toBe(200);

    const updateResponse = await handleRequest(
      authRequest(`/vehicles/${vehicle.id}`, token, {
        method: 'PUT',
        body: JSON.stringify({
          customerId: customer.id,
          licensePlate: 'ABC1D23',
          model: 'Model 3',
          brand: 'Tesla',
          year: 2023,
        }),
      }),
    );
    expect(updateResponse.status).toBe(200);

    const deleteResponse = await handleRequest(
      authRequest(`/vehicles/${vehicle.id}`, token, { method: 'DELETE' }),
    );
    expect(deleteResponse.status).toBe(204);
  });
});
