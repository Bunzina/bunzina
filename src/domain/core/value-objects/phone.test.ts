import { Phone } from "./phone";

describe("phone value object", () => {
  test("should create a phone with a valid phone number", () => {
    const phone = new Phone("+1234567890");

    expect(phone).toBeInstanceOf(Phone);
    expect(phone).toEqual({
      value: "+1234567890",
    } as unknown as Phone);
  });

  test("should throw an error when creating a phone with an invalid phone number", () => {
    expect(() => new Phone("invalid-phone")).toThrow("Invalid phone number");
  });
});
