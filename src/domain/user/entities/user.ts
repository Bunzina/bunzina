import { Entity, type EntityProps } from '@/domain/core/entities/entity';
import type { Email } from '@/domain/core/value-objects/email';
import type { UserRole } from '../types/user-role';

export interface UserProps extends EntityProps {
  name: string;
  email: Email;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Entity {
  name!: string;
  email!: Email;
  passwordHash!: string;
  role!: UserRole;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor({ id, ...input }: UserProps) {
    super(id);

    input.createdAt = input.createdAt ?? new Date();
    input.updatedAt = input.updatedAt ?? new Date();

    Object.assign(this, input);
  }
}
