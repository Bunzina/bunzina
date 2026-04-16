import type { VehicleRepository } from '@/domain/vehicle/repositories/vehicle-repository';
import type { CustomerRepository } from '@/domain/customer/repositories/customer-repository';
import { makeVehicle } from '@/test/factories/make-vehicle';
import { makeCustomer } from '@/test/factories/make-customer';
import type { MockProxy } from 'bun-mock-extended';
import { mock } from 'bun-mock-extended';
import { UpdateVehicleUseCase } from './update';

describe('update vehicle use case', () => {
  let vehicleRepository: MockProxy<VehicleRepository>;
  let customerRepository: MockProxy<CustomerRepository>;
  let updateVehicleUseCase: UpdateVehicleUseCase;

  beforeEach(() => {
    vehicleRepository = mock();
    customerRepository = mock();
    updateVehicleUseCase = new UpdateVehicleUseCase(
      vehicleRepository,
      customerRepository,
    );
  });

  test('should update a vehicle', async () => {
    const validUUId = '550e8400-e29b-41d4-a716-446655440000';
    const newCustomerId = '550e8400-e29b-41d4-a716-446655440002';
    const existingVehicle = makeVehicle({ id: validUUId });
    const newCustomer = makeCustomer();

    vehicleRepository.findById
      .calledWith(validUUId)
      .mockResolvedValue(existingVehicle);
    vehicleRepository.findByLicensePlate
      .calledWith('ABC1234')
      .mockResolvedValue(null);
    customerRepository.findById
      .calledWith(newCustomerId)
      .mockResolvedValue(newCustomer);

    const input = {
      id: validUUId,
      customerId: newCustomerId,
      licensePlate: 'ABC1234',
      brand: 'Honda',
      model: 'Civic',
      year: 2023,
    };

    const result = await updateVehicleUseCase.execute(input);

    expect(result.customerId).toBe(newCustomerId);
    expect(result.licensePlate.value).toBe('ABC1234');
    expect(result.brand).toBe('Honda');
    expect(result.model).toBe('Civic');
    expect(result.year).toBe(2023);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(vehicleRepository.update).toHaveBeenCalledWith(result);
  });

  test('should throw NotFoundError if vehicle does not exist', async () => {
    const input = {
      id: '550e8400-e29b-41d4-a716-446655440099',
      customerId: '550e8400-e29b-41d4-a716-446655440002',
      licensePlate: 'ABC1234',
      brand: 'Honda',
      model: 'Civic',
      year: 2023,
    };

    await expect(updateVehicleUseCase.execute(input)).rejects.toThrow(
      'Vehicle not found',
    );
    expect(vehicleRepository.findById).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440099',
    );
    expect(vehicleRepository.update).not.toHaveBeenCalled();
  });

  test('should throw NotFoundError if customer does not exist', async () => {
    const validUUId = '550e8400-e29b-41d4-a716-446655440000';
    const newCustomerId = '550e8400-e29b-41d4-a716-446655440099';
    const existingVehicle = makeVehicle({ id: validUUId });

    vehicleRepository.findById
      .calledWith(validUUId)
      .mockResolvedValue(existingVehicle);
    customerRepository.findById
      .calledWith(newCustomerId)
      .mockResolvedValue(null);

    const input = {
      id: validUUId,
      customerId: newCustomerId,
      licensePlate: 'ABC1234',
      brand: 'Honda',
      model: 'Civic',
      year: 2023,
    };

    await expect(updateVehicleUseCase.execute(input)).rejects.toThrow(
      'Customer not found',
    );
    expect(vehicleRepository.update).not.toHaveBeenCalled();
  });

  test('should throw NotFoundError if license plate is already in use', async () => {
    const validUUId = '550e8400-e29b-41d4-a716-446655440000';
    const existingVehicle = makeVehicle({ id: validUUId });
    const otherVehicle = makeVehicle({
      id: '550e8400-e29b-41d4-a716-446655440001',
    });

    vehicleRepository.findById
      .calledWith(validUUId)
      .mockResolvedValue(existingVehicle);
    vehicleRepository.findByLicensePlate
      .calledWith('XYZ9999')
      .mockResolvedValue(otherVehicle);

    const input = {
      id: validUUId,
      customerId: existingVehicle.customerId,
      licensePlate: 'XYZ9999',
      brand: 'Honda',
      model: 'Civic',
      year: 2023,
    };

    await expect(updateVehicleUseCase.execute(input)).rejects.toThrow(
      'License plate already in use',
    );
    expect(vehicleRepository.update).not.toHaveBeenCalled();
  });
});
