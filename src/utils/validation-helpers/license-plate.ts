import { z } from 'zod';

export const licensePlateValidation = z
  .string()
  .transform((val) => val.trim().toUpperCase())
  .refine(
    (val) => /^[A-Z]{3}[0-9][A-Z][0-9]{2}$|^[A-Z]{3}[0-9]{4}$/.test(val),
    'Invalid license plate format (Mercosul: ABC1D23 or Classic: ABC1234)',
  );
