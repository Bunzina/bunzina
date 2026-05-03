import type { Context } from 'elysia';
import { CreateServiceOrderUseCase } from '@/application/use-cases/service-order/create';
import { CreateServiceOrderInput } from '@/adapters/input/service-order/create';
import { AutoPartRepository } from '@/infrastructure/repositories/auto-part/auto-part-repository';
import { CustomerRepository } from '@/infrastructure/repositories/customer/customer-repository';
import { ServiceRepository } from '@/infrastructure/repositories/service/service-repository';
import { ServiceOrderRepository } from '@/infrastructure/repositories/service-order/service-order-repository';
import { VehicleRepository } from '@/infrastructure/repositories/vehicle/vehicle-repository';
import { db as dbInstance } from '@/infrastructure/configs/database';
import logger from '@lucas-pmelo/logger';

let createServiceOrderUseCase: CreateServiceOrderUseCase;
let serviceOrderRepository: ServiceOrderRepository;
let customerRepository: CustomerRepository;
let vehicleRepository: VehicleRepository;
let serviceRepository: ServiceRepository;
let autoPartRepository: AutoPartRepository;
let createServiceOrderInput: CreateServiceOrderInput;

const setDependencies = () => {
  serviceOrderRepository = new ServiceOrderRepository(dbInstance);
  customerRepository = new CustomerRepository(dbInstance);
  vehicleRepository = new VehicleRepository(dbInstance);
  serviceRepository = new ServiceRepository(dbInstance);
  autoPartRepository = new AutoPartRepository(dbInstance);
  createServiceOrderUseCase = new CreateServiceOrderUseCase(
    serviceOrderRepository,
    customerRepository,
    vehicleRepository,
    serviceRepository,
    autoPartRepository,
  );
  createServiceOrderInput = new CreateServiceOrderInput(
    createServiceOrderUseCase,
  );
};

export const createServiceOrderHandler = async (
  context: Context,
): Promise<Response | undefined> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await createServiceOrderInput.execute(context);
};
