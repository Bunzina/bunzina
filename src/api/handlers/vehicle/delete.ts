import { DeleteVehicleInput } from '@/adapters/input/vehicle/delete';
import { DeleteVehicleUseCase } from '@/application/use-cases/vehicle/delete';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { VehicleRepository } from '@/infrastructure/repositories/vehicle/vehicle-repository';
import logger from '@lucas-pmelo/logger';
import type { Context } from 'elysia';

let vehicleRepository: VehicleRepository;
let deleteVehicleUseCase: DeleteVehicleUseCase;
let deleteVehicleInput: DeleteVehicleInput;

const setDependencies = () => {
  vehicleRepository = new VehicleRepository(dbInstance);
  deleteVehicleUseCase = new DeleteVehicleUseCase(vehicleRepository);
  deleteVehicleInput = new DeleteVehicleInput(deleteVehicleUseCase);
};

export const deleteVehicleHandler = async (
  context: Context,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await deleteVehicleInput.execute(context);
};
