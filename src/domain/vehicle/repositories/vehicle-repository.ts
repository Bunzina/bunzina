import type { Vehicle } from '../entities/vehicle';

export interface FindVehiclesFilters {
  customerId?: string;
  licensePlate?: string;
  model?: string;
  brand?: string;
  year?: number;
  startCreatedAt?: Date;
  endCreatedAt?: Date;
}

export interface FindVehiclesParams {
  page: number;
  limit: number;
  filters?: FindVehiclesFilters;
}

export interface VehicleRepository {
  create(vehicle: Vehicle): Promise<Vehicle>;
  findByLicensePlate(licensePlate: string): Promise<Vehicle | null>;
  findById(id: string): Promise<Vehicle | null>;
  findByParams(params: FindVehiclesParams): Promise<Vehicle[]>;
  update(vehicle: Vehicle): Promise<Vehicle>;
  delete(id: string): Promise<void>;
}
