import type { StockMovementType } from '@/domain/auto-part/types/stock-movement-type';

export interface StockMovementDbSchema {
  id: string;
  auto_part_id: string;
  quantity: number;
  type: StockMovementType;
  service_order_id?: string;
  created_at: Date;
}
