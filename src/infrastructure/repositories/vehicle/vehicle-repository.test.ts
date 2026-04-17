import { makeVehicle } from '@/test/factories/make-vehicle';
import { SQL } from 'bun';
import { mockFn } from 'bun-mock-extended';
import { describe, expect, test, type Mock } from 'bun:test';
import { VehicleRepository } from './vehicle-repository';

describe('vehicle repository', () => {
  test('should create a vehicle and return it', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
    mockClient.mockResolvedValue([]);

    const repository = new VehicleRepository(mockClient as unknown as SQL);
    const vehicle = makeVehicle();

    const result = await repository.create(vehicle);

    expect(result).toEqual(vehicle);
    expect(mockClient).toHaveBeenCalled();
  });

  test('should find a vehicle by license plate', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;

    const vehicleRecord = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      customer_id: '550e8400-e29b-41d4-a716-446655440002',
      license_plate: 'ABC1D23',
      model: 'Model S',
      brand: 'Tesla',
      year: 2020,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockClient.mockResolvedValue([vehicleRecord]);

    const repository = new VehicleRepository(mockClient as unknown as SQL);

    const result = await repository.findByLicensePlate('ABC1D23');

    expect(result).not.toBeNull();
    expect(result?.id).toBe('550e8400-e29b-41d4-a716-446655440001');
    expect(result?.licensePlate.value).toBe('ABC1D23');
    expect(mockClient).toHaveBeenCalled();
  });

  test('should return null if vehicle not found', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
    mockClient.mockResolvedValue([]);

    const repository = new VehicleRepository(mockClient as unknown as SQL);

    const result = await repository.findByLicensePlate('UNKNOWN');

    expect(result).toBeNull();
    expect(mockClient).toHaveBeenCalled();
  });

  test('should find a vehicle by id', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;

    const vehicleRecord = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      customer_id: '550e8400-e29b-41d4-a716-446655440002',
      license_plate: 'ABC1D23',
      model: 'Model S',
      brand: 'Tesla',
      year: 2020,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockClient.mockResolvedValue([vehicleRecord]);

    const repository = new VehicleRepository(mockClient as unknown as SQL);

    const result = await repository.findById(
      '550e8400-e29b-41d4-a716-446655440001',
    );

    expect(result).not.toBeNull();
    expect(result?.id).toBe('550e8400-e29b-41d4-a716-446655440001');
    expect(result?.licensePlate.value).toBe('ABC1D23');
    expect(mockClient).toHaveBeenCalled();
  });

  test('should return null if vehicle not found by id', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
    mockClient.mockResolvedValue([]);

    const repository = new VehicleRepository(mockClient as unknown as SQL);

    const result = await repository.findById(
      '550e8400-e29b-41d4-a716-446655440099',
    );

    expect(result).toBeNull();
    expect(mockClient).toHaveBeenCalled();
  });

  test('should delete a vehicle by id', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
    mockClient.mockResolvedValue([]);

    const repository = new VehicleRepository(mockClient as unknown as SQL);
    const id = '550e8400-e29b-41d4-a716-446655440001';

    await repository.delete(id);

    expect(mockClient).toHaveBeenCalled();
  });
});
