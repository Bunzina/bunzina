import { Price } from "@/domain/core/value-objects/price";

export const makePrice = (override?: number): Price => {
  return new Price(override ?? 100);
};
