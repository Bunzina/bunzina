import { AutoPartItem } from "@/domain/service-order/entities/auto-part-item";

export const makeAutoPartItem = (
  override?: Partial<AutoPartItem>,
): AutoPartItem => {
  return new AutoPartItem({
    autoPartId: "auto-part-id",
    quantity: 2,
    price: 100,
    ...override,
  } as unknown as AutoPartItem);
};
