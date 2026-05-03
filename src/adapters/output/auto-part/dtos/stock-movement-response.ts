import type { StockMovementType } from '@/domain/auto-part/types/stock-movement-type';

export interface StockMovementResponse {
  id: string;
  autoPartId: string;
  quantity: number;
  type: StockMovementType;
  serviceOrderId?: string;
  createdAt: Date;
}
