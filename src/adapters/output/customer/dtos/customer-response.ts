import type { AddressResponse } from './address-response';

export interface CustomerResponse {
  id: string;
  name: string;
  document: string;
  documentKind: string;
  email: string;
  phone: string;
  address: AddressResponse;
  createdAt: Date;
  updatedAt: Date;
}
