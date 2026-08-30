import { mockFn } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import type { Context } from 'elysia';

const mockDb = mockFn<
  (..._args: unknown[]) => Promise<unknown[]>
>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
mockDb.mockImplementation(() => Promise.resolve([]));
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

import { findUserHandler } from './find';

describe('find user handler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
  });

  test('should return 200 when finding a user', async () => {
    mockDb.mockImplementation(() =>
      Promise.resolve([
        {
          id: crypto.randomUUID(),
          name: 'John Doe',
          document: '11144477735',
          email: 'john@example.com',
          password_hash: 'hashed-password',
          role: 'ADMIN',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ] as unknown[]),
    );

    const ctx = {
      request: { method: 'GET' },
      params: { id: crypto.randomUUID() },
    } as unknown as Context;

    const result = await findUserHandler(ctx);

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('application/json');
  });

  test('should return 500 when an internal error occurs', async () => {
    mockDb.mockImplementation(() => {
      throw new Error('db error');
    });

    const ctx = {
      request: {},
      params: { id: crypto.randomUUID() },
    } as unknown as Context;

    const result = await findUserHandler(ctx);

    expect(result.status).toBe(500);
    expect(await result.json()).toEqual({ error: 'Failed to find user' });
  });
});
