import { mockFn } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import type { Context } from 'elysia';

const mockDb = mockFn<
  (..._args: unknown[]) => Promise<unknown[]>
>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;

mockDb.mockImplementation(() => Promise.resolve([]));
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

import { updateServiceHandler } from './update';

describe('Update Service Handler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
  });

  test('should update an existing service', async () => {
    const serviceData = {
      name: 'Updated Service Name',
      description: 'Updated Service Description',
      price: 150,
      durationInMinutes: 90,
      isActive: false,
    };

    mockDb.mockImplementation(() =>
      Promise.resolve([
        {
          ...serviceData,
          id: '550e8400-e29b-41d4-a716-446655440000',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ] as unknown[]),
    );

    const context = {
      request: {
        method: 'PUT',
        headers: new Headers(),
      },
      body: serviceData,
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
    } as unknown as Context;

    const response = await updateServiceHandler(context);

    expect(response.status).toBe(201);
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });
});
