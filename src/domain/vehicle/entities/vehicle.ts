import { Entity, type EntityProps } from "@/domain/core/entities/entity";
import type { LicensePlate } from "../value-objects/license-plate";

export interface VehicleProps extends EntityProps {
  customerId: string;
  licensePlate: LicensePlate;
  model: string;
  brand: string;
  year: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Vehicle extends Entity {
  customerId!: string;
  licensePlate!: LicensePlate;
  model!: string;
  brand!: string;
  year!: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input: VehicleProps) {
    super(input.id);

    input.createdAt = input.createdAt ?? new Date();
    input.updatedAt = input.updatedAt ?? new Date();

    Object.assign(this, input);
  }
}
