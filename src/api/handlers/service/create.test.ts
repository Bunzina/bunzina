import { mockFn } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import type { Context } from 'elysia';

const mockDb = mockFn<
  (..._args: unknown[]) => Promise<unknown[]>
>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;

mockDb.mockImplementation(() => Promise.resolve([]));
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

import { createServiceHandler } from './create';

describe('Create Service Handler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
  });

  test('should create a new service', async () => {
    const serviceData = {
      name: 'Tire Rotation',
      description: 'Rotate tires for even wear',
      price: 50,
      durationInMinutes: 30,
    };

    mockDb.mockImplementation(() =>
      Promise.resolve([
        {
          ...serviceData,
          id: '123e4567-e89b-12d3-a456-426614174000',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ] as unknown[]),
    );

    const context = {
      request: {
        method: 'POST',
        headers: new Headers(),
      },
      body: serviceData,
      params: {},
    } as unknown as Context;

    const response = await createServiceHandler(context);

    expect(response.status).toBe(201);
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });
});
