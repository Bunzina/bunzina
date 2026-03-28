import { Entity, type EntityProps } from "@/domain/core/entities/entity";
import type { Price } from "@/domain/core/value-objects/price";

export interface AutoPartItemProps extends EntityProps {
  autoPartId: string;
  quantity: number;
  unitPrice: Price;
  totalPrice?: Price;
  description?: string;
}

export class AutoPartItem extends Entity {
  autoPartId!: string;
  quantity!: number;
  unitPrice!: Price;
  totalPrice?: Price;
  description?: string;

  constructor(input: AutoPartItemProps) {
    super(input.id);

    if (input.quantity < 0) {
      throw new Error("Quantity cannot be negative");
    }

    input.totalPrice = input.totalPrice ?? input.unitPrice;

    Object.assign(this, input);
  }
}
