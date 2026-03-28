import { Customer } from "@/domain/customer/entities/customer";
import { makeAddress } from "./make-address";
import { makeDocument } from "./make-document";
import { makeEmail } from "./make-email";
import { makePhone } from "./make-phone";

export const makeCustomer = (override?: Partial<Customer>): Customer => {
  return new Customer({
    id: "customer-id",
    name: "John Doe",
    document: makeDocument(),
    email: makeEmail(),
    phone: makePhone(),
    address: makeAddress(),
    ...override,
  });
};
