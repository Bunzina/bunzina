import { LicensePlate } from '@/domain/vehicle/value-objects/license-plate';

export const makeLicensePlate = (override?: string): LicensePlate => {
  return new LicensePlate(override ?? 'ABC1D23');
};
