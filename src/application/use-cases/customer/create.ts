import { Address } from '@/domain/core/value-objects/address';
import { Document } from '@/domain/core/value-objects/document';
import { Email } from '@/domain/core/value-objects/email';
import { Phone } from '@/domain/core/value-objects/phone';
import { Customer } from '@/domain/customer/entities/customer';
import type { CustomerRepository } from '@/domain/customer/repositories/customer-repository';
import { ConflictError } from '@lucas-pmelo/lambda-handlers';
import logger from '@lucas-pmelo/logger';

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
    const persistedCustomer = await this.customerRepository.findByDocumentNumber(input.document);

    if (persistedCustomer) {
      logger.warn({
        message: 'Customer already exists',
        data: {
          documentNumber: input.document,
        },
      });

      throw new ConflictError('Customer already exists');
    }

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

    logger.debug({
      message: 'Creating customer',
      data: {
        customer,
      },
    });

    await this.customerRepository.create(customer);

    return customer;
  }
}
