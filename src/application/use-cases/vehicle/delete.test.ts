import type { VehicleRepository } from '@/domain/vehicle/repositories/vehicle-repository';
import { makeVehicle } from '@/test/factories/make-vehicle';
import type { MockProxy } from 'bun-mock-extended';
import { mock } from 'bun-mock-extended';
import { describe, expect, test, beforeEach } from 'bun:test';
import { DeleteVehicleUseCase } from './delete';

describe('delete vehicle use case', () => {
  let vehicleRepository: MockProxy<VehicleRepository>;
  let deleteVehicleUseCase: DeleteVehicleUseCase;

  beforeEach(() => {
    vehicleRepository = mock();
    deleteVehicleUseCase = new DeleteVehicleUseCase(vehicleRepository);
  });

  test('should delete a vehicle by id', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    const vehicle = makeVehicle({ id });

    vehicleRepository.findById.calledWith(id).mockResolvedValue(vehicle);

    await deleteVehicleUseCase.execute({ id });

    expect(vehicleRepository.findById).toHaveBeenCalledWith(id);
    expect(vehicleRepository.delete).toHaveBeenCalledWith(id);
  });

  test('should throw NotFoundError if vehicle does not exist', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440099';

    await expect(deleteVehicleUseCase.execute({ id })).rejects.toThrow(
      'Vehicle not found',
    );

    expect(vehicleRepository.findById).toHaveBeenCalledWith(id);
    expect(vehicleRepository.delete).not.toHaveBeenCalled();
  });
});
