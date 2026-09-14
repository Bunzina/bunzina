import { mockFn } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import type { Context } from 'elysia';

const mockDb = mockFn<
  (..._args: unknown[]) => Promise<unknown[]>
>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
mockDb.mockImplementation(() => Promise.resolve([]));
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

import { loginHandler } from './login';

describe('login handler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
  });

  test('should return 400 when body is invalid', async () => {
    const ctx = {
      request: { method: 'POST', headers: new Headers() },
      body: {
        document: 'invalid',
        password: '',
      },
    } as unknown as Context;

    const result = await loginHandler(ctx);

    expect(result?.status).toBe(400);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
  });

  test('should return 401 when user is not found', async () => {
    mockDb.mockImplementation(() => Promise.resolve([]));

    const ctx = {
      request: { method: 'POST', headers: new Headers() },
      body: {
        document: '111.444.777-35',
        password: 'password123',
      },
    } as unknown as Context;

    const result = await loginHandler(ctx);

    expect(result?.status).toBe(401);
  });
});
