import { VehiclePresenter } from '@/adapters/output/vehicle/vehicle-presenter';
import type { UpdateVehicleUseCase } from '@/application/use-cases/vehicle/update';
import { makeVehicle } from '@/test/factories/make-vehicle';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { UpdateVehicleInput } from './update';

describe('update vehicle input', () => {
  let updateVehicleUseCase: MockProxy<UpdateVehicleUseCase>;
  let updateVehicleInput: UpdateVehicleInput;

  beforeEach(() => {
    updateVehicleUseCase = mock();
    updateVehicleInput = new UpdateVehicleInput(updateVehicleUseCase);
  });

  test('should update a vehicle', async () => {
    const validUUId = '550e8400-e29b-41d4-a716-446655440000';
    const newCustomerId = '550e8400-e29b-41d4-a716-446655440002';
    const vehicle = makeVehicle({ id: validUUId });

    updateVehicleUseCase.execute.calledWith(any()).mockResolvedValue(vehicle);

    const request = {
      params: { id: validUUId },
      body: {
        customerId: newCustomerId,
        licensePlate: 'ABC1D23',
        brand: 'Tesla',
        model: 'Model S',
        year: 2023,
      },
    } as unknown as Context;

    const result = await updateVehicleInput.execute(request);

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual(
      JSON.parse(JSON.stringify(VehiclePresenter.toHttp(vehicle))),
    );

    expect(updateVehicleUseCase.execute).toHaveBeenCalledWith({
      id: validUUId,
      customerId: newCustomerId,
      licensePlate: 'ABC1D23',
      brand: 'Tesla',
      model: 'Model S',
      year: 2023,
    });
  });

  test('should return 500 if use case throws', async () => {
    const validUUId = '550e8400-e29b-41d4-a716-446655440000';
    const newCustomerId = '550e8400-e29b-41d4-a716-446655440002';
    const request = {
      params: { id: validUUId },
      body: {
        customerId: newCustomerId,
        licensePlate: 'ABC1D23',
        brand: 'Tesla',
        model: 'Model S',
        year: 2023,
      },
    } as unknown as Context;

    updateVehicleUseCase.execute
      .calledWith(any())
      .mockRejectedValue(new Error('Use case error'));

    const result = await updateVehicleInput.execute(request);

    expect(result.status).toBe(500);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({ error: 'Failed to update vehicle' });
  });

  test('should return 400 if validation fails', async () => {
    const request = {
      params: { id: 'invalid-id' },
      body: {
        licensePlate: 'ABC1D23',
        brand: 'Tesla',
        model: 'Model S',
        year: 2023,
      },
    } as unknown as Context;

    const result = await updateVehicleInput.execute(request);

    expect(result.status).toBe(400);
    expect(await result.json()).toMatchObject({
      reason: 'Invalid data in request',
    });
    expect(updateVehicleUseCase.execute).not.toHaveBeenCalled();
  });
});
