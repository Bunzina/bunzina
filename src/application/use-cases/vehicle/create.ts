import { LicensePlate } from '@/domain/vehicle/value-objects/license-plate';
import { Vehicle } from '@/domain/vehicle/entities/vehicle';
import type { VehicleRepository } from '@/domain/vehicle/repositories/vehicle-repository';
import { ConflictError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

interface Input {
  customerId: string;
  licensePlate: string;
  model: string;
  brand: string;
  year: number;
}

export class CreateVehicleUseCase {
  constructor(private vehicleRepository: VehicleRepository) {}

  async execute(input: Input): Promise<Vehicle> {
    const { licensePlate: licensePlateInput, ...vehicleData } = input;
    const persistedVehicle =
      await this.vehicleRepository.findByLicensePlate(licensePlateInput);

    if (persistedVehicle) {
      const message = 'Vehicle already exists';

      logger.warn({
        message,
        data: {
          licensePlate: licensePlateInput,
        },
      });

      throw new ConflictError(message);
    }

    const licensePlate = new LicensePlate(licensePlateInput);

    const vehicle = new Vehicle({
      ...vehicleData,
      licensePlate,
    });

    logger.debug({
      message: 'Creating vehicle',
      data: {
        vehicle,
      },
    });

    await this.vehicleRepository.create(vehicle);

    return vehicle;
  }
}
