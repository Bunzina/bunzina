import { mockFn } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import type { Context } from 'elysia';

const mockDb = mockFn<
  (..._args: unknown[]) => Promise<unknown[]>
>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;

mockDb.mockImplementation(() => Promise.resolve([]));
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

import { listStockMovementsHandler } from './list-stock-movements';

describe('list stock movements handler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
  });

  test('should list stock movements with pagination', async () => {
    const autoPartId = '550e8400-e29b-41d4-a716-446655440001';

    mockDb
      .mockResolvedValueOnce([
        {
          id: autoPartId,
          name: 'Filtro de Oleo',
          description: 'Filtro para oleo do motor',
          price: 4500,
          stock: 10,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ] as unknown[])
      .mockResolvedValueOnce([
        {
          id: '550e8400-e29b-41d4-a716-446655440010',
          auto_part_id: autoPartId,
          quantity: 5,
          type: 'IN',
          service_order_id: undefined,
          created_at: new Date(),
        },
      ] as unknown[]);

    const context = {
      request: { method: 'GET', headers: new Headers(), body: null },
      params: { id: autoPartId },
      query: { page: '1', limit: '20' },
    } as unknown as Context;

    const response = await listStockMovementsHandler(context);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(await response.json()).toEqual(
      expect.objectContaining({
        data: [expect.objectContaining({ autoPartId, type: 'IN' })],
        pagination: {
          page: 1,
          limit: 20,
        },
      }),
    );
  });
});
