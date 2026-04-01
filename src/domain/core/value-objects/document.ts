import { DocumentKind } from '../types/document-kind';

export class Document {
  value: string;
  kind: DocumentKind;

  constructor(value: string) {
    const cleanedValue = value.replace(/\D/g, '');

    if (cleanedValue.length === 11) {
      this.kind = DocumentKind.CPF;
    } else if (cleanedValue.length === 14) {
      this.kind = DocumentKind.CNPJ;
    } else {
      throw new Error('Invalid document number');
    }

    this.value = cleanedValue;
  }
}
