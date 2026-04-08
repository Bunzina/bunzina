import { Customer } from '@/domain/customer/entities/customer';
import type { CustomerRepository as ICustomerRepository } from '@/domain/customer/repositories/customer-repository';
import logger from '@lucas-pmelo/logger';
import { SQL } from 'bun';
import type { CustomerDbSchema } from './dtos/customer-db-schema';
import { CustomerMapper } from './mappers/customer-mapper';

export class CustomerRepository implements ICustomerRepository {
  constructor(private client: SQL) {}

  async findByDocumentNumber(documentNumber: string): Promise<Customer | null> {
    const [record] = await this.client<CustomerDbSchema[]>`
      SELECT * FROM bunzina.customers WHERE document = ${documentNumber} LIMIT 1
    `;

    if (!record) {
      logger.debug({
        message: 'No customer found with document number',
        data: { documentNumber },
      });

      return null;
    }

    const customer = CustomerMapper.toDomain(record);

    logger.debug({
      message: 'Customer found with document number',
      data: {
        documentNumber,
        customer,
      },
    });

    return customer;
  }

  async create(customer: Customer): Promise<Customer> {
    const recordToSave = CustomerMapper.toDatabase(customer);

    logger.debug({
      message: 'Saving customer to database',
      data: recordToSave,
    });

    await this.client`
      INSERT INTO bunzina.customers ${this.client(recordToSave)}
    `;

    return customer;
  }

  async update(customer: Customer): Promise<Customer> {
    const recordToSave = CustomerMapper.toDatabase(customer);

    logger.debug({
      message: 'Updating customer in database',
      data: recordToSave,
    });

    const { id: _id, document, created_at: _created_at, ...fieldsToUpdate } = recordToSave;

    await this.client`
      UPDATE bunzina.customers SET ${this.client(fieldsToUpdate)} WHERE document = ${document}
    `;

    return customer;
  }

  async delete(documentNumber: string): Promise<void> {
    logger.debug({
      message: 'Deleting customer from database',
      data: { documentNumber },
    });

    await this.client`
      DELETE FROM bunzina.customers WHERE document = ${documentNumber}
    `;
  }
}
