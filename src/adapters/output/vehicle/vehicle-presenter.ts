import type { Vehicle } from '@/domain/vehicle/entities/vehicle';
import dayjs from 'dayjs';
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
      createdAt: dayjs(vehicle.createdAt).format('YYYY-MM-DD'),
      updatedAt: dayjs(vehicle.updatedAt).format('YYYY-MM-DD'),
    };
  },
};
