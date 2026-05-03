import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { makeServiceOrderInput } from '@/test/factories/make-service-order-input';
import { mock, type MockProxy } from 'bun-mock-extended';
import { CreateServiceOrderUseCase } from './create';

describe('create service order use case', () => {
  let serviceOrderRepository: MockProxy<ServiceOrderRepository>;
  let createServiceOrderUseCase: CreateServiceOrderUseCase;

  beforeEach(() => {
    serviceOrderRepository = mock();
    createServiceOrderUseCase = new CreateServiceOrderUseCase(
      serviceOrderRepository,
    );
  });

  test('should create a service order with computed totals', async () => {
    const input = makeServiceOrderInput({
      serviceItems: [
        {
          serviceId: '66666666-6666-4666-8666-666666666666',
          price: 150,
        },
        {
          serviceId: '77777777-7777-4777-8777-777777777777',
          price: 50,
        },
      ],
      autoPartItems: [
        {
          autoPartId: '88888888-8888-4888-8888-888888888888',
          quantity: 2,
          unitPrice: 75,
        },
      ],
    });

    const result = await createServiceOrderUseCase.execute(input);

    expect(result).toEqual({
      id: expect.any(String),
      customerId: '11111111-1111-4111-8111-111111111111',
      vehicleId: '22222222-2222-4222-8222-222222222222',
      status: ServiceOrderStatus.RECEIVED,
      serviceItems: [
        {
          id: expect.any(String),
          serviceId: '66666666-6666-4666-8666-666666666666',
          price: {
            value: 150,
          },
          description: undefined,
        },
        {
          id: expect.any(String),
          serviceId: '77777777-7777-4777-8777-777777777777',
          price: {
            value: 50,
          },
          description: undefined,
        },
      ],
      autoPartItems: [
        {
          id: expect.any(String),
          autoPartId: '88888888-8888-4888-8888-888888888888',
          quantity: 2,
          unitPrice: {
            value: 75,
          },
          totalPrice: {
            value: 150,
          },
          description: undefined,
        },
      ],
      quote: {
        servicesTotal: 200,
        autoPartsTotal: 150,
        total: 350,
      },
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
    expect(serviceOrderRepository.create).toHaveBeenCalledWith(result);
  });

  test('should throw when service item price is negative', async () => {
    const input = makeServiceOrderInput({
      serviceItems: [
        {
          serviceId: '66666666-6666-4666-8666-666666666666',
          price: -10,
        },
      ],
    });

    await expect(createServiceOrderUseCase.execute(input)).rejects.toThrow(
      'Price cannot be negative',
    );

    expect(serviceOrderRepository.create).not.toHaveBeenCalled();
  });

  test('should throw when auto part quantity is zero', async () => {
    const input = makeServiceOrderInput({
      serviceItems: [],
      autoPartItems: [
        {
          autoPartId: '88888888-8888-4888-8888-888888888888',
          quantity: 0,
          unitPrice: 100,
        },
      ],
    });

    await expect(createServiceOrderUseCase.execute(input)).rejects.toThrow(
      'Quantity cannot be zero or negative',
    );

    expect(serviceOrderRepository.create).not.toHaveBeenCalled();
  });
});
