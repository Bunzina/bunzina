import { UserRole } from '@/domain/user/types/user-role';
import { makeUser } from '@/test/factories/make-user';
import type { UserDbSchema } from '../dtos/user-db-schema';
import { UserMapper } from './user-mapper';

describe('user mapper', () => {
  test('should map database record to domain entity', () => {
    const record: UserDbSchema = {
      id: '123',
      name: 'John Doe',
      document: '11144477735',
      email: 'john@example.com',
      password_hash: 'hashed-password',
      role: UserRole.ADMIN,
      is_active: true,
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-02'),
    };

    const user = UserMapper.toDomain(record);

    expect(user.id).toBe('123');
    expect(user.name).toBe('John Doe');
    expect(user.document.value).toBe('11144477735');
    expect(user.email.value).toBe('john@example.com');
    expect(user.passwordHash).toBe('hashed-password');
    expect(user.role).toBe(UserRole.ADMIN);
    expect(user.isActive).toBe(true);
    expect(user.createdAt).toEqual(new Date('2025-01-01'));
    expect(user.updatedAt).toEqual(new Date('2025-01-02'));
  });

  test('should map domain entity to database record', () => {
    const user = makeUser({
      role: UserRole.MECHANIC,
      isActive: false,
    });

    const record = UserMapper.toDatabase(user);

    expect(record.id).toBe(user.id!);
    expect(record.name).toBe(user.name);
    expect(record.document).toBe(user.document.value);
    expect(record.email).toBe(user.email.value);
    expect(record.password_hash).toBe(user.passwordHash);
    expect(record.role).toBe(UserRole.MECHANIC);
    expect(record.is_active).toBe(false);
    expect(record.created_at).toEqual(user.createdAt);
    expect(record.updated_at).toEqual(user.updatedAt);
  });
});
