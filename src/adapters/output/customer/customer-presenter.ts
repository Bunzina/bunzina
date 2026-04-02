import type { Customer } from '@/domain/customer/entities/customer';
import dayjs from 'dayjs';
import type { CustomerResponse } from './dtos/customer-response';

export class CustomerPresenter {
  static toHttp(customer: Customer): CustomerResponse {
    return {
      id: customer.id!,
      name: customer.name,
      document: customer.document.value,
      documentKind: customer.document.kind,
      email: customer.email.value,
      phone: customer.phone.value,
      address: {
        street: customer.address.street,
        number: customer.address.number,
        city: customer.address.city,
        state: customer.address.state,
        zipCode: customer.address.zipCode,
        neighborhood: customer.address.neighborhood,
        complement: customer.address.complement,
      },
      createdAt: dayjs(customer.createdAt).format('DD-MM-YYYY'),
      updatedAt: dayjs(customer.updatedAt).format('DD-MM-YYYY'),
    };
  }
}
