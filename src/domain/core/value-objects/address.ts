export class Address {
  street!: string;
  number!: string;
  city!: string;
  state!: string;
  zipCode!: string;
  neighborhood!: string;
  complement?: string;

  constructor({ id, ...input }: Address) {
    Object.assign(this, input);
  }
}
