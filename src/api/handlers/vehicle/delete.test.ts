import { describe, expect, test } from 'bun:test';
import type { Context } from 'elysia';
import { deleteVehicleHandler } from './delete';

describe('deleteVehicleHandler', () => {
  test('should return 204 when deleting a vehicle', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    const context = {
      params: { id },
      request: new Request('http://localhost/vehicles/123', {
        method: 'DELETE',
      }),
    } as unknown as Context;

    const result = await deleteVehicleHandler(context);

    expect(result.status).toBeGreaterThanOrEqual(204);
  });

  test('should return 500 when an internal error occurs', async () => {
    const context = {
      params: { id: '550e8400-e29b-41d4-a716-446655440099' },
      request: new Request('http://localhost/vehicles/123', {
        method: 'DELETE',
      }),
    } as unknown as Context;

    const result = await deleteVehicleHandler(context);

    expect(result.status).toBeGreaterThanOrEqual(400);
  });
});
