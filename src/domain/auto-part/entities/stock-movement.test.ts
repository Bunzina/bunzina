import { StockMovementType } from "../types/stock-movement-type";
import { StockMovement } from "./stock-movement";

describe("stock movement child entity", () => {
  test("should create a stock movement with valid properties", () => {
    const stockMovement = new StockMovement({
      autoPartId: "123",
      quantity: 10,
      type: StockMovementType.IN,
      serviceOrderId: "service-order-id",
    });

    expect(stockMovement).toBeInstanceOf(StockMovement);
    expect(stockMovement).toEqual({
      autoPartId: "123",
      createdAt: expect.any(Date),
      id: expect.any(String),
      quantity: 10,
      serviceOrderId: "service-order-id",
      type: "IN",
    } as unknown as StockMovement);
  });
});
