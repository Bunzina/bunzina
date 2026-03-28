import { makePrice } from "@/test/factories/make-price";
import { AutoPartItem } from "./auto-part-item";

describe("auto part item child entity", () => {
  test("should create an auto part item with valid properties", () => {
    const autoPartItem = new AutoPartItem({
      autoPartId: "auto-part-id",
      quantity: 2,
      unitPrice: makePrice(),
      description: "Brake Pad",
    });

    expect(autoPartItem).toBeInstanceOf(AutoPartItem);
    expect(autoPartItem).toEqual({
      autoPartId: "auto-part-id",
      id: expect.any(String),
      description: "Brake Pad",
      quantity: 2,
      totalPrice: {
        value: 100,
      },
      unitPrice: {
        value: 100,
      },
    } as unknown as AutoPartItem);
  });

  test("should not allow creating an auto part item with a negative quantity (no validation in class)", () => {
    expect(
      () =>
        new AutoPartItem({
          autoPartId: "auto-part-id",
          quantity: -2,
          unitPrice: makePrice(100),
        }),
    ).toThrow("Quantity cannot be negative");
  });

  test("should throw an error when creating an auto part item with a negative price", () => {
    expect(
      () =>
        new AutoPartItem({
          autoPartId: "auto-part-id",
          quantity: 2,
          unitPrice: makePrice(-100),
        }),
    ).toThrow("Price cannot be negative");
  });
});
