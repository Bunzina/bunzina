import type { Customer } from '@/domain/customer/entities/customer';
import type { CustomerRepository } from '@/domain/customer/repositories/customer-repository';
import { NotFoundError } from '@lucas-pmelo/lambda-handlers';
import logger from '@lucas-pmelo/logger';

interface Input {
  documentNumber: string;
}

export class FindCustomerUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute({ documentNumber }: Input): Promise<Customer> {
    const customer = await this.customerRepository.findByDocumentNumber(documentNumber);

    if (!customer) {
      logger.warn({
        message: 'Customer not found',
        data: {
          documentNumber: documentNumber,
        },
      });

      throw new NotFoundError('Customer not found');
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
