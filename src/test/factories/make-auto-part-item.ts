import { AutoPartItem } from '@/domain/service-order/entities/auto-part-item';
import { makePrice } from './make-price';

export const makeAutoPartItem = (
  override?: Partial<AutoPartItem>,
): AutoPartItem => {
  const unitPrice = makePrice(100);
  const totalPrice = makePrice(unitPrice.value * 2);

  return new AutoPartItem({
    autoPartId: 'auto-part-id',
    quantity: 2,
    unitPrice,
    totalPrice,
    ...override,
  } as unknown as AutoPartItem);
};
