import { Vehicle } from '@/domain/vehicle/entities/vehicle';
import type { VehicleRepository as IVehicleRepository } from '@/domain/vehicle/repositories/vehicle-repository';
import logger from '@lucas-pmelo/logger';
import { SQL } from 'bun';
import type { VehicleDbSchema } from './dtos/vehicle-db-schema';
import { VehicleMapper } from './mappers/vehicle-mapper';

export class VehicleRepository implements IVehicleRepository {
  constructor(private client: SQL) {}

  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    const [record] = await this.client<VehicleDbSchema[]>`
      SELECT * FROM bunzina.vehicles WHERE license_plate = ${licensePlate} LIMIT 1
    `;

    if (!record) {
      logger.debug({
        message: 'No vehicle found with license plate',
        data: { licensePlate },
      });

      return null;
    }

    const vehicle = VehicleMapper.toDomain(record);

    logger.debug({
      message: 'Vehicle found with license plate',
      data: {
        licensePlate,
        vehicle,
      },
    });

    return vehicle;
  }

  async findById(id: string): Promise<Vehicle | null> {
    const [record] = await this.client<VehicleDbSchema[]>`
      SELECT * FROM bunzina.vehicles WHERE id = ${id} LIMIT 1
    `;

    if (!record) {
      logger.debug({
        message: 'No vehicle found with id',
        data: { id },
      });

      return null;
    }

    const vehicle = VehicleMapper.toDomain(record);

    logger.debug({
      message: 'Vehicle found with id',
      data: {
        id,
        vehicle,
      },
    });

    return vehicle;
  }

  async create(vehicle: Vehicle): Promise<Vehicle> {
    const recordToSave = VehicleMapper.toDatabase(vehicle);

    logger.debug({
      message: 'Saving vehicle to database',
      data: recordToSave,
    });

    await this.client`
      INSERT INTO bunzina.vehicles ${this.client(recordToSave)}
    `;

    return vehicle;
  }
}
