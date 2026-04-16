import type { Vehicle } from '@/domain/vehicle/entities/vehicle';
import type { VehicleResponse } from './dtos/vehicle-response';

export const VehiclePresenter = {
  toHttp(vehicle: Vehicle): VehicleResponse {
    return {
      id: vehicle.id!,
      customerId: vehicle.customerId,
      licensePlate: vehicle.licensePlate.value,
      model: vehicle.model,
      brand: vehicle.brand,
      year: vehicle.year,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  },
};
