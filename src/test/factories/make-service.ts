import { Service } from "@/domain/service/entities/service";
import { makePrice } from "./make-price";

export const makeService = (override?: Partial<Service>): Service => {
  return new Service({
    name: "Oil Change",
    description: "Complete oil change service",
    price: makePrice(),
    durationInMinutes: 60,
    isActive: true,
    ...override,
  });
};
