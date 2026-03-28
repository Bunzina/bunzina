import { Entity, type EntityProps } from "@/domain/core/entities/entity";

export interface StockMovementProps extends EntityProps {
  autoPartId: string;
  quantity: number;
  type: "IN" | "OUT";
  serviceOrderId?: string;
  createdAt?: Date;
}

export class StockMovement extends Entity {
  autoPartId!: string;
  quantity!: number;
  type!: "IN" | "OUT";
  serviceOrderId?: string;
  createdAt?: Date;

  constructor(input: StockMovementProps) {
    super(input.id);

    input.createdAt = input.createdAt ?? new Date();

    Object.assign(this, input);
  }
}
