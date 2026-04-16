import { z } from 'zod';

export const licensePlateValidation = z
  .string()
  .min(1, 'License plate is required')
  .regex(
    /^[A-Z]{3}[0-9][A-Z][0-9]{2}$|^[A-Z]{3}[0-9]{4}$/,
    'Invalid license plate format (Mercosul: ABC1D23 or Classic: ABC1234)',
  )
  .transform((val) => val.toUpperCase());
