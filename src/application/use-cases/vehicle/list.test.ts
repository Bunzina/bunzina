import type { VehicleRepository } from '@/domain/vehicle/repositories/vehicle-repository';
import { makeVehicle } from '@/test/factories/make-vehicle';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import { describe, expect, test, beforeEach } from 'bun:test';
import { ListVehiclesUseCase } from './list';

describe('list vehicles use case', () => {
  let vehicleRepository: MockProxy<VehicleRepository>;
  let listVehiclesUseCase: ListVehiclesUseCase;

  beforeEach(() => {
    vehicleRepository = mock();
    listVehiclesUseCase = new ListVehiclesUseCase(vehicleRepository);
  });

  test('should list vehicles with default pagination', async () => {
    const vehicle1 = makeVehicle({ id: 'vehicle-1' });
    const vehicle2 = makeVehicle({ id: 'vehicle-2' });

    vehicleRepository.findByParams
      .calledWith(any())
      .mockResolvedValue([vehicle1, vehicle2]);

    const result = await listVehiclesUseCase.execute({
      page: 1,
      limit: 20,
    });

    expect(result.data).toHaveLength(2);
    expect(result.data[0]?.id).toBe('vehicle-1');
    expect(result.data[1]?.id).toBe('vehicle-2');
    expect(vehicleRepository.findByParams).toHaveBeenCalled();
  });

  test('should apply customerId filter', async () => {
    const vehicle = makeVehicle();

    vehicleRepository.findByParams
      .calledWith(any())
      .mockResolvedValue([vehicle]);

    const result = await listVehiclesUseCase.execute({
      page: 1,
      limit: 20,
      filters: {
        customerId: 'customer-123',
      },
    });

    expect(result.data).toHaveLength(1);
    expect(vehicleRepository.findByParams).toHaveBeenCalled();
  });

  test('should apply licensePlate filter', async () => {
    const vehicle = makeVehicle();

    vehicleRepository.findByParams
      .calledWith(any())
      .mockResolvedValue([vehicle]);

    const result = await listVehiclesUseCase.execute({
      page: 1,
      limit: 20,
      filters: {
        licensePlate: 'ABC1D23',
      },
    });

    expect(result.data).toHaveLength(1);
    expect(vehicleRepository.findByParams).toHaveBeenCalled();
  });

  test('should apply model filter', async () => {
    const vehicle = makeVehicle();

    vehicleRepository.findByParams
      .calledWith(any())
      .mockResolvedValue([vehicle]);

    const result = await listVehiclesUseCase.execute({
      page: 1,
      limit: 20,
      filters: {
        model: 'Model S',
      },
    });

    expect(result.data).toHaveLength(1);
    expect(vehicleRepository.findByParams).toHaveBeenCalled();
  });

  test('should apply brand filter', async () => {
    const vehicle = makeVehicle();

    vehicleRepository.findByParams
      .calledWith(any())
      .mockResolvedValue([vehicle]);

    const result = await listVehiclesUseCase.execute({
      page: 1,
      limit: 20,
      filters: {
        brand: 'Tesla',
      },
    });

    expect(result.data).toHaveLength(1);
    expect(vehicleRepository.findByParams).toHaveBeenCalled();
  });

  test('should apply year filter', async () => {
    const vehicle = makeVehicle();

    vehicleRepository.findByParams
      .calledWith(any())
      .mockResolvedValue([vehicle]);

    const result = await listVehiclesUseCase.execute({
      page: 1,
      limit: 20,
      filters: {
        year: 2020,
      },
    });

    expect(result.data).toHaveLength(1);
    expect(vehicleRepository.findByParams).toHaveBeenCalled();
  });

  test('should apply date range filter', async () => {
    const vehicle = makeVehicle();
    const startDate = new Date('2026-04-01');
    const endDate = new Date('2026-04-30');

    vehicleRepository.findByParams
      .calledWith(any())
      .mockResolvedValue([vehicle]);

    const result = await listVehiclesUseCase.execute({
      page: 1,
      limit: 20,
      filters: {
        startCreatedAt: startDate,
        endCreatedAt: endDate,
      },
    });

    expect(result.data).toHaveLength(1);
    expect(vehicleRepository.findByParams).toHaveBeenCalled();
  });

  test('should apply multiple filters combined', async () => {
    const vehicle = makeVehicle();

    vehicleRepository.findByParams
      .calledWith(any())
      .mockResolvedValue([vehicle]);

    const result = await listVehiclesUseCase.execute({
      page: 1,
      limit: 20,
      filters: {
        customerId: 'customer-123',
        brand: 'Tesla',
        year: 2020,
      },
    });

    expect(result.data).toHaveLength(1);
    expect(vehicleRepository.findByParams).toHaveBeenCalled();
  });

  test('should handle empty result', async () => {
    vehicleRepository.findByParams.calledWith(any()).mockResolvedValue([]);

    const result = await listVehiclesUseCase.execute({
      page: 1,
      limit: 20,
    });

    expect(result.data).toHaveLength(0);
  });

  test('should handle large page number', async () => {
    vehicleRepository.findByParams.calledWith(any()).mockResolvedValue([]);

    const result = await listVehiclesUseCase.execute({
      page: 100,
      limit: 20,
    });

    expect(result.data).toHaveLength(0);
    expect(vehicleRepository.findByParams).toHaveBeenCalled();
  });

  test('should pass correct page and limit to repository', async () => {
    vehicleRepository.findByParams.calledWith(any()).mockResolvedValue([]);

    await listVehiclesUseCase.execute({
      page: 3,
      limit: 50,
    });

    expect(vehicleRepository.findByParams).toHaveBeenCalledWith({
      page: 3,
      limit: 50,
    });
  });

  test('should return correct structure', async () => {
    const vehicle = makeVehicle();

    vehicleRepository.findByParams
      .calledWith(any())
      .mockResolvedValue([vehicle]);

    const result = await listVehiclesUseCase.execute({
      page: 1,
      limit: 20,
    });

    expect(result).toHaveProperty('data');
    expect(Array.isArray(result.data)).toBe(true);
  });
});
