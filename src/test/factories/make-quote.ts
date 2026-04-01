import { Quote } from '@/domain/service-order/value-objects/quote';

export const makeQuote = (override?: Partial<Quote>): Quote => {
  return new Quote({
    servicesTotal: 300,
    autoPartsTotal: 200,
    ...override,
  });
};
