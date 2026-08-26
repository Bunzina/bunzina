import { User } from '@/domain/user/entities/user';
import { UserRole } from '@/domain/user/types/user-role';
import { makeDocument } from './make-document';
import { makeEmail } from './make-email';

export const makeUser = (override?: Partial<User>): User => {
  return new User({
    name: 'John Doe',
    document: makeDocument(),
    email: makeEmail(),
    passwordHash: 'hashed-password',
    role: UserRole.CUSTOMER,
    isActive: true,
    ...override,
  });
};
