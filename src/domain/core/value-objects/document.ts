import { DocumentType } from "../types/document-type";

export class Document {
  value: string;
  type: DocumentType;

  constructor(value: string) {
    const cleanedValue = value.replace(/\D/g, "");

    if (cleanedValue.length === 11) {
      this.type = DocumentType.CPF;
    } else if (cleanedValue.length === 14) {
      this.type = DocumentType.CNPJ;
    } else {
      throw new Error("Invalid document number");
    }

    this.value = cleanedValue;
  }
}
