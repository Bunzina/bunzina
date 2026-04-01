import type { CustomerRepository as ICustomerRepository } from '@/domain/customer/repositories/customer-repository';
import type { Customer } from '@/domain/customer/entities/customer';
import { CustomerMapper } from './mappers/customer-mapper';
import { db } from '@/infrastructure/configs/database';

export class CustomerRepository implements ICustomerRepository {
  constructor(private client: any) {} //TO DO: ENTENDER A IMPLEMENTAÇÃO
  async create(customer: Customer): Promise<Customer> {
    const recordToSave = CustomerMapper.toDatabase(customer);

    await db`
      INSERT INTO bunzina.customers ${db(recordToSave)}
    `; //TO DO: ENTENDER A IMPLEMENTAÇÃO

    return customer;
  }
}
