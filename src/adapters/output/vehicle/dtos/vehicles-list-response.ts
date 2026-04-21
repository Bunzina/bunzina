import type { VehicleResponse } from './vehicle-response';

export interface VehiclesListResponse {
  data: VehicleResponse[];
  pagination: {
    page: number;
    limit: number;
  };
}
