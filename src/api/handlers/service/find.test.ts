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

  test('should return service with averageExecutionTimeMs when completed items exist', async () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174001';

    let callCount = 0;
    mockDb.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve([
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
        ] as unknown[]);
      }
      return Promise.resolve([
        { avg_execution_time: 5000 },
      ] as unknown[]);
    });

    const context = {
      request: { method: 'GET', headers: new Headers(), body: null },
      params: { id: validUUID },
    } as unknown as Context;

    const response = await findServiceHandler(context);
    const responseBody = (await response.json()) as { averageExecutionTimeMs?: number | null };

    expect(response.status).toBe(200);
    expect(responseBody).toHaveProperty('averageExecutionTimeMs');
    expect(responseBody.averageExecutionTimeMs).toBe(5000);
  });

  test('should return service with null averageExecutionTimeMs when no completed items', async () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174002';

    let callCount = 0;
    mockDb.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve([
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
        ] as unknown[]);
      }
      return Promise.resolve([
        { avg_execution_time: null },
      ] as unknown[]);
    });

    const context = {
      request: { method: 'GET', headers: new Headers(), body: null },
      params: { id: validUUID },
    } as unknown as Context;

    const response = await findServiceHandler(context);
    const responseBody = (await response.json()) as { averageExecutionTimeMs?: number | null };

    expect(response.status).toBe(200);
    expect(responseBody).toHaveProperty('averageExecutionTimeMs');
    expect(responseBody.averageExecutionTimeMs).toBeNull();
  });
});
