import type { Vehicle } from '@/domain/vehicle/entities/vehicle';
import type { VehicleRepository } from '@/domain/vehicle/repositories/vehicle-repository';
import logger from '@lucas-pmelo/logger';

interface Input {
  page: number;
  limit: number;
  filters?: {
    customerId?: string;
    licensePlate?: string;
    model?: string;
    brand?: string;
    year?: number;
    startCreatedAt?: Date;
    endCreatedAt?: Date;
  };
}

interface Output {
  data: Vehicle[];
}

export class ListVehiclesUseCase {
  constructor(private vehicleRepository: VehicleRepository) {}

  async execute(input: Input): Promise<Output> {
    logger.info({
      message: 'Listing vehicles',
      data: {
        ...input,
      },
    });

    const data = await this.vehicleRepository.findByParams(input);

    return {
      data,
    };
  }
}
