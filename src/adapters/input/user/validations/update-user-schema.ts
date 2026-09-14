import { UserRole } from '@/domain/user/types/user-role';
import { cpfValidation } from '@/utils/validation-helpers/cpf';
import { emailValidation } from '@/utils/validation-helpers/email';
import { z } from 'zod';

export const updateUserSchema = z.object({
  id: z.uuid('Invalid user ID'),
  name: z.string().min(1, 'Name is required'),
  document: cpfValidation,
  email: emailValidation,
  role: z.enum(UserRole),
  isActive: z.boolean(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
