import type { FindAutoPartByIdUseCase } from '@/application/use-cases/auto-part/find-by-id';
import type { FindServiceByIdUseCase } from '@/application/use-cases/service/find-by-id';
import type { FindServiceOrderByIdUseCase } from '@/application/use-cases/service-order/find-by-id';
import { AutoPartItem } from '@/domain/service-order/entities/auto-part-item';
import { ServiceItem } from '@/domain/service-order/entities/service-item';
import { ServiceOrder } from '@/domain/service-order/entities/service-order';
import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { Quote } from '@/domain/service-order/value-objects/quote';
import { Price } from '@/domain/core/value-objects/price';
import { makeAutoPart } from '@/test/factories/make-auto-part';
import { makeService } from '@/test/factories/make-service';
import { BadRequestError, NotFoundError } from '@lucas-pmelo/handlers';
import { mock, type MockProxy } from 'bun-mock-extended';
import { beforeEach, describe, expect, test } from 'bun:test';
import { UpdateServiceOrderUseCase } from './update';

describe('update service order use case', () => {
  let serviceOrderRepository: MockProxy<ServiceOrderRepository>;
  let findServiceOrderByIdUseCase: MockProxy<FindServiceOrderByIdUseCase>;
  let findServiceByIdUseCase: MockProxy<FindServiceByIdUseCase>;
  let findAutoPartByIdUseCase: MockProxy<FindAutoPartByIdUseCase>;
  let updateServiceOrderUseCase: UpdateServiceOrderUseCase;

  beforeEach(() => {
    serviceOrderRepository = mock();
    findServiceOrderByIdUseCase = mock();
    findServiceByIdUseCase = mock();
    findAutoPartByIdUseCase = mock();
    updateServiceOrderUseCase = new UpdateServiceOrderUseCase(
      serviceOrderRepository,
      findServiceOrderByIdUseCase,
      findServiceByIdUseCase,
      findAutoPartByIdUseCase,
    );
  });

  test('should update service order items and quote', async () => {
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const createdAt = new Date('2026-04-01T10:00:00.000Z');
    const updatedAt = new Date('2026-04-02T10:00:00.000Z');

    const existingServiceOrder = new ServiceOrder({
      id,
      customerId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      vehicleId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      status: ServiceOrderStatus.RECEIVED,
      serviceItems: [
        new ServiceItem({
          id: 'old-service-item',
          serviceId: 'old-service-id',
          price: new Price(100),
          description: 'Old service',
        }),
      ],
      autoPartItems: [
        new AutoPartItem({
          id: 'old-auto-part-item',
          autoPartId: 'old-auto-part-id',
          quantity: 1,
          unitPrice: new Price(10),
          totalPrice: new Price(10),
          description: 'Old part',
        }),
      ],
      quote: new Quote({
        servicesTotal: 100,
        autoPartsTotal: 10,
      }),
      createdAt,
      updatedAt,
    });

    findServiceOrderByIdUseCase.execute.mockResolvedValue(existingServiceOrder);
    findServiceByIdUseCase.execute.mockImplementation(async ({ id }) =>
      makeService({ id }),
    );
    findAutoPartByIdUseCase.execute.mockImplementation(async ({ id }) =>
      makeAutoPart({ id }),
    );

    const result = await updateServiceOrderUseCase.execute({
      id,
      serviceItems: [
        {
          serviceId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
          price: 120,
          description: 'Brake check',
        },
        {
          serviceId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
          price: 80,
        },
      ],
      autoPartItems: [
        {
          autoPartId: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
          quantity: 2,
          unitPrice: 50,
          description: 'Brake pad',
        },
      ],
    });

    expect(result).toEqual({
      id,
      customerId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      vehicleId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      status: ServiceOrderStatus.RECEIVED,
      serviceItems: [
        {
          id: expect.any(String),
          serviceId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
          price: {
            value: 120,
          },
          description: 'Brake check',
        },
        {
          id: expect.any(String),
          serviceId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
          price: {
            value: 80,
          },
          description: undefined,
        },
      ],
      autoPartItems: [
        {
          id: expect.any(String),
          autoPartId: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
          quantity: 2,
          unitPrice: {
            value: 50,
          },
          totalPrice: {
            value: 100,
          },
          description: 'Brake pad',
        },
      ],
      quote: {
        servicesTotal: 200,
        autoPartsTotal: 100,
        total: 300,
      },
      createdAt,
      updatedAt: expect.any(Date),
    });
    expect(serviceOrderRepository.update).toHaveBeenCalledWith(result);
  });

  test('should preserve auto part items when autoPartItems is omitted', async () => {
    const id = '11111111-1111-4111-8111-111111111111';
    const createdAt = new Date('2026-04-01T10:00:00.000Z');
    const updatedAt = new Date('2026-04-02T10:00:00.000Z');

    const existingServiceOrder = new ServiceOrder({
      id,
      customerId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      vehicleId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      status: ServiceOrderStatus.RECEIVED,
      serviceItems: [
        new ServiceItem({
          id: 'old-service-item',
          serviceId: 'old-service-id',
          price: new Price(100),
          description: 'Old service',
        }),
      ],
      autoPartItems: [
        new AutoPartItem({
          id: 'old-auto-part-item',
          autoPartId: 'old-auto-part-id',
          quantity: 2,
          unitPrice: new Price(50),
          totalPrice: new Price(100),
          description: 'Old part',
        }),
      ],
      quote: new Quote({
        servicesTotal: 100,
        autoPartsTotal: 100,
      }),
      createdAt,
      updatedAt,
    });

    findServiceOrderByIdUseCase.execute.mockResolvedValue(existingServiceOrder);
    findServiceByIdUseCase.execute.mockImplementation(async ({ id }) =>
      makeService({ id }),
    );

    const result = await updateServiceOrderUseCase.execute({
      id,
      serviceItems: [
        {
          serviceId: 'new-service-id',
          price: 120,
          description: 'New service',
        },
      ],
    });

    expect(result).toEqual({
      id,
      customerId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      vehicleId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      status: ServiceOrderStatus.RECEIVED,
      serviceItems: [
        {
          id: expect.any(String),
          serviceId: 'new-service-id',
          price: {
            value: 120,
          },
          description: 'New service',
        },
      ],
      autoPartItems: [
        {
          id: 'old-auto-part-item',
          autoPartId: 'old-auto-part-id',
          quantity: 2,
          unitPrice: {
            value: 50,
          },
          totalPrice: {
            value: 100,
          },
          description: 'Old part',
        },
      ],
      quote: {
        servicesTotal: 120,
        autoPartsTotal: 100,
        total: 220,
      },
      createdAt,
      updatedAt: expect.any(Date),
    });
    expect(findAutoPartByIdUseCase.execute).not.toHaveBeenCalled();
    expect(serviceOrderRepository.update).toHaveBeenCalledWith(result);
  });

  test('should preserve service items when serviceItems is omitted', async () => {
    const id = '22222222-2222-4222-8222-222222222222';
    const createdAt = new Date('2026-04-01T10:00:00.000Z');
    const updatedAt = new Date('2026-04-02T10:00:00.000Z');

    const existingServiceOrder = new ServiceOrder({
      id,
      customerId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      vehicleId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      status: ServiceOrderStatus.RECEIVED,
      serviceItems: [
        new ServiceItem({
          id: 'old-service-item',
          serviceId: 'old-service-id',
          price: new Price(80),
          description: 'Old service',
        }),
      ],
      autoPartItems: [
        new AutoPartItem({
          id: 'old-auto-part-item',
          autoPartId: 'old-auto-part-id',
          quantity: 1,
          unitPrice: new Price(10),
          totalPrice: new Price(10),
          description: 'Old part',
        }),
      ],
      quote: new Quote({
        servicesTotal: 80,
        autoPartsTotal: 10,
      }),
      createdAt,
      updatedAt,
    });

    findServiceOrderByIdUseCase.execute.mockResolvedValue(existingServiceOrder);
    findAutoPartByIdUseCase.execute.mockImplementation(async ({ id }) =>
      makeAutoPart({ id }),
    );

    const result = await updateServiceOrderUseCase.execute({
      id,
      autoPartItems: [
        {
          autoPartId: 'new-auto-part-id',
          quantity: 3,
          unitPrice: 30,
        },
      ],
    });

    expect(result).toEqual({
      id,
      customerId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      vehicleId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      status: ServiceOrderStatus.RECEIVED,
      serviceItems: [
        {
          id: 'old-service-item',
          serviceId: 'old-service-id',
          price: {
            value: 80,
          },
          description: 'Old service',
        },
      ],
      autoPartItems: [
        {
          id: expect.any(String),
          autoPartId: 'new-auto-part-id',
          quantity: 3,
          unitPrice: {
            value: 30,
          },
          totalPrice: {
            value: 90,
          },
          description: undefined,
        },
      ],
      quote: {
        servicesTotal: 80,
        autoPartsTotal: 90,
        total: 170,
      },
      createdAt,
      updatedAt: expect.any(Date),
    });
    expect(findServiceByIdUseCase.execute).not.toHaveBeenCalled();
    expect(serviceOrderRepository.update).toHaveBeenCalledWith(result);
  });

  test('should throw NotFoundError when service order does not exist', async () => {
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

    findServiceOrderByIdUseCase.execute.mockRejectedValue(
      new NotFoundError('Service order not found'),
    );

    await expect(
      updateServiceOrderUseCase.execute({
        id,
        serviceItems: [
          {
            serviceId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
            price: 120,
          },
        ],
        autoPartItems: [],
      }),
    ).rejects.toThrow(NotFoundError);

    expect(serviceOrderRepository.update).not.toHaveBeenCalled();
  });

  test('should throw NotFoundError when service does not exist', async () => {
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const existingServiceOrder = new ServiceOrder({
      id,
      customerId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      vehicleId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      status: ServiceOrderStatus.RECEIVED,
      serviceItems: [],
      autoPartItems: [],
      quote: new Quote({
        servicesTotal: 0,
        autoPartsTotal: 0,
      }),
    });

    findServiceOrderByIdUseCase.execute.mockResolvedValue(existingServiceOrder);
    findServiceByIdUseCase.execute.mockRejectedValue(
      new NotFoundError('Service not found'),
    );

    await expect(
      updateServiceOrderUseCase.execute({
        id,
        serviceItems: [
          {
            serviceId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
            price: 120,
          },
        ],
        autoPartItems: [],
      }),
    ).rejects.toThrow(NotFoundError);

    expect(serviceOrderRepository.update).not.toHaveBeenCalled();
  });

  test('should throw NotFoundError when auto part does not exist', async () => {
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const existingServiceOrder = new ServiceOrder({
      id,
      customerId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      vehicleId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      status: ServiceOrderStatus.RECEIVED,
      serviceItems: [],
      autoPartItems: [],
      quote: new Quote({
        servicesTotal: 0,
        autoPartsTotal: 0,
      }),
    });

    findServiceOrderByIdUseCase.execute.mockResolvedValue(existingServiceOrder);
    findAutoPartByIdUseCase.execute.mockRejectedValue(
      new NotFoundError('Auto part not found'),
    );

    await expect(
      updateServiceOrderUseCase.execute({
        id,
        serviceItems: [],
        autoPartItems: [
          {
            autoPartId: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
            quantity: 2,
            unitPrice: 50,
          },
        ],
      }),
    ).rejects.toThrow(NotFoundError);

    expect(serviceOrderRepository.update).not.toHaveBeenCalled();
  });

  test('should throw BadRequestError when status is not updatable', async () => {
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const existingServiceOrder = new ServiceOrder({
      id,
      customerId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      vehicleId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      status: ServiceOrderStatus.AWAITING_APPROVAL,
      serviceItems: [],
      autoPartItems: [],
      quote: new Quote({
        servicesTotal: 0,
        autoPartsTotal: 0,
      }),
    });

    findServiceOrderByIdUseCase.execute.mockResolvedValue(existingServiceOrder);

    await expect(
      updateServiceOrderUseCase.execute({
        id,
        serviceItems: [
          {
            serviceId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
            price: 120,
          },
        ],
        autoPartItems: [],
      }),
    ).rejects.toThrow(BadRequestError);

    expect(serviceOrderRepository.update).not.toHaveBeenCalled();
  });
});
