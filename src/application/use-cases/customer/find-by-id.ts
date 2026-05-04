import type { Customer } from '@/domain/customer/entities/customer';
import type { CustomerRepository } from '@/domain/customer/repositories/customer-repository';
import { NotFoundError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

interface Input {
  id: string;
}

export class FindCustomerByIdUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute({ id }: Input): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      const message = 'Customer not found';

      logger.warn({
        message,
        data: { id },
      });

      throw new NotFoundError(message);
    }

    return customer;
  }
}
