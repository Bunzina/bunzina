import { CreateVehicleInput } from '@/adapters/input/vehicle/create';
import { CreateVehicleUseCase } from '@/application/use-cases/vehicle/create';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { VehicleRepository } from '@/infrastructure/repositories/vehicle/vehicle-repository';
import { CustomerRepository } from '@/infrastructure/repositories/customer/customer-repository';
import logger from '@lucas-pmelo/logger';
import type { HandlerContext } from '@/api/handler-context';

let createVehicleUseCase: CreateVehicleUseCase;
let vehicleRepository: VehicleRepository;
let customerRepository: CustomerRepository;
let createVehicleInput: CreateVehicleInput;

const setDependencies = () => {
  vehicleRepository = new VehicleRepository(dbInstance);
  customerRepository = new CustomerRepository(dbInstance);
  createVehicleUseCase = new CreateVehicleUseCase(
    vehicleRepository,
    customerRepository,
  );
  createVehicleInput = new CreateVehicleInput(createVehicleUseCase);
};

export const createVehicleHandler = async (
  context: HandlerContext,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await createVehicleInput.execute(context);
};
