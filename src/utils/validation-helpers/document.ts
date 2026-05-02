import { isValidCNPJ, isValidCPF } from '@lucas-pmelo/fast-validators';
import { z } from 'zod';

function clean(value: string) {
  return value.replace(/\D/g, '');
}

export const documentValidation = z
  .string()
  .transform((value) => clean(value))
  .refine((value) => {
    if (value.length === 11) return isValidCPF(value);
    if (value.length === 14) return isValidCNPJ(value);
    return false;
  }, 'Invalid document number (CPF or CNPJ)');
