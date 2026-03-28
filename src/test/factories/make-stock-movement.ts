import { StockMovement } from "@/domain/auto-part/entities/stock-movement";

export const makeStockMovement = (
  override?: Partial<StockMovement>,
): StockMovement => {
  return new StockMovement({
    autoPartId: "auto-part-id",
    quantity: 10,
    type: "IN",
    serviceOrderId: "service-order-id",
    ...override,
  });
};
