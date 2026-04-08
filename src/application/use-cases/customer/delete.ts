import type { CustomerRepository } from '@/domain/customer/repositories/customer-repository';
import { NotFoundError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

interface Input {
  documentNumber: string;
}

export class DeleteCustomerUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute({ documentNumber }: Input): Promise<void> {
    const customer =
      await this.customerRepository.findByDocumentNumber(documentNumber);

    if (!customer) {
      const message = 'Customer not found';

      logger.warn({
        message,
        data: {
          documentNumber,
        },
      });

      throw new NotFoundError(message);
    }

    logger.debug({
      message: 'Deleting customer',
      data: {
        customer,
      },
    });

    await this.customerRepository.delete(documentNumber);
  }
}
