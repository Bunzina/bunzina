import type { Customer } from '../entities/customer';

export interface CustomerRepository {
  create(customer: Customer): Promise<Customer>;
  findByDocumentNumber(documentNumber: string): Promise<Customer | null>;
  findById(id: string): Promise<Customer | null>;
  update(customer: Customer): Promise<Customer>;
  delete(documentNumber: string): Promise<void>;
}
