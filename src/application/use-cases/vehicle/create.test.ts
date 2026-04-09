import '@/test/setup';
import type { VehicleRepository } from '@/domain/vehicle/repositories/vehicle-repository';
import type { MockProxy } from 'bun-mock-extended';
import { mock } from 'bun-mock-extended';
import { CreateVehicleUseCase } from './create';

describe('create vehicle use case', () => {
  let vehicleRepository: MockProxy<VehicleRepository>;
  let createVehicleUseCase: CreateVehicleUseCase;

  beforeEach(() => {
    vehicleRepository = mock();
    createVehicleUseCase = new CreateVehicleUseCase(vehicleRepository);
  });

  test('should create a vehicle with all fields', async () => {
    const input = {
      customerId: 'customer-123',
      licensePlate: 'ABC1D23',
      model: 'Model S',
      brand: 'Tesla',
      year: 2020,
    };

    const result = await createVehicleUseCase.execute(input);

    expect(result).toMatchObject({
      customerId: 'customer-123',
      licensePlate: {
        value: 'ABC1D23',
      },
      model: 'Model S',
      brand: 'Tesla',
      year: 2020,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      id: expect.any(String),
    });

    expect(vehicleRepository.create).toHaveBeenCalledWith(result);
  });

  test('should throw ConflictError if vehicle already exists', async () => {
    const input = {
      customerId: 'customer-123',
      licensePlate: 'ABC1D23',
      model: 'Model S',
      brand: 'Tesla',
      year: 2020,
    };

    const existingVehicle = {
      id: 'vehicle-123',
      customerId: 'customer-123',
      licensePlate: {
        value: 'ABC1D23',
      },
      model: 'Model S',
      brand: 'Tesla',
      year: 2020,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vehicleRepository.findByLicensePlate
      .calledWith(input.licensePlate)
      .mockResolvedValue(existingVehicle);

    await expect(createVehicleUseCase.execute(input)).rejects.toThrow(
      'Vehicle already exists',
    );
    expect(vehicleRepository.findByLicensePlate).toHaveBeenCalledWith(
      input.licensePlate,
    );
    expect(vehicleRepository.create).not.toHaveBeenCalled();
  });
});
