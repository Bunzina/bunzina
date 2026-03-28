export class Phone {
  value: string;

  constructor(value: string) {
    if (!this.validatePhone(value)) {
      throw new Error("Invalid phone number");
    }

    this.value = value;
  }

  private validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }
}
