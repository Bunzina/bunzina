import { mockFn } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import type { Context } from 'elysia';

const mockDb = mockFn<
  (..._args: unknown[]) => Promise<unknown[]>
>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;

mockDb.mockImplementation(() => Promise.resolve([]));
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

import { listAutoPartsHandler } from './list';

describe('list auto parts handler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
  });

  test('should list auto parts with pagination', async () => {
    mockDb.mockImplementation(() =>
      Promise.resolve([
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Filtro de Óleo',
          description: 'Filtro para óleo do motor',
          price: 4500,
          stock: 10,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ] as unknown[]),
    );

    const context = {
      request: { method: 'GET', headers: new Headers(), body: null },
      query: { page: '1', limit: '20' },
    } as unknown as Context;

    const response = await listAutoPartsHandler(context);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(await response.json()).toEqual(
      expect.objectContaining({
        data: [
          expect.objectContaining({
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Filtro de Óleo',
          }),
        ],
        pagination: {
          page: 1,
          limit: 20,
        },
      }),
    );
  });

  test('should return 400 when pagination is invalid', async () => {
    const context = {
      request: { method: 'GET', headers: new Headers(), body: null },
      query: { page: '0', limit: '999' },
    } as unknown as Context;

    const response = await listAutoPartsHandler(context);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual(
      expect.objectContaining({
        reason: 'Invalid data in request',
        invalidParams: expect.any(Array),
      }),
    );
  });
});
