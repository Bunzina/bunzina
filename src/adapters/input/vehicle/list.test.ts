import type { ListVehiclesUseCase } from '@/application/use-cases/vehicle/list';
import { makeVehicle } from '@/test/factories/make-vehicle';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import { describe, expect, test, beforeEach } from 'bun:test';
import type { Context } from 'elysia';
import { ListVehiclesInput } from './list';

describe('list vehicles input', () => {
  let listVehiclesUseCase: MockProxy<ListVehiclesUseCase>;
  let listVehiclesInput: ListVehiclesInput;

  beforeEach(() => {
    listVehiclesUseCase = mock();
    listVehiclesInput = new ListVehiclesInput(listVehiclesUseCase);
  });

  test('should list vehicles with required pagination', async () => {
    const vehicle1 = makeVehicle({ id: 'vehicle-1' });
    const vehicle2 = makeVehicle({ id: 'vehicle-2' });

    listVehiclesUseCase.execute.calledWith(any()).mockResolvedValue({
      data: [vehicle1, vehicle2],
    });

    const request = {
      query: { page: '1', limit: '20' },
    } as unknown as Context;

    const result = await listVehiclesInput.execute(request);

    expect(result.status).toBe(200);
    expect(await result.json()).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: vehicle1.id,
            customerId: vehicle1.customerId,
            licensePlate: vehicle1.licensePlate.value,
            model: vehicle1.model,
            brand: vehicle1.brand,
            year: vehicle1.year,
          }),
          expect.objectContaining({
            id: vehicle2.id,
            customerId: vehicle2.customerId,
            licensePlate: vehicle2.licensePlate.value,
            model: vehicle2.model,
            brand: vehicle2.brand,
            year: vehicle2.year,
          }),
        ]),
        pagination: {
          page: 1,
          limit: 20,
        },
      }),
    );
  });

  test('should list vehicles with custom pagination', async () => {
    const vehicle = makeVehicle();

    listVehiclesUseCase.execute.calledWith(any()).mockResolvedValue({
      data: [vehicle],
    });

    const request = {
      query: { page: '2', limit: '50' },
    } as unknown as Context;

    const result = await listVehiclesInput.execute(request);

    expect(result.status).toBe(200);
    expect(await result.json()).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: vehicle.id,
            customerId: vehicle.customerId,
            licensePlate: vehicle.licensePlate.value,
            model: vehicle.model,
            brand: vehicle.brand,
            year: vehicle.year,
          }),
        ]),
        pagination: {
          page: 2,
          limit: 50,
        },
      }),
    );
  });

  test('should apply customerId filter', async () => {
    const vehicle = makeVehicle();

    listVehiclesUseCase.execute.calledWith(any()).mockResolvedValue({
      data: [vehicle],
    });

    const customerId = '550e8400-e29b-41d4-a716-446655440002';
    const request = {
      query: { page: '1', limit: '20', customerId },
    } as unknown as Context;

    const result = await listVehiclesInput.execute(request);

    expect(result.status).toBe(200);
    expect(listVehiclesUseCase.execute).toHaveBeenCalled();
  });

  test('should apply licensePlate filter', async () => {
    const vehicle = makeVehicle();

    listVehiclesUseCase.execute.calledWith(any()).mockResolvedValue({
      data: [vehicle],
    });

    const request = {
      query: { page: '1', limit: '20', licensePlate: 'ABC1D23' },
    } as unknown as Context;

    const result = await listVehiclesInput.execute(request);

    expect(result.status).toBe(200);
  });

  test('should apply model filter', async () => {
    const vehicle = makeVehicle();

    listVehiclesUseCase.execute.calledWith(any()).mockResolvedValue({
      data: [vehicle],
    });

    const request = {
      query: { page: '1', limit: '20', model: 'Model S' },
    } as unknown as Context;

    const result = await listVehiclesInput.execute(request);

    expect(result.status).toBe(200);
  });

  test('should apply brand filter', async () => {
    const vehicle = makeVehicle();

    listVehiclesUseCase.execute.calledWith(any()).mockResolvedValue({
      data: [vehicle],
    });

    const request = {
      query: { page: '1', limit: '20', brand: 'Tesla' },
    } as unknown as Context;

    const result = await listVehiclesInput.execute(request);

    expect(result.status).toBe(200);
  });

  test('should apply year filter', async () => {
    const vehicle = makeVehicle();

    listVehiclesUseCase.execute.calledWith(any()).mockResolvedValue({
      data: [vehicle],
    });

    const request = {
      query: { page: '1', limit: '20', year: '2020' },
    } as unknown as Context;

    const result = await listVehiclesInput.execute(request);

    expect(result.status).toBe(200);
  });

  test('should apply date range filters', async () => {
    const vehicle = makeVehicle();

    listVehiclesUseCase.execute.calledWith(any()).mockResolvedValue({
      data: [vehicle],
    });

    const request = {
      query: {
        page: '1',
        limit: '20',
        startCreatedAt: '2026-04-01T00:00:00Z',
        endCreatedAt: '2026-04-30T23:59:59Z',
      },
    } as unknown as Context;

    const result = await listVehiclesInput.execute(request);

    expect(result.status).toBe(200);
  });

  test('should apply multiple filters combined', async () => {
    const vehicle = makeVehicle();

    listVehiclesUseCase.execute.calledWith(any()).mockResolvedValue({
      data: [vehicle],
    });

    const customerId = '550e8400-e29b-41d4-a716-446655440002';
    const request = {
      query: {
        customerId,
        page: '1',
        brand: 'Tesla',
        year: '2020',
        limit: '10',
      },
    } as unknown as Context;

    const result = await listVehiclesInput.execute(request);

    expect(result.status).toBe(200);
  });

  test('should return 400 if page is invalid', async () => {
    const request = {
      query: { page: '0', limit: '20' },
    } as unknown as Context;

    const result = await listVehiclesInput.execute(request);

    expect(result.status).toBe(400);
    expect(await result.json()).toEqual(
      expect.objectContaining({
        reason: expect.any(String),
        invalidParams: expect.any(Array),
      }),
    );
  });

  test('should return 400 if limit exceeds maximum', async () => {
    const request = {
      query: { page: '1', limit: '200' },
    } as unknown as Context;

    const result = await listVehiclesInput.execute(request);

    expect(result.status).toBe(400);
    expect(await result.json()).toEqual(
      expect.objectContaining({
        reason: expect.any(String),
      }),
    );
  });

  test('should return 400 if year is invalid', async () => {
    const request = {
      query: { page: '1', limit: '20', year: '1800' },
    } as unknown as Context;

    const result = await listVehiclesInput.execute(request);

    expect(result.status).toBe(400);
    expect(await result.json()).toEqual(
      expect.objectContaining({
        reason: expect.any(String),
      }),
    );
  });

  test('should return 400 if customerId is not a valid UUID', async () => {
    const request = {
      query: { page: '1', limit: '20', customerId: 'not-a-uuid' },
    } as unknown as Context;

    const result = await listVehiclesInput.execute(request);

    expect(result.status).toBe(400);
    expect(await result.json()).toEqual(
      expect.objectContaining({
        reason: expect.any(String),
      }),
    );
  });

  test('should return 400 if licensePlate is invalid', async () => {
    const request = {
      query: { page: '1', limit: '20', licensePlate: 'INVALID' },
    } as unknown as Context;

    const result = await listVehiclesInput.execute(request);

    expect(result.status).toBe(400);
    expect(await result.json()).toEqual(
      expect.objectContaining({
        reason: expect.any(String),
      }),
    );
  });

  test('should return 500 if use case throws', async () => {
    listVehiclesUseCase.execute
      .calledWith(any())
      .mockRejectedValue(new Error('Database error'));

    const request = {
      query: { page: '1', limit: '20' },
    } as unknown as Context;

    const result = await listVehiclesInput.execute(request);

    expect(result.status).toBe(500);
    expect(await result.json()).toEqual({
      error: 'Failed to list vehicles',
    });
  });
});
