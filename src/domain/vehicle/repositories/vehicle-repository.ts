import type { Vehicle } from '../entities/vehicle';

export interface VehicleRepository {
  create(vehicle: Vehicle): Promise<Vehicle>;
  findByLicensePlate(licensePlate: string): Promise<Vehicle | null>;
  findById(id: string): Promise<Vehicle | null>;
  update(vehicle: Vehicle): Promise<Vehicle>;
}
