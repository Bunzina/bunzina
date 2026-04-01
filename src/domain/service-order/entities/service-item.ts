import { Entity, type EntityProps } from '@/domain/core/entities/entity';
import type { Price } from '@/domain/core/value-objects/price';

export interface ServiceItemProps extends EntityProps {
  serviceId: string;
  price: Price;
  description?: string;
}

export class ServiceItem extends Entity {
  serviceId!: string;
  price!: Price;
  description?: string;

  constructor({ id, ...input }: ServiceItemProps) {
    super(id);

    Object.assign(this, input);
  }
}
