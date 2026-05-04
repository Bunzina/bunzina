import type { CreateServiceOrderInput } from '@/adapters/input/service-order/validations/create-service-order-schema';

export const makeServiceOrderInput = (
  override?: Partial<CreateServiceOrderInput>,
): CreateServiceOrderInput => {
  return {
    customerId: '11111111-1111-4111-8111-111111111111',
    vehicleId: '22222222-2222-4222-8222-222222222222',
    serviceItems: [
      {
        serviceId: '33333333-3333-4333-8333-333333333333',
        price: 200,
        description: 'Oil change service',
      },
    ],
    autoPartItems: [
      {
        autoPartId: '55555555-5555-4555-8555-555555555555',
        quantity: 2,
        unitPrice: 50,
        description: 'Oil filter',
      },
    ],
    ...override,
  };
};
