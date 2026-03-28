import { ServiceOrder } from "@/domain/service-order/entities/service-order";
import { ServiceOrderStatus } from "@/domain/service-order/types/service-order-status";
import { makeAutoPartItem } from "./make-auto-part-item";
import { makeQuote } from "./make-quote";
import { makeServiceItem } from "./make-service-item";

export const makeServiceOrder = (
  override?: Partial<ServiceOrder>,
): ServiceOrder => {
  return new ServiceOrder({
    customerId: "customer-123",
    vehicleId: "vehicle-123",
    status: ServiceOrderStatus.RECEIVED,
    serviceItems: [makeServiceItem()],
    autoPartItems: [makeAutoPartItem()],
    quote: makeQuote(),
    ...override,
  });
};
