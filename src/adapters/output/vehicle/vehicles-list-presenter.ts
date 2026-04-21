import type { Vehicle } from '@/domain/vehicle/entities/vehicle';
import { VehiclePresenter } from './vehicle-presenter';
import type { VehiclesListResponse } from './dtos/vehicles-list-response';
import type { VehicleResponse } from './dtos/vehicle-response';

export const VehiclesListPresenter = {
  toHttp(
    vehicles: Vehicle[],
    page: number,
    limit: number,
  ): VehiclesListResponse {
    const data: VehicleResponse[] = vehicles.map((vehicle) =>
      VehiclePresenter.toHttp(vehicle),
    );

    return {
      data,
      pagination: {
        page,
        limit,
      },
    };
  },
};
