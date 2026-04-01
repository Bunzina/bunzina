import { z } from 'zod';
import { emailValidation } from '@/utils/validation-helpers/email';
import { phoneValidation } from '@/utils/validation-helpers/phone';
import { documentValidation } from '@/utils/validation-helpers/document';

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  document: documentValidation,
  email: emailValidation,
  phone: phoneValidation,
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    number: z.string().min(1, 'Number is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(1, 'ZipCode is required'),
    neighborhood: z.string().min(1, 'Neighborhood is required'),
    complement: z.string().optional(),
  }),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
