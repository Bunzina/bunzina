import { mockFn } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import type { Context } from 'elysia';

const mockDb = mockFn<
  (..._args: unknown[]) => Promise<unknown[]>
>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;

mockDb.mockImplementation(() => Promise.resolve([]));
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

import { findAutoPartHandler } from './find';

describe('find auto part handler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
  });

  test('should find an auto-part by id', async () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174000';

    mockDb.mockImplementation(() =>
      Promise.resolve([
        {
          id: validUUID,
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
      params: { id: validUUID },
    } as unknown as Context;

    const response = await findAutoPartHandler(context);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });
});
