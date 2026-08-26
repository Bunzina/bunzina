import { isValidCPF } from '@lucas-pmelo/fast-validators';
import { z } from 'zod';

function clean(value: string) {
  return value.replace(/\D/g, '');
}

export const cpfValidation = z
  .string()
  .transform((value) => clean(value))
  .refine((value) => value.length === 11 && isValidCPF(value), 'Invalid CPF');
