import { isValidPhone } from '@lucas-pmelo/fast-validators';
import { z } from 'zod';

export const phoneValidation = z
  .string()
  .refine((value) => isValidPhone(value), 'Invalid phone number format');
