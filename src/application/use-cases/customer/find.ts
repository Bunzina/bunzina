import type { Customer } from '@/domain/customer/entities/customer';
import type { CustomerRepository } from '@/domain/customer/repositories/customer-repository';
import { NotFoundError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

interface Input {
  documentNumber: string;
}

export class FindCustomerUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute({ documentNumber }: Input): Promise<Customer> {
    const customer =
      await this.customerRepository.findByDocumentNumber(documentNumber);

    if (!customer) {
      const message = 'Customer not found';

      logger.warn({
        message,
        data: {
          documentNumber: documentNumber,
        },
      });

      throw new NotFoundError(message);
    }

    logger.debug({
      message: 'Customer found',
      data: {
        customer: customer,
      },
    });

    return customer;
  }
}
