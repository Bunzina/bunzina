import { makeLicensePlate } from '@/test/factories/make-license-plate';
import { Vehicle } from './vehicle';

describe('vehicle entity', () => {
  test('should create a vehicle with valid properties', () => {
    const vehicle = new Vehicle({
      customerId: 'customer-123',
      licensePlate: makeLicensePlate(),
      model: 'Impreza',
      brand: 'Subaru',
      year: 2009,
    });

    expect(vehicle).toBeInstanceOf(Vehicle);
    expect(vehicle).toEqual({
      id: expect.any(String),
      customerId: 'customer-123',
      licensePlate: {
        value: 'ABC1D23',
      },
      model: 'Impreza',
      brand: 'Subaru',
      year: 2009,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    } as unknown as Vehicle);
  });
});
