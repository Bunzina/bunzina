import { Email } from '@/domain/core/value-objects/email';

export const makeEmail = (override?: string): Email => {
  return new Email(override ?? 'lucas.coda.fofo@gmail.com');
};
