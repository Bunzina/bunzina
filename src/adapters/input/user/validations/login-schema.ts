import { emailValidation } from '@/utils/validation-helpers/email';
import { z } from 'zod';

export const loginSchema = z.object({
  email: emailValidation,
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
