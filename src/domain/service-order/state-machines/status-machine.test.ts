import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import {
  determineStatusTransition,
  type StatusDirection,
} from './status-machine';

describe('service order status machine', () => {
  const cases: Array<
    [ServiceOrderStatus, StatusDirection, ServiceOrderStatus | undefined]
  > = [
    [ServiceOrderStatus.RECEIVED, 'next', ServiceOrderStatus.IN_DIAGNOSTIC],
    [
      ServiceOrderStatus.IN_DIAGNOSTIC,
      'next',
      ServiceOrderStatus.AWAITING_APPROVAL,
    ],
    [
      ServiceOrderStatus.AWAITING_APPROVAL,
      'next',
      ServiceOrderStatus.IN_EXECUTION,
    ],
    [ServiceOrderStatus.AWAITING_APPROVAL, 'back', ServiceOrderStatus.RECEIVED],
    [ServiceOrderStatus.IN_EXECUTION, 'next', ServiceOrderStatus.COMPLETED],
    [ServiceOrderStatus.COMPLETED, 'next', ServiceOrderStatus.DELIVERED],
    [ServiceOrderStatus.DELIVERED, 'next', undefined],
    [ServiceOrderStatus.RECEIVED, 'back', undefined],
    [ServiceOrderStatus.CANCELED, 'next', undefined],
    [ServiceOrderStatus.CANCELED, 'back', undefined],
  ];

  test.each(cases)(
    'should return %s when %s from %s',
    (currentStatus, direction, expected) => {
      const result = determineStatusTransition(currentStatus, direction);

      expect(result).toBe(expected);
    },
  );
});
