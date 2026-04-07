import { documentValidation } from '@/utils/validation-helpers/document';
import { z } from 'zod';

export const findCustomerSchema = z.object({
  documentNumber: documentValidation,
});

export type CreateCustomerInput = z.infer<typeof findCustomerSchema>;
