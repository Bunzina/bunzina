import type { DocumentKind } from '@/domain/core/types/document-kind';

export interface CustomerDbSchema {
  id: string;
  name: string;
  document: string;
  document_kind: DocumentKind;
  email: string;
  created_at: Date;
  updated_at: Date;
  phone: string;
  address_street: string;
  address_number: string;
  address_city: string;
  address_state: string;
  address_zip_code: string;
  address_neighborhood: string;
  address_complement?: string;
}
