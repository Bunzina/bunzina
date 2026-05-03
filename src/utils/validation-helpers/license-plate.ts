import { isValidPlate } from '@lucas-pmelo/fast-validators';
import { z } from 'zod';

export const licensePlateValidation = z
  .string()
  .transform((val) => val.trim().toUpperCase())
  .refine(
    (val) => isValidPlate(val),
    'Invalid license plate format (Mercosul: ABC1D23 or Classic: ABC1234)',
  );
