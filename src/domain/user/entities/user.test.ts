import { makeEmail } from '@/test/factories/make-email';
import { UserRole } from '../types/user-role';
import { User } from './user';

describe('user entity', () => {
  test('should create a user with valid properties', () => {
    const user = new User({
      name: 'John Doe',
      email: makeEmail(),
      passwordHash: 'password123',
      role: UserRole.CUSTOMER,
      isActive: true,
    });

    expect(user).toBeInstanceOf(User);
    expect(user).toEqual({
      createdAt: expect.any(Date),
      email: expect.any(Object),
      id: expect.any(String),
      isActive: true,
      name: 'John Doe',
      passwordHash: 'password123',
      role: UserRole.CUSTOMER,
      updatedAt: expect.any(Date),
    } as unknown as User);
  });
});
