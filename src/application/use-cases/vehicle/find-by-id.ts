import type { Vehicle } from '@/domain/vehicle/entities/vehicle';
import type { VehicleRepository } from '@/domain/vehicle/repositories/vehicle-repository';
import { NotFoundError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

interface Input {
  id: string;
}

export class FindVehicleByIdUseCase {
  constructor(private vehicleRepository: VehicleRepository) {}

  async execute({ id }: Input): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findById(id);

    if (!vehicle) {
      const message = 'Vehicle not found';

      logger.warn({
        message,
        data: {
          id,
        },
      });

      throw new NotFoundError(message);
    }

    logger.debug({
      message: 'Vehicle found',
      data: {
        vehicle,
      },
    });

    return vehicle;
  }
}
