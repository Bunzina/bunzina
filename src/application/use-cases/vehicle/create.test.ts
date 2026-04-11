import '@/test/setup';
import type { VehicleRepository } from '@/domain/vehicle/repositories/vehicle-repository';
import type { CustomerRepository } from '@/domain/customer/repositories/customer-repository';
import type { MockProxy } from 'bun-mock-extended';
import { mock } from 'bun-mock-extended';
import { makeVehicle } from '@/test/factories/make-vehicle';
import { makeCustomer } from '@/test/factories/make-customer';
import { CreateVehicleUseCase } from './create';
import { LicensePlate } from '@/domain/vehicle/value-objects/license-plate';

describe('create vehicle use case', () => {
  let vehicleRepository: MockProxy<VehicleRepository>;
  let customerRepository: MockProxy<CustomerRepository>;
  let createVehicleUseCase: CreateVehicleUseCase;

  beforeEach(() => {
    vehicleRepository = mock();
    customerRepository = mock();
    createVehicleUseCase = new CreateVehicleUseCase(
      vehicleRepository,
      customerRepository,
    );
  });

  test('should create a vehicle with all fields', async () => {
    const customer = makeCustomer();
    const input = {
      customerId: customer.id!,
      licensePlate: 'ABC1D23',
      model: 'Model S',
      brand: 'Tesla',
      year: 2020,
    };

    customerRepository.findById
      .calledWith(customer.id!)
      .mockResolvedValue(customer);

    const result = await createVehicleUseCase.execute(input);

    expect(result).toMatchObject({
      customerId: customer.id!,
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

    expect(customerRepository.findById).toHaveBeenCalledWith(customer.id!);
    expect(vehicleRepository.create).toHaveBeenCalledWith(result);
  });

  test('should throw NotFoundError if customer does not exist', async () => {
    const input = {
      customerId: 'customer-123',
      licensePlate: 'ABC1D23',
      model: 'Model S',
      brand: 'Tesla',
      year: 2020,
    };

    customerRepository.findById
      .calledWith(input.customerId)
      .mockResolvedValue(null);

    await expect(createVehicleUseCase.execute(input)).rejects.toThrow(
      'Customer not found',
    );

    expect(customerRepository.findById).toHaveBeenCalledWith(input.customerId);
    expect(vehicleRepository.create).not.toHaveBeenCalled();
  });

  test('should throw ConflictError if vehicle already exists', async () => {
    const customer = makeCustomer();
    const input = {
      customerId: customer.id!,
      licensePlate: 'ABC1D23',
      model: 'Model S',
      brand: 'Tesla',
      year: 2020,
    };

    const existingVehicle = makeVehicle({
      customerId: customer.id!,
      licensePlate: new LicensePlate(input.licensePlate),
    });

    customerRepository.findById
      .calledWith(customer.id!)
      .mockResolvedValue(customer);
    vehicleRepository.findByLicensePlate
      .calledWith(input.licensePlate)
      .mockResolvedValue(existingVehicle);

    await expect(createVehicleUseCase.execute(input)).rejects.toThrow(
      'Vehicle already exists',
    );

    expect(vehicleRepository.create).not.toHaveBeenCalled();
  });
});
