import { Address } from '@/domain/core/value-objects/address';
import { Email } from '@/domain/core/value-objects/email';
import { Phone } from '@/domain/core/value-objects/phone';
import type { Customer } from '@/domain/customer/entities/customer';
import type { CustomerRepository } from '@/domain/customer/repositories/customer-repository';
import { NotFoundError } from '@lucas-pmelo/handlers';
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
  documentNumber: string;
  name: string;
  email: string;
  phone: string;
  address: AddressInput;
}

export class UpdateCustomerUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(input: Input): Promise<Customer> {
    const customer = await this.customerRepository.findByDocumentNumber(
      input.documentNumber,
    );

    if (!customer) {
      const message = 'Customer not found';

      logger.warn({
        message,
        data: {
          documentNumber: input.documentNumber,
        },
      });

      throw new NotFoundError(message);
    }

    customer.name = input.name;
    customer.email = new Email(input.email);
    customer.phone = new Phone(input.phone);
    customer.address = new Address(input.address);
    customer.updatedAt = new Date();

    logger.debug({
      message: 'Updating customer',
      data: {
        customer,
      },
    });

    await this.customerRepository.update(customer);

    return customer;
  }
}
