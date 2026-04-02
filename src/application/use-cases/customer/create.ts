import type { CustomerRepository } from '@/domain/customer/repositories/customer-repository';
import { Customer } from '@/domain/customer/entities/customer';
import { Document } from '@/domain/core/value-objects/document';
import { Email } from '@/domain/core/value-objects/email';
import { Phone } from '@/domain/core/value-objects/phone';
import { Address } from '@/domain/core/value-objects/address';

interface AddressInput {
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
  neighborhood: string;
  complement?: string;
}

interface Input {
  name: string;
  document: string;
  email: string;
  phone: string;
  address: AddressInput;
}

export class CreateCustomerUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(input: Input): Promise<Customer> {
    const document = new Document(input.document);
    const email = new Email(input.email);
    const phone = new Phone(input.phone);
    const address = new Address(input.address);

    const customer = new Customer({
      name: input.name,
      document,
      email,
      phone,
      address,
    });

    await this.customerRepository.create(customer);

    return customer;
  }
}
