import { makeVehicle } from '@/test/factories/make-vehicle';
import { describe, expect, test } from 'bun:test';
import { VehicleMapper } from './vehicle-mapper';

describe('vehicle mapper', () => {
  test('should convert vehicle to database format', () => {
    const vehicle = makeVehicle();

    const dbRecord = VehicleMapper.toDatabase(vehicle);

    expect(dbRecord).toEqual({
      id: 'vehicle-id',
      customer_id: 'customer-id',
      license_plate: 'ABC1D23',
      model: 'Model S',
      brand: 'Tesla',
      year: 2020,
      created_at: vehicle.createdAt,
      updated_at: vehicle.updatedAt,
    });
  });

  test('should convert database record to vehicle entity', () => {
    const dbRecord = {
      id: 'vehicle-id',
      customer_id: 'customer-id',
      license_plate: 'ABC1D23',
      model: 'Model S',
      brand: 'Tesla',
      year: 2020,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
    };

    const vehicle = VehicleMapper.toDomain(dbRecord);

    expect(vehicle.id).toBe('vehicle-id');
    expect(vehicle.customerId).toBe('customer-id');
    expect(vehicle.licensePlate.value).toBe('ABC1D23');
    expect(vehicle.model).toBe('Model S');
    expect(vehicle.brand).toBe('Tesla');
    expect(vehicle.year).toBe(2020);
  });
});
