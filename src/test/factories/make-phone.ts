import { Phone } from '@/domain/core/value-objects/phone';

export const makePhone = (override?: string): Phone => {
  return new Phone(override ?? '+1234567890');
};
