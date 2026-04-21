export interface VehicleResponse {
  id: string;
  customerId: string;
  licensePlate: string;
  model: string;
  brand: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehiclesListResponse {
  data: VehicleResponse[];
  pagination: {
    page: number;
    limit: number;
  };
}
