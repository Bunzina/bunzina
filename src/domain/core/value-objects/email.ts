export class Email {
  value: string;

  constructor(value: string) {
    if (!this.validateEmail(value)) {
      throw new Error("Invalid email address");
    }

    this.value = value;
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}
