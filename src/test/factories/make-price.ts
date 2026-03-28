import { Price } from "@/domain/core/value-objects/price";

export const makePrice = (override?: string): Price => {
  return new Price(override ? parseFloat(override) : 100);
};
