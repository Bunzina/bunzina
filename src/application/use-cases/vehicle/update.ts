import { LicensePlate } from '@/domain/vehicle/value-objects/license-plate';
import type { Vehicle } from '@/domain/vehicle/entities/vehicle';
import type { VehicleRepository } from '@/domain/vehicle/repositories/vehicle-repository';
import type { CustomerRepository } from '@/domain/customer/repositories/customer-repository';
import { NotFoundError, ConflictError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

interface Input {
  id: string;
  customerId: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
}

export class UpdateVehicleUseCase {
  constructor(
    private vehicleRepository: VehicleRepository,
    private customerRepository: CustomerRepository,
  ) {}

  async execute(input: Input): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findById(input.id);

    if (!vehicle) {
      const message = 'Vehicle not found';

      logger.warn({
        message,
        data: {
          id: input.id,
        },
      });

      throw new NotFoundError(message);
    }

    if (vehicle.customerId !== input.customerId) {
      const customer = await this.customerRepository.findById(input.customerId);

      if (!customer) {
        const message = 'Customer not found';

        logger.warn({
          message,
          data: {
            customerId: input.customerId,
          },
        });

        throw new NotFoundError(message);
      }
    }

    if (vehicle.licensePlate.value !== input.licensePlate) {
      const vehicleWithPlate = await this.vehicleRepository.findByLicensePlate(
        input.licensePlate,
      );

      if (vehicleWithPlate && vehicleWithPlate.id !== vehicle.id) {
        const message = 'License plate already in use';

        logger.warn({
          message,
          data: {
            licensePlate: input.licensePlate,
          },
        });

        throw new ConflictError(message);
      }
    }

    vehicle.customerId = input.customerId;
    vehicle.licensePlate = new LicensePlate(input.licensePlate);
    vehicle.brand = input.brand;
    vehicle.model = input.model;
    vehicle.year = input.year;
    vehicle.updatedAt = new Date();

    logger.debug({
      message: 'Updating vehicle',
      data: {
        vehicle,
      },
    });

    await this.vehicleRepository.update(vehicle);

    return vehicle;
  }
}
