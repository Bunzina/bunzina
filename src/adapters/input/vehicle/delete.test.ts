import type { DeleteVehicleUseCase } from '@/application/use-cases/vehicle/delete';
import type { MockProxy } from 'bun-mock-extended';
import { mock, any } from 'bun-mock-extended';
import { describe, expect, test, beforeEach } from 'bun:test';
import type { Context } from 'elysia';
import { DeleteVehicleInput } from './delete';

describe('delete vehicle input', () => {
  let deleteVehicleUseCase: MockProxy<DeleteVehicleUseCase>;
  let deleteVehicleInput: DeleteVehicleInput;

  beforeEach(() => {
    deleteVehicleUseCase = mock();
    deleteVehicleInput = new DeleteVehicleInput(deleteVehicleUseCase);
  });

  test('should delete a vehicle', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    deleteVehicleUseCase.execute.calledWith(any()).mockResolvedValue(undefined);

    const context = {
      params: { id },
    } as unknown as Context;

    const result = await deleteVehicleInput.execute(context);

    expect(result.status).toBe(204);
    expect(deleteVehicleUseCase.execute).toHaveBeenCalledWith({
      id,
    });
  });

  test('should return 500 if use case throws', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';

    deleteVehicleUseCase.execute
      .calledWith(any())
      .mockRejectedValue(new Error('unexpected error'));

    const context = {
      params: { id },
    } as unknown as Context;

    const result = await deleteVehicleInput.execute(context);

    expect(result.status).toBe(500);
  });

  test('should return 400 if validation fails', async () => {
    const context = {
      params: { id: 'invalid-uuid' },
    } as unknown as Context;

    const result = await deleteVehicleInput.execute(context);

    expect(result.status).toBe(400);
  });
});
