import { mockFn } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import type { Context } from 'elysia';

const mockDb = mockFn<
  (..._args: unknown[]) => Promise<unknown[]>
>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;

mockDb.mockImplementation(() => Promise.resolve([]));
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

import { findServiceHandler } from './find';

describe('Find Service Handler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
  });

  test('should find a service by ID', async () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174000';

    mockDb.mockImplementation(() =>
      Promise.resolve([
        {
          id: validUUID,
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
      params: { id: validUUID },
    } as unknown as Context;

    const response = await findServiceHandler(context);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });
});
