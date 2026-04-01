import { Document } from '@/domain/core/value-objects/document';

export const makeDocument = (override?: string): Document => {
  return new Document(override ?? '123.456.789-00');
};
