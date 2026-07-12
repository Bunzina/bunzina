import { documentValidation } from '@/utils/validation-helpers/document';
import { z } from 'zod';

export const validateQuoteConfirmationSchema = z.object({
  documentNumber: documentValidation,
  id: z.uuid('Service order ID must be a valid UUID'),
  isConfirmed: z.boolean(),
});

export type ValidateQuoteConfirmationInput = z.infer<
  typeof validateQuoteConfirmationSchema
>;
