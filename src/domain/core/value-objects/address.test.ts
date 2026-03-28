import { Address } from "./address";

describe("address value object", () => {
  test("should create an address with valid properties", () => {
    const address = new Address({
      street: "123 Main St",
      number: "456",
      city: "Anytown",
      state: "CA",
      zipCode: "12345",
      neighborhood: "Downtown",
      complement: "Apt 789",
    });

    expect(address).toBeInstanceOf(Address);
    expect(address).toEqual({
      street: "123 Main St",
      number: "456",
      city: "Anytown",
      state: "CA",
      zipCode: "12345",
      neighborhood: "Downtown",
      complement: "Apt 789",
    } as unknown as Address);
  });
});
