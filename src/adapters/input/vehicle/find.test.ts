import { VehiclePresenter } from '@/adapters/output/vehicle/vehicle-presenter';
import type { FindVehicleByIdUseCase } from '@/application/use-cases/vehicle/find-by-id';
import { makeVehicle } from '@/test/factories/make-vehicle';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { FindVehicleByIdInput } from './find';

describe('find vehicle by id input', () => {
  let findVehicleByIdUseCase: MockProxy<FindVehicleByIdUseCase>;
  let findVehicleByIdInput: FindVehicleByIdInput;

  beforeEach(() => {
    findVehicleByIdUseCase = mock();
    findVehicleByIdInput = new FindVehicleByIdInput(findVehicleByIdUseCase);
  });

  test('should find a vehicle', async () => {
    const validUUId = '550e8400-e29b-41d4-a716-446655440000';
    const vehicle = makeVehicle({ id: validUUId });

    findVehicleByIdUseCase.execute.calledWith(any()).mockResolvedValue(vehicle);

    const request = {
      params: { id: validUUId },
    } as unknown as Context;

    const result = await findVehicleByIdInput.execute(request);

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual(
      JSON.parse(JSON.stringify(VehiclePresenter.toHttp(vehicle))),
    );
    expect(findVehicleByIdUseCase.execute).toHaveBeenCalledWith({
      id: validUUId,
    });
  });

  test('should return 500 if use case throws', async () => {
    const vehicleId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const request = {
      params: { id: vehicleId },
    } as unknown as Context;

    const result = await findVehicleByIdInput.execute(request);

    expect(result.status).toBe(500);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({ error: 'Failed to find vehicle' });
    expect(findVehicleByIdUseCase.execute).toHaveBeenCalledWith({
      id: vehicleId,
    });
  });

  test('should return 400 if vehicle id is invalid', async () => {
    const request = {
      params: { id: 'invalid-id' },
    } as unknown as Context;

    const result = await findVehicleByIdInput.execute(request);

    expect(result.status).toBe(400);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    const data = await result.json();
    expect(data).toHaveProperty('reason');
    expect(data).toHaveProperty('invalidParams');
  });
});
