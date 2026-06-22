import { mockFn } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import type { Context } from 'elysia';
import { listServicesHandler } from './list';

const mockDb = mockFn<
  (..._args: unknown[]) => Promise<unknown[]>
>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;

mockDb.mockImplementation(() => Promise.resolve([]));
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

describe('List Service Handler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
  });

  test('should list services', async () => {
    mockDb.mockImplementation(() =>
      Promise.resolve([
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Oil Change',
          description: 'Full oil change service',
          price: 120,
          duration_in_minutes: 45,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ] as unknown[]),
    );

    const context = {
      request: { method: 'GET', headers: new Headers(), body: null },
      query: { page: '1', limit: '10' },
    } as unknown as Context;

    const response = await listServicesHandler(context);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });
});
