import type { HandlerContext } from '@/api/handler-context';
import { CreateServiceOrderUseCase } from '@/application/use-cases/service-order/create';
import { CreateServiceOrderInput } from '@/adapters/input/service-order/create';
import { FindAutoPartByIdUseCase } from '@/application/use-cases/auto-part/find-by-id';
import { FindCustomerByIdUseCase } from '@/application/use-cases/customer/find-by-id';
import { FindServiceByIdUseCase } from '@/application/use-cases/service/find-by-id';
import { FindVehicleByIdUseCase } from '@/application/use-cases/vehicle/find-by-id';
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
let findCustomerByIdUseCase: FindCustomerByIdUseCase;
let findVehicleByIdUseCase: FindVehicleByIdUseCase;
let findServiceByIdUseCase: FindServiceByIdUseCase;
let findAutoPartByIdUseCase: FindAutoPartByIdUseCase;
let createServiceOrderInput: CreateServiceOrderInput;

const setDependencies = () => {
  serviceOrderRepository = new ServiceOrderRepository(dbInstance);
  customerRepository = new CustomerRepository(dbInstance);
  vehicleRepository = new VehicleRepository(dbInstance);
  serviceRepository = new ServiceRepository(dbInstance);
  autoPartRepository = new AutoPartRepository(dbInstance);
  findCustomerByIdUseCase = new FindCustomerByIdUseCase(customerRepository);
  findVehicleByIdUseCase = new FindVehicleByIdUseCase(vehicleRepository);
  findServiceByIdUseCase = new FindServiceByIdUseCase(serviceRepository);
  findAutoPartByIdUseCase = new FindAutoPartByIdUseCase(autoPartRepository);
  createServiceOrderUseCase = new CreateServiceOrderUseCase(
    serviceOrderRepository,
    findCustomerByIdUseCase,
    findVehicleByIdUseCase,
    findServiceByIdUseCase,
    findAutoPartByIdUseCase,
  );
  createServiceOrderInput = new CreateServiceOrderInput(
    createServiceOrderUseCase,
  );
};

export const createServiceOrderHandler = async (
  context: HandlerContext,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await createServiceOrderInput.execute(context);
};
