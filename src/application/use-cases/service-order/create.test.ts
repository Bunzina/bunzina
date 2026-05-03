import type { AutoPartRepository } from '@/domain/auto-part/repositories/auto-part-repository';
import type { CustomerRepository } from '@/domain/customer/repositories/customer-repository';
import type { IServiceRepository } from '@/domain/service/repositories/service-repository';
import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import type { VehicleRepository } from '@/domain/vehicle/repositories/vehicle-repository';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { makeAutoPart } from '@/test/factories/make-auto-part';
import { makeCustomer } from '@/test/factories/make-customer';
import { makeService } from '@/test/factories/make-service';
import { makeServiceOrderInput } from '@/test/factories/make-service-order-input';
import { makeVehicle } from '@/test/factories/make-vehicle';
import { NotFoundError } from '@lucas-pmelo/handlers';
import { mock, type MockProxy } from 'bun-mock-extended';
import { CreateServiceOrderUseCase } from './create';

describe('create service order use case', () => {
  let serviceOrderRepository: MockProxy<ServiceOrderRepository>;
  let customerRepository: MockProxy<CustomerRepository>;
  let vehicleRepository: MockProxy<VehicleRepository>;
  let serviceRepository: MockProxy<IServiceRepository>;
  let autoPartRepository: MockProxy<AutoPartRepository>;
  let createServiceOrderUseCase: CreateServiceOrderUseCase;

  beforeEach(() => {
    serviceOrderRepository = mock();
    customerRepository = mock();
    vehicleRepository = mock();
    serviceRepository = mock();
    autoPartRepository = mock();
    createServiceOrderUseCase = new CreateServiceOrderUseCase(
      serviceOrderRepository,
      customerRepository,
      vehicleRepository,
      serviceRepository,
      autoPartRepository,
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

    customerRepository.findById
      .calledWith(input.customerId)
      .mockResolvedValue(makeCustomer({ id: input.customerId }));
    vehicleRepository.findById.calledWith(input.vehicleId).mockResolvedValue(
      makeVehicle({
        id: input.vehicleId,
        customerId: input.customerId,
      }),
    );
    serviceRepository.findById
      .calledWith('66666666-6666-4666-8666-666666666666')
      .mockResolvedValue(
        makeService({ id: '66666666-6666-4666-8666-666666666666' }),
      );
    serviceRepository.findById
      .calledWith('77777777-7777-4777-8777-777777777777')
      .mockResolvedValue(
        makeService({ id: '77777777-7777-4777-8777-777777777777' }),
      );
    autoPartRepository.findById
      .calledWith('88888888-8888-4888-8888-888888888888')
      .mockResolvedValue(
        makeAutoPart({ id: '88888888-8888-4888-8888-888888888888' }),
      );

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

  test('should throw NotFoundError when customer does not exist', async () => {
    const input = makeServiceOrderInput();

    customerRepository.findById
      .calledWith(input.customerId)
      .mockResolvedValue(null);

    await expect(createServiceOrderUseCase.execute(input)).rejects.toThrow(
      NotFoundError,
    );

    expect(serviceOrderRepository.create).not.toHaveBeenCalled();
  });

  test('should throw NotFoundError when vehicle does not exist', async () => {
    const input = makeServiceOrderInput();

    customerRepository.findById
      .calledWith(input.customerId)
      .mockResolvedValue(makeCustomer({ id: input.customerId }));
    vehicleRepository.findById
      .calledWith(input.vehicleId)
      .mockResolvedValue(null);

    await expect(createServiceOrderUseCase.execute(input)).rejects.toThrow(
      NotFoundError,
    );

    expect(serviceOrderRepository.create).not.toHaveBeenCalled();
  });

  test('should throw NotFoundError when service does not exist', async () => {
    const input = makeServiceOrderInput({
      autoPartItems: [],
      serviceItems: [
        {
          serviceId: '66666666-6666-4666-8666-666666666666',
          price: 150,
        },
      ],
    });

    customerRepository.findById
      .calledWith(input.customerId)
      .mockResolvedValue(makeCustomer({ id: input.customerId }));
    vehicleRepository.findById.calledWith(input.vehicleId).mockResolvedValue(
      makeVehicle({
        id: input.vehicleId,
        customerId: input.customerId,
      }),
    );
    serviceRepository.findById
      .calledWith('66666666-6666-4666-8666-666666666666')
      .mockResolvedValue(null);

    await expect(createServiceOrderUseCase.execute(input)).rejects.toThrow(
      NotFoundError,
    );

    expect(serviceOrderRepository.create).not.toHaveBeenCalled();
  });

  test('should throw NotFoundError when auto part does not exist', async () => {
    const input = makeServiceOrderInput({
      serviceItems: [
        {
          serviceId: '77777777-7777-4777-8777-777777777777',
          price: 150,
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

    customerRepository.findById
      .calledWith(input.customerId)
      .mockResolvedValue(makeCustomer({ id: input.customerId }));
    vehicleRepository.findById.calledWith(input.vehicleId).mockResolvedValue(
      makeVehicle({
        id: input.vehicleId,
        customerId: input.customerId,
      }),
    );
    serviceRepository.findById
      .calledWith('77777777-7777-4777-8777-777777777777')
      .mockResolvedValue(
        makeService({ id: '77777777-7777-4777-8777-777777777777' }),
      );
    autoPartRepository.findById
      .calledWith('88888888-8888-4888-8888-888888888888')
      .mockResolvedValue(null);

    await expect(createServiceOrderUseCase.execute(input)).rejects.toThrow(
      NotFoundError,
    );

    expect(serviceOrderRepository.create).not.toHaveBeenCalled();
  });

  test('should throw when service item price is negative', async () => {
    const input = makeServiceOrderInput({
      autoPartItems: [],
      serviceItems: [
        {
          serviceId: '66666666-6666-4666-8666-666666666666',
          price: -10,
        },
      ],
    });

    customerRepository.findById
      .calledWith(input.customerId)
      .mockResolvedValue(makeCustomer({ id: input.customerId }));
    vehicleRepository.findById.calledWith(input.vehicleId).mockResolvedValue(
      makeVehicle({
        id: input.vehicleId,
        customerId: input.customerId,
      }),
    );
    serviceRepository.findById
      .calledWith('66666666-6666-4666-8666-666666666666')
      .mockResolvedValue(
        makeService({ id: '66666666-6666-4666-8666-666666666666' }),
      );

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

    customerRepository.findById
      .calledWith(input.customerId)
      .mockResolvedValue(makeCustomer({ id: input.customerId }));
    vehicleRepository.findById.calledWith(input.vehicleId).mockResolvedValue(
      makeVehicle({
        id: input.vehicleId,
        customerId: input.customerId,
      }),
    );
    autoPartRepository.findById
      .calledWith('88888888-8888-4888-8888-888888888888')
      .mockResolvedValue(
        makeAutoPart({ id: '88888888-8888-4888-8888-888888888888' }),
      );

    await expect(createServiceOrderUseCase.execute(input)).rejects.toThrow(
      'Quantity cannot be zero or negative',
    );

    expect(serviceOrderRepository.create).not.toHaveBeenCalled();
  });
});
