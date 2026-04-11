import { VehiclePresenter } from '@/adapters/output/vehicle/vehicle-presenter';
import type { CreateVehicleUseCase } from '@/application/use-cases/vehicle/create';
import { makeVehicle } from '@/test/factories/make-vehicle';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { CreateVehicleInput } from './create';

describe('create vehicle input', () => {
  let createVehicleUseCase: MockProxy<CreateVehicleUseCase>;
  let createVehicleInput: CreateVehicleInput;

  beforeEach(() => {
    createVehicleUseCase = mock();
    createVehicleInput = new CreateVehicleInput(createVehicleUseCase);
  });

  test('should create a vehicle', async () => {
    const vehicle = makeVehicle();

    createVehicleUseCase.execute.calledWith(any()).mockResolvedValue(vehicle);

    const request = {
      body: {
        customerId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        licensePlate: 'ABC1D23',
        model: 'Model S',
        brand: 'Tesla',
        year: 2020,
      },
    } as Context;

    const result = await createVehicleInput.execute(request);

    expect(result?.status).toBe(201);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
    expect(await result?.json()).toEqual(
      JSON.parse(JSON.stringify(VehiclePresenter.toHttp(vehicle))),
    );

    expect(createVehicleUseCase.execute).toHaveBeenCalledWith({
      customerId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      licensePlate: 'ABC1D23',
      model: 'Model S',
      brand: 'Tesla',
      year: 2020,
    });
  });

  test('should throw an error if vehicle creation fails', async () => {
    createVehicleUseCase.execute
      .calledWith(any())
      .mockRejectedValue(new Error('Unexpected error'));

    const request = {
      body: {
        customerId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        licensePlate: 'ABC1D23',
        model: 'Model S',
        brand: 'Tesla',
        year: 2020,
      },
    } as Context;

    const result = await createVehicleInput.execute(request);

    expect(result?.status).toBe(500);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
    expect(await result?.json()).toEqual({ error: 'Failed to create vehicle' });
  });

  test('should throw validation error if input is invalid', async () => {
    const request = {
      body: {
        customerId: 'invalid-uuid',
        licensePlate: 'INVALID',
        model: '',
        brand: 'Tesla',
        year: 1800,
      },
    } as Context;

    const result = await createVehicleInput.execute(request);

    expect(result?.status).toBe(400);
    expect(await result?.json()).toMatchObject({
      reason: 'Invalid data in request',
    });
    expect(createVehicleUseCase.execute).not.toHaveBeenCalled();
  });
});
