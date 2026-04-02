import { z } from 'zod';

export const emailValidation = z.string().email('Invalid email address').toLowerCase();
