import { Entity, type EntityProps } from "@/domain/core/entities/entity";
import type { Price } from "@/domain/core/value-objects/price";

export interface ServiceProps extends EntityProps {
  name: string;
  description: string;
  price: Price;
  duration: number; // Duration in minutes
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Service extends Entity {
  name!: string;
  description!: string;
  price!: Price;
  duration!: number;
  isActive!: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input: ServiceProps) {
    super(input.id);

    input.createdAt = input.createdAt ?? new Date();
    input.updatedAt = input.updatedAt ?? new Date();

    Object.assign(this, input);
  }
}
