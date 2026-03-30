import { Entity, type EntityProps } from "@/domain/core/entities/entity";
import type { Price } from "@/domain/core/value-objects/price";

export interface AutoPartProps extends EntityProps {
  name: string;
  description: string;
  price: Price;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AutoPart extends Entity {
  name!: string;
  description!: string;
  price!: Price;
  stock!: number;
  createdAt!: Date;
  updatedAt!: Date;

  constructor({ id, ...input }: AutoPartProps) {
    super(id);

    input.createdAt = input.createdAt ?? new Date();
    input.updatedAt = input.updatedAt ?? new Date();

    Object.assign(this, input);
  }
}
