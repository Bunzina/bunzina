import { FindVehicleByIdInput } from '@/adapters/input/vehicle/find';
import { FindVehicleByIdUseCase } from '@/application/use-cases/vehicle/find-by-id';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { VehicleRepository } from '@/infrastructure/repositories/vehicle/vehicle-repository';
import logger from '@lucas-pmelo/logger';
import type { HandlerContext } from '@/api/handler-context';

let vehicleRepository: VehicleRepository;
let findVehicleByIdUseCase: FindVehicleByIdUseCase;
let findVehicleByIdInput: FindVehicleByIdInput;

const setDependencies = () => {
  vehicleRepository = new VehicleRepository(dbInstance);
  findVehicleByIdUseCase = new FindVehicleByIdUseCase(vehicleRepository);
  findVehicleByIdInput = new FindVehicleByIdInput(findVehicleByIdUseCase);
};

export const findVehicleHandler = async (
  context: HandlerContext,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await findVehicleByIdInput.execute(context);
};
