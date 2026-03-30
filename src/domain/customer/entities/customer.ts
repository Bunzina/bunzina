import { Entity, type EntityProps } from "@/domain/core/entities/entity";
import type { Address } from "@/domain/core/value-objects/address";
import type { Document } from "@/domain/core/value-objects/document";
import type { Email } from "@/domain/core/value-objects/email";
import type { Phone } from "@/domain/core/value-objects/phone";

export interface CustomerProps extends EntityProps {
  name: string;
  document: Document;
  email: Email;
  phone: Phone;
  address: Address;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Customer extends Entity {
  name!: string;
  document!: Document;
  email!: Email;
  phone!: Phone;
  address!: Address;
  createdAt!: Date;
  updatedAt!: Date;

  constructor({ id, ...input }: CustomerProps) {
    super(id);

    input.createdAt = input.createdAt ?? new Date();
    input.updatedAt = input.updatedAt ?? new Date();

    Object.assign(this, input);
  }
}
