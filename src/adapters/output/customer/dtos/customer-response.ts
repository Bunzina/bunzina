import type { DocumentKind } from "@/domain/core/types/document-kind";
import type { AddressResponse } from "./address-response";

export interface CustomerResponse {
  id: string;
  name: string;
  document: string;
  documentKind: DocumentKind;
  email: string;
  phone: string;
  address: AddressResponse;
  createdAt: Date;
  updatedAt: Date;
}
