import { UserRole } from '@/domain/user/types/user-role';
import { emailValidation } from '@/utils/validation-helpers/email';
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: emailValidation,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(UserRole),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
