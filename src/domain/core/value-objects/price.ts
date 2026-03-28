export class Price {
  private readonly value: number;

  constructor(value: number) {
    if (value < 0) {
      throw new Error("Price cannot be negative");
    }
    this.value = value;
  }
}
