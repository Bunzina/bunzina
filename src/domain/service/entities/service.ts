import { Entity, type EntityProps } from '@/domain/core/entities/entity';
import type { Price } from '@/domain/core/value-objects/price';

export interface ServiceProps extends EntityProps {
  name: string;
  description: string;
  price: Price;
  durationInMinutes: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  averageExecutionTimeMs?: number | null;
}

export class Service extends Entity {
  name!: string;
  description!: string;
  price!: Price;
  durationInMinutes!: number;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  averageExecutionTimeMs?: number | null;

  constructor({ id, ...input }: ServiceProps) {
    super(id);

    input.createdAt = input.createdAt ?? new Date();
    input.updatedAt = input.updatedAt ?? new Date();

    Object.assign(this, input);
  }
}
