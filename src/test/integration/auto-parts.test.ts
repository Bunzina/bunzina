import type { StockMovementsListResponse } from '@/adapters/output/auto-part/dtos/stock-movements-list-response';
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

  test('POST/GET/LIST/PUT/DELETE /auto-parts', async () => {
    const { token } = await createUserAndLogin();
    const autoPart = await createAutoPart(token);

    const listResponse = await handleRequest(
      authRequest('/auto-parts?page=1&limit=10', token, { method: 'GET' }),
    );
    expect(listResponse.status).toBe(200);
    expect(await listResponse.json()).toEqual({
      data: [
        {
          id: autoPart.id,
          name: 'Oil Filter',
          description: 'Standard oil filter',
          price: 4500.77,
          stock: 10,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
      },
    });

    const findResponse = await handleRequest(
      authRequest(`/auto-parts/${autoPart.id}`, token, { method: 'GET' }),
    );
    expect(findResponse.status).toBe(200);
    expect(await findResponse.json()).toEqual({
      id: autoPart.id,
      name: 'Oil Filter',
      description: 'Standard oil filter',
      price: 4500.77,
      stock: 10,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

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
    expect(await updateResponse.json()).toEqual({
      id: autoPart.id,
      name: 'Updated Oil Filter',
      description: 'Updated description',
      price: 4800,
      stock: 12,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    const stockMovementsResponse = await handleRequest(
      authRequest(
        `/auto-parts/${autoPart.id}/stock-movements?page=1&limit=10`,
        token,
        {
          method: 'GET',
        },
      ),
    );
    expect(stockMovementsResponse.status).toBe(200);
    const stockMovementsBody =
      (await stockMovementsResponse.json()) as StockMovementsListResponse;
    expect(stockMovementsBody).toEqual({
      data: [
        {
          id: expect.any(String),
          autoPartId: autoPart.id,
          quantity: 2,
          type: 'IN',
          serviceOrderId: null,
          createdAt: expect.any(String),
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
      },
    });

    const deleteResponse = await handleRequest(
      authRequest(`/auto-parts/${autoPart.id}`, token, { method: 'DELETE' }),
    );
    expect(deleteResponse.status).toBe(204);

    const findAfterDeleteResponse = await handleRequest(
      authRequest(`/auto-parts/${autoPart.id}`, token, { method: 'GET' }),
    );
    expect(findAfterDeleteResponse.status).toBe(404);
  });
});
