import { Price } from "./price";

describe("price value object", () => {
  test("should create a price with a valid value", () => {
    const price = new Price(100);
    expect(price).toBeInstanceOf(Price);
  });

  test("should throw an error when creating a price with a negative value", () => {
    expect(() => new Price(-50)).toThrow("Price cannot be negative");
  });
});
