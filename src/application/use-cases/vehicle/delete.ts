import type { VehicleRepository } from '@/domain/vehicle/repositories/vehicle-repository';
import { NotFoundError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

interface Input {
  id: string;
}

export class DeleteVehicleUseCase {
  constructor(private vehicleRepository: VehicleRepository) {}

  async execute({ id }: Input): Promise<void> {
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
      message: 'Deleting vehicle',
      data: {
        vehicle,
      },
    });

    await this.vehicleRepository.delete(id);
  }
}
