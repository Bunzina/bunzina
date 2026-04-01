import { Address } from '@/domain/core/value-objects/address';

export const makeAddress = (override: Partial<Address> = {}): Address => {
  return new Address({
    street: '123 Main St',
    number: '456',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
    neighborhood: 'Downtown',
    complement: 'Apt 789',
    ...override,
  });
};
