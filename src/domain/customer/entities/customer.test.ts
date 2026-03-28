import { makeAddress } from "../../../test/factories/make-address";
import { makeDocument } from "../../../test/factories/make-document";
import { makeEmail } from "../../../test/factories/make-email";
import { makePhone } from "../../../test/factories/make-phone";
import { Customer } from "./customer";

describe("customer entity", () => {
  test("should create a customer with valid properties", () => {
    const customer = new Customer({
      name: "John Doe",
      document: makeDocument(),
      email: makeEmail(),
      phone: makePhone(),
      address: makeAddress(),
    });

    expect(customer).toBeInstanceOf(Customer);
    expect(customer).toEqual({
      address: {
        city: "Anytown",
        complement: "Apt 789",
        neighborhood: "Downtown",
        number: "456",
        state: "CA",
        street: "123 Main St",
        zipCode: "12345",
      },
      createdAt: expect.any(Date),
      document: {
        type: "CPF",
        value: "12345678900",
      },
      email: {
        value: "lucas.coda.fofo@gmail.com",
      },
      id: expect.any(String),
      name: "John Doe",
      phone: {
        value: "+1234567890",
      },
      updatedAt: expect.any(Date),
    } as unknown as Customer);
  });
});
