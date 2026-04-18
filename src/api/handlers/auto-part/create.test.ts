import { mockFn } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import type { Context } from 'elysia';

const mockDb = mockFn<
  (..._args: unknown[]) => Promise<unknown[]>
>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
mockDb.mockImplementation(() => Promise.resolve([]));
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

import { createAutoPartHandler } from './create';

describe('create auto-part handler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
  });

  test('should return 201 when creating an auto-part', async () => {
    const ctx = {
      request: { method: 'POST' },
      body: {
        name: 'Filtro de Óleo',
        description: 'Filtro para óleo do motor',
        price: 4500,
        stock: 10,
      },
    } as unknown as Context;

    const result = await createAutoPartHandler(ctx);

    expect(result?.status).toBe(201);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
  });

  test('should return 500 when an internal error occurs', async () => {
    mockDb.mockImplementation(() => {
      throw new Error('db error');
    });

    const ctx = {
      request: {},
      body: {
        name: 'Filtro de Óleo',
        description: 'Filtro para óleo do motor',
        price: 4500,
        stock: 10,
      },
    } as unknown as Context;

    const result = await createAutoPartHandler(ctx);

    expect(result?.status).toBe(500);
    expect(await result?.json()).toEqual({
      error: 'Failed to create auto-part',
    });
  });
});
