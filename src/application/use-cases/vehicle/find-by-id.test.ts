import type { VehicleRepository } from '@/domain/vehicle/repositories/vehicle-repository';
import { makeVehicle } from '@/test/factories/make-vehicle';
import type { MockProxy } from 'bun-mock-extended';
import { mock } from 'bun-mock-extended';
import { FindVehicleByIdUseCase } from './find-by-id';

describe('find vehicle by id use case', () => {
  let vehicleRepository: MockProxy<VehicleRepository>;
  let findVehicleByIdUseCase: FindVehicleByIdUseCase;

  beforeEach(() => {
    vehicleRepository = mock();
    findVehicleByIdUseCase = new FindVehicleByIdUseCase(vehicleRepository);
  });

  test('should find a vehicle by id', async () => {
    const validUUId = '550e8400-e29b-41d4-a716-446655440000';
    const mockVehicle = makeVehicle({ id: validUUId });

    vehicleRepository.findById
      .calledWith(validUUId)
      .mockResolvedValue(mockVehicle);

    const input = {
      id: validUUId,
    };

    const result = await findVehicleByIdUseCase.execute(input);

    expect(result).toEqual(mockVehicle);
    expect(vehicleRepository.findById).toHaveBeenCalledWith(input.id);
  });

  test('should throw NotFoundError if vehicle is not found', async () => {
    const input = {
      id: 'non-existent-id',
    };

    await expect(findVehicleByIdUseCase.execute(input)).rejects.toThrow(
      'Vehicle not found',
    );
    expect(vehicleRepository.findById).toHaveBeenCalledWith(input.id);
  });
});
