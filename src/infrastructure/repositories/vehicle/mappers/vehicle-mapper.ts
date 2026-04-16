import { LicensePlate } from '@/domain/vehicle/value-objects/license-plate';
import { Vehicle } from '@/domain/vehicle/entities/vehicle';
import type { VehicleDbSchema } from '../dtos/vehicle-db-schema';

export const VehicleMapper = {
  toDatabase(vehicle: Vehicle): VehicleDbSchema {
    return {
      id: vehicle.id!,
      customer_id: vehicle.customerId,
      license_plate: vehicle.licensePlate.value,
      model: vehicle.model,
      brand: vehicle.brand,
      year: vehicle.year,
      created_at: vehicle.createdAt,
      updated_at: vehicle.updatedAt,
    };
  },

  toDomain(record: VehicleDbSchema): Vehicle {
    return new Vehicle({
      id: record.id,
      customerId: record.customer_id,
      licensePlate: new LicensePlate(record.license_plate),
      model: record.model,
      brand: record.brand,
      year: record.year,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  },
};
