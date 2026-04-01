import { ServiceItem } from '@/domain/service-order/entities/service-item';
import { makePrice } from './make-price';

export const makeServiceItem = (override?: Partial<ServiceItem>): ServiceItem => {
  return new ServiceItem({
    serviceId: 'service-id',
    description: 'Complete oil change service for your vehicle.',
    price: makePrice(),
    ...override,
  } as unknown as ServiceItem);
};
