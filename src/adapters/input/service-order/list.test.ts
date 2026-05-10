import type { ListServiceOrdersUseCase } from '@/application/use-cases/service-order/list';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { makeServiceOrder } from '@/test/factories/make-service-order';
import { mock, type MockProxy } from 'bun-mock-extended';
import { describe, expect, test, beforeEach } from 'bun:test';
import type { Context } from 'elysia';
import { ListServiceOrdersInput } from './list';

describe('list service orders input adapter', () => {
  let listServiceOrdersUseCase: MockProxy<ListServiceOrdersUseCase>;
  let listServiceOrdersInput: ListServiceOrdersInput;

  beforeEach(() => {
    listServiceOrdersUseCase = mock();
    listServiceOrdersInput = new ListServiceOrdersInput(
      listServiceOrdersUseCase,
    );
  });

  test('should list service orders with valid query parameters', async () => {
    const serviceOrder = makeServiceOrder();
    listServiceOrdersUseCase.execute.mockResolvedValue({
      data: [serviceOrder],
    });

    const context = {
      query: {
        page: '1',
        limit: '10',
      },
    } as unknown as Context;

    const response = await listServiceOrdersInput.execute(context);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      data: [
        {
          id: serviceOrder.id,
          customerId: serviceOrder.customerId,
          vehicleId: serviceOrder.vehicleId,
          status: serviceOrder.status,
          serviceItems: serviceOrder.serviceItems.map((item) => ({
            id: item.id,
            serviceId: item.serviceId,
            price: item.price.value,
            description: item.description,
            isCompleted: item.isCompleted,
          })),
          autoPartItems: serviceOrder.autoPartItems.map((item) => ({
            id: item.id,
            autoPartId: item.autoPartId,
            quantity: item.quantity,
            unitPrice: item.unitPrice.value,
            totalPrice: item.totalPrice?.value,
            description: item.description,
          })),
          quote: {
            servicesTotal: serviceOrder.quote.servicesTotal,
            autoPartsTotal: serviceOrder.quote.autoPartsTotal,
            total: serviceOrder.quote.total,
          },
          createdAt: serviceOrder.createdAt.toISOString(),
          updatedAt: serviceOrder.updatedAt.toISOString(),
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
      },
    });
  });

  test('should validate and use filter by customerId', async () => {
    const customerId = '550e8400-e29b-41d4-a716-446655440001';
    const serviceOrder = makeServiceOrder({ customerId });

    listServiceOrdersUseCase.execute.mockResolvedValue({
      data: [serviceOrder],
    });

    const context = {
      query: {
        page: '1',
        limit: '10',
        customerId,
      },
    } as unknown as Context;

    const response = await listServiceOrdersInput.execute(context);

    expect(response.status).toBe(200);
    expect(listServiceOrdersUseCase.execute).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      filters: {
        customerId,
        vehicleId: undefined,
        status: undefined,
        startCreatedAt: undefined,
        endCreatedAt: undefined,
      },
    });
  });

  test('should validate and use filter by vehicleId', async () => {
    const vehicleId = '550e8400-e29b-41d4-a716-446655440002';
    const serviceOrder = makeServiceOrder({ vehicleId });

    listServiceOrdersUseCase.execute.mockResolvedValue({
      data: [serviceOrder],
    });

    const context = {
      query: {
        page: '1',
        limit: '10',
        vehicleId,
      },
    } as unknown as Context;

    const response = await listServiceOrdersInput.execute(context);

    expect(response.status).toBe(200);
    expect(listServiceOrdersUseCase.execute).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      filters: {
        customerId: undefined,
        vehicleId,
        status: undefined,
        startCreatedAt: undefined,
        endCreatedAt: undefined,
      },
    });
  });

  test('should validate and use filter by status', async () => {
    const status = ServiceOrderStatus.IN_EXECUTION;
    const serviceOrder = makeServiceOrder({ status });

    listServiceOrdersUseCase.execute.mockResolvedValue({
      data: [serviceOrder],
    });

    const context = {
      query: {
        page: '1',
        limit: '10',
        status,
      },
    } as unknown as Context;

    const response = await listServiceOrdersInput.execute(context);

    expect(response.status).toBe(200);
    expect(listServiceOrdersUseCase.execute).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      filters: {
        customerId: undefined,
        vehicleId: undefined,
        status,
        startCreatedAt: undefined,
        endCreatedAt: undefined,
      },
    });
  });

  test('should validate date filters', async () => {
    const startCreatedAt = '2026-04-01T00:00:00.000Z';
    const endCreatedAt = '2026-04-30T23:59:59.999Z';
    const serviceOrder = makeServiceOrder();

    listServiceOrdersUseCase.execute.mockResolvedValue({
      data: [serviceOrder],
    });

    const context = {
      query: {
        page: '1',
        limit: '10',
        startCreatedAt,
        endCreatedAt,
      },
    } as unknown as Context;

    const response = await listServiceOrdersInput.execute(context);

    expect(response.status).toBe(200);
    expect(listServiceOrdersUseCase.execute).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      filters: {
        customerId: undefined,
        vehicleId: undefined,
        status: undefined,
        startCreatedAt: new Date(startCreatedAt),
        endCreatedAt: new Date(endCreatedAt),
      },
    });
  });

  test('should return 400 when page is invalid', async () => {
    const context = {
      query: {
        page: '0',
        limit: '10',
      },
    } as unknown as Context;

    const response = await listServiceOrdersInput.execute(context);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      reason: 'Invalid data in request',
      invalidParams: expect.any(Array),
    });
  });

  test('should return 400 when limit exceeds maximum', async () => {
    const context = {
      query: {
        page: '1',
        limit: '101',
      },
    } as unknown as Context;

    const response = await listServiceOrdersInput.execute(context);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      reason: 'Invalid data in request',
      invalidParams: expect.any(Array),
    });
  });

  test('should return 400 when customerId is not a valid UUID', async () => {
    const context = {
      query: {
        page: '1',
        limit: '10',
        customerId: 'not-a-uuid',
      },
    } as unknown as Context;

    const response = await listServiceOrdersInput.execute(context);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      reason: 'Invalid data in request',
      invalidParams: expect.any(Array),
    });
  });

  test('should return 400 when status is invalid', async () => {
    const context = {
      query: {
        page: '1',
        limit: '10',
        status: 'INVALID_STATUS',
      },
    } as unknown as Context;

    const response = await listServiceOrdersInput.execute(context);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      reason: 'Invalid data in request',
      invalidParams: expect.any(Array),
    });
  });
});
