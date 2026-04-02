import type { Customer } from '@/domain/customer/entities/customer';
import type { CustomerRepository as ICustomerRepository } from '@/domain/customer/repositories/customer-repository';
import { SQL } from 'bun';
import { CustomerMapper } from './mappers/customer-mapper';

export class CustomerRepository implements ICustomerRepository {
  constructor(private client: SQL) {}

  async create(customer: Customer): Promise<Customer> {
    const recordToSave = CustomerMapper.toDatabase(customer);

    await this.client`
      INSERT INTO bunzina.customers ${this.client(recordToSave)}
    `;

    return customer;
  }
}
