import { UpdateVehicleInput } from '@/adapters/input/vehicle/update';
import { UpdateVehicleUseCase } from '@/application/use-cases/vehicle/update';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { VehicleRepository } from '@/infrastructure/repositories/vehicle/vehicle-repository';
import { CustomerRepository } from '@/infrastructure/repositories/customer/customer-repository';
import logger from '@lucas-pmelo/logger';
import type { Context } from 'elysia';

let vehicleRepository: VehicleRepository;
let customerRepository: CustomerRepository;
let updateVehicleUseCase: UpdateVehicleUseCase;
let updateVehicleInput: UpdateVehicleInput;

const setDependencies = () => {
  vehicleRepository = new VehicleRepository(dbInstance);
  customerRepository = new CustomerRepository(dbInstance);
  updateVehicleUseCase = new UpdateVehicleUseCase(
    vehicleRepository,
    customerRepository,
  );
  updateVehicleInput = new UpdateVehicleInput(updateVehicleUseCase);
};

export const updateVehicleHandler = async (
  context: Context,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await updateVehicleInput.execute(context);
};
