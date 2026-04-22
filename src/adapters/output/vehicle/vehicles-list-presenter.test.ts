import { makeVehicle } from '@/test/factories/make-vehicle';
import { describe, expect, test } from 'bun:test';
import { VehiclesListPresenter } from './vehicles-list-presenter';

describe('vehicles list presenter', () => {
  test('should convert vehicles array to http response with pagination', () => {
    const vehicle1 = makeVehicle({ model: 'Model S' });
    const vehicle2 = makeVehicle({ model: 'Model 3' });

    const response = VehiclesListPresenter.toHttp([vehicle1, vehicle2], 1, 20);

    expect(response).toEqual({
      data: [
        {
          id: 'vehicle-id',
          customerId: 'customer-id',
          licensePlate: 'ABC1D23',
          model: 'Model S',
          brand: 'Tesla',
          year: 2020,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: 'vehicle-id',
          customerId: 'customer-id',
          licensePlate: 'ABC1D23',
          model: 'Model 3',
          brand: 'Tesla',
          year: 2020,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
      },
    });
  });

  test('should return empty array when no vehicles', () => {
    const response = VehiclesListPresenter.toHttp([], 2, 20);

    expect(response).toEqual({
      data: [],
      pagination: {
        page: 2,
        limit: 20,
      },
    });
  });

  test('should handle different pagination values', () => {
    const vehicles = Array(5)
      .fill(null)
      .map((_, i) => makeVehicle({ model: `Model ${i}` }));

    const response = VehiclesListPresenter.toHttp(vehicles, 5, 5);

    expect(response.pagination).toEqual({
      page: 5,
      limit: 5,
    });
    expect(response.data).toHaveLength(5);
  });
});
