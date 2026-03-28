import { Vehicle } from "@/domain/vehicle/entities/vehicle";
import { makeLicensePlate } from "./make-license-plate";

export const makeVehicle = (override?: Partial<Vehicle>): Vehicle => {
  return new Vehicle({
    id: "vehicle-id",
    licensePlate: makeLicensePlate(),
    model: "Model S",
    brand: "Tesla",
    year: 2020,
    customerId: "customer-id",
    ...override,
  });
};
