import { mockFn } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import type { Context } from 'elysia';

const mockDb = mockFn<
  (..._args: unknown[]) => Promise<unknown[]>
>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
mockDb.mockImplementation(() => Promise.resolve([]));
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

import { createUserHandler } from './create';

describe('create user handler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
  });

  test('should return 201 when creating a user', async () => {
    const ctx = {
      request: { method: 'POST', headers: new Headers() },
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'CUSTOMER',
      },
    } as unknown as Context;

    const result = await createUserHandler(ctx);

    expect(result?.status).toBe(201);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
  });

  test('should return 500 when an internal error occurs', async () => {
    mockDb.mockImplementation(() => {
      throw new Error('db error');
    });

    const ctx = {
      request: { headers: new Headers() },
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'CUSTOMER',
      },
    } as unknown as Context;

    const result = await createUserHandler(ctx);

    expect(result?.status).toBe(500);
    expect(await result?.json()).toEqual({
      error: 'Failed to create user',
    });
  });
});
