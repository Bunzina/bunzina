import { Entity, type EntityProps } from '@/domain/core/entities/entity';
import type { Price } from '@/domain/core/value-objects/price';

export interface ServiceProps extends EntityProps {
  name: string;
  description: string;
  price: Price;
  durationInMinutes: number;
  isActive: boolean;
  completedCount?: number;
  totalExecutionTimeMs?: number;
  createdAt?: Date;
  updatedAt?: Date;
  averageExecutionTimeMs?: number;
}

export class Service extends Entity {
  name!: string;
  description!: string;
  price!: Price;
  durationInMinutes!: number;
  isActive!: boolean;
  completedCount!: number;
  totalExecutionTimeMs!: number;
  createdAt!: Date;
  updatedAt!: Date;
  averageExecutionTimeMs?: number;

  constructor({ id, ...input }: ServiceProps) {
    super(id);

    input.createdAt = input.createdAt ?? new Date();
    input.updatedAt = input.updatedAt ?? new Date();
    input.completedCount = input.completedCount ?? 0;
    input.totalExecutionTimeMs = input.totalExecutionTimeMs ?? 0;

    Object.assign(this, input);
  }
}
