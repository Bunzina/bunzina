import { makeVehicle } from '@/test/factories/make-vehicle';
import { describe, expect, test } from 'bun:test';
import { VehiclePresenter } from './vehicle-presenter';

describe('vehicle presenter', () => {
  test('should convert a vehicle entity to http response', () => {
    const vehicle = makeVehicle();

    const response = VehiclePresenter.toHttp(vehicle);

    expect(response).toEqual({
      id: 'vehicle-id',
      customerId: 'customer-id',
      licensePlate: 'ABC1D23',
      model: 'Model S',
      brand: 'Tesla',
      year: 2020,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  test('should convert a vehicle with custom date', () => {
    const customDate = new Date('2024-01-01');
    const vehicle = makeVehicle({
      model: 'Model 3',
      brand: 'Tesla',
      year: 2023,
      createdAt: customDate,
      updatedAt: customDate,
    });

    const response = VehiclePresenter.toHttp(vehicle);

    expect(response).toEqual({
      id: 'vehicle-id',
      customerId: 'customer-id',
      licensePlate: 'ABC1D23',
      model: 'Model 3',
      brand: 'Tesla',
      year: 2023,
      createdAt: customDate,
      updatedAt: customDate,
    });
  });
});
