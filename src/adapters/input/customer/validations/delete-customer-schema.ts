import { documentValidation } from '@/utils/validation-helpers/document';
import { z } from 'zod';

export const deleteCustomerSchema = z.object({
  documentNumber: documentValidation,
});

export type DeleteCustomerInput = z.infer<typeof deleteCustomerSchema>;
