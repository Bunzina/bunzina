import { isValidEmail } from '@lucas-pmelo/fast-validators';
import { z } from 'zod';

export const emailValidation = z
  .string()
  .toLowerCase()
  .refine((value) => isValidEmail(value), 'Invalid email address');
