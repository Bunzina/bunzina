export class Document {
  private readonly value: string;
  private readonly type: "CPF" | "CNPJ";

  constructor(value: string) {
    const cleanedValue = value.replace(/\D/g, "");

    if (cleanedValue.length === 11) {
      this.type = "CPF";
    } else if (cleanedValue.length === 14) {
      this.type = "CNPJ";
    } else {
      throw new Error("Invalid document number");
    }

    this.value = cleanedValue;
  }
}
