import { Email } from '@/domain/core/value-objects/email';
import { User } from '@/domain/user/entities/user';
import type { UserDbSchema } from '../dtos/user-db-schema';

export const UserMapper = {
  toDatabase(user: User): UserDbSchema {
    return {
      id: user.id!,
      name: user.name,
      email: user.email.value,
      password_hash: user.passwordHash,
      role: user.role,
      is_active: user.isActive,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  },

  toDomain(record: UserDbSchema): User {
    return new User({
      id: record.id,
      name: record.name,
      email: new Email(record.email),
      passwordHash: record.password_hash,
      role: record.role,
      isActive: record.is_active,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  },
};
