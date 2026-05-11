import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { makeServiceOrder } from '@/test/factories/make-service-order';
import { mock, type MockProxy } from 'bun-mock-extended';
import { describe, expect, test, beforeEach } from 'bun:test';
import { ListServiceOrdersUseCase } from './list';

describe('list service orders use case', () => {
  let serviceOrderRepository: MockProxy<ServiceOrderRepository>;
  let listServiceOrdersUseCase: ListServiceOrdersUseCase;

  beforeEach(() => {
    serviceOrderRepository = mock();
    listServiceOrdersUseCase = new ListServiceOrdersUseCase(
      serviceOrderRepository,
    );
  });

  test('should list all service orders with pagination', async () => {
    const serviceOrder1 = makeServiceOrder({
      id: 'so-1',
      customerId: 'customer-1',
    });
    const serviceOrder2 = makeServiceOrder({
      id: 'so-2',
      customerId: 'customer-2',
    });

    serviceOrderRepository.findByParams.mockResolvedValue([
      serviceOrder1,
      serviceOrder2,
    ]);

    const result = await listServiceOrdersUseCase.execute({
      page: 1,
      limit: 10,
    });

    expect(result.data).toEqual([serviceOrder1, serviceOrder2]);
    expect(serviceOrderRepository.findByParams).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
  });

  test('should list service orders filtered by customerId', async () => {
    const customerId = 'customer-123';
    const serviceOrder = makeServiceOrder({
      id: 'so-1',
      customerId,
    });

    serviceOrderRepository.findByParams.mockResolvedValue([serviceOrder]);

    const result = await listServiceOrdersUseCase.execute({
      page: 1,
      limit: 10,
      filters: { customerId },
    });

    expect(result.data).toEqual([serviceOrder]);
    expect(serviceOrderRepository.findByParams).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      filters: { customerId },
    });
  });

  test('should list service orders filtered by vehicleId', async () => {
    const vehicleId = 'vehicle-123';
    const serviceOrder = makeServiceOrder({
      id: 'so-1',
      vehicleId,
    });

    serviceOrderRepository.findByParams.mockResolvedValue([serviceOrder]);

    const result = await listServiceOrdersUseCase.execute({
      page: 1,
      limit: 10,
      filters: { vehicleId },
    });

    expect(result.data).toEqual([serviceOrder]);
    expect(serviceOrderRepository.findByParams).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      filters: { vehicleId },
    });
  });

  test('should list service orders filtered by status', async () => {
    const serviceOrder = makeServiceOrder({
      id: 'so-1',
      status: ServiceOrderStatus.IN_EXECUTION,
    });

    serviceOrderRepository.findByParams.mockResolvedValue([serviceOrder]);

    const result = await listServiceOrdersUseCase.execute({
      page: 1,
      limit: 10,
      filters: { status: ServiceOrderStatus.IN_EXECUTION },
    });

    expect(result.data).toEqual([serviceOrder]);
    expect(serviceOrderRepository.findByParams).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      filters: { status: ServiceOrderStatus.IN_EXECUTION },
    });
  });

  test('should list service orders filtered by date range', async () => {
    const startDate = new Date('2026-04-01T00:00:00.000Z');
    const endDate = new Date('2026-04-30T23:59:59.999Z');
    const serviceOrder = makeServiceOrder({
      id: 'so-1',
      createdAt: new Date('2026-04-15T10:00:00.000Z'),
    });

    serviceOrderRepository.findByParams.mockResolvedValue([serviceOrder]);

    const result = await listServiceOrdersUseCase.execute({
      page: 1,
      limit: 10,
      filters: { startCreatedAt: startDate, endCreatedAt: endDate },
    });

    expect(result.data).toEqual([serviceOrder]);
    expect(serviceOrderRepository.findByParams).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      filters: { startCreatedAt: startDate, endCreatedAt: endDate },
    });
  });

  test('should list service orders with multiple filters combined', async () => {
    const customerId = 'customer-123';
    const vehicleId = 'vehicle-123';
    const status = ServiceOrderStatus.RECEIVED;
    const serviceOrder = makeServiceOrder({
      id: 'so-1',
      customerId,
      vehicleId,
      status,
    });

    serviceOrderRepository.findByParams.mockResolvedValue([serviceOrder]);

    const result = await listServiceOrdersUseCase.execute({
      page: 1,
      limit: 10,
      filters: {
        customerId,
        vehicleId,
        status,
      },
    });

    expect(result.data).toEqual([serviceOrder]);
    expect(serviceOrderRepository.findByParams).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      filters: {
        customerId,
        vehicleId,
        status,
      },
    });
  });

  test('should return empty list when no service orders match filters', async () => {
    serviceOrderRepository.findByParams.mockResolvedValue([]);

    const result = await listServiceOrdersUseCase.execute({
      page: 1,
      limit: 10,
      filters: { customerId: 'non-existent-customer' },
    });

    expect(result.data).toEqual([]);
  });
});
