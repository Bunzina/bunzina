import { Address } from '@/domain/core/value-objects/address';
import { Document } from '@/domain/core/value-objects/document';
import { Email } from '@/domain/core/value-objects/email';
import { Phone } from '@/domain/core/value-objects/phone';
import { Customer } from '@/domain/customer/entities/customer';
import type { CustomerDbSchema } from '../dtos/customer-db-schema';

export const CustomerMapper = {
  toDatabase(customer: Customer): CustomerDbSchema {
    return {
      id: customer.id!,
      name: customer.name,
      document: customer.document.value,
      document_kind: customer.document.kind,
      email: customer.email.value,
      phone: customer.phone.value,
      address_street: customer.address.street,
      address_number: customer.address.number,
      address_city: customer.address.city,
      address_state: customer.address.state,
      address_zip_code: customer.address.zipCode,
      address_neighborhood: customer.address.neighborhood,
      address_complement: customer.address.complement,
      created_at: customer.createdAt,
      updated_at: customer.updatedAt,
    };
  },

  toDomain(record: CustomerDbSchema): Customer {
    return new Customer({
      id: record.id,
      name: record.name,
      document: new Document(record.document),
      email: new Email(record.email),
      phone: new Phone(record.phone),
      address: new Address({
        street: record.address_street,
        number: record.address_number,
        city: record.address_city,
        state: record.address_state,
        zipCode: record.address_zip_code,
        neighborhood: record.address_neighborhood,
        complement: record.address_complement,
      }),
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  },
};
