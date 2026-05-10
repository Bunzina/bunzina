import { ListVehiclesInput } from '@/adapters/input/vehicle/list';
import { ListVehiclesUseCase } from '@/application/use-cases/vehicle/list';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { VehicleRepository } from '@/infrastructure/repositories/vehicle/vehicle-repository';
import logger from '@lucas-pmelo/logger';
import type { HandlerContext } from '@/api/handler-context';

let vehicleRepository: VehicleRepository;
let listVehiclesUseCase: ListVehiclesUseCase;
let listVehiclesInput: ListVehiclesInput;

const setDependencies = () => {
  vehicleRepository = new VehicleRepository(dbInstance);
  listVehiclesUseCase = new ListVehiclesUseCase(vehicleRepository);
  listVehiclesInput = new ListVehiclesInput(listVehiclesUseCase);
};

export const listVehiclesHandler = async (
  context: HandlerContext,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await listVehiclesInput.execute(context);
};
