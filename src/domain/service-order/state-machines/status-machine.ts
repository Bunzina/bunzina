import { ServiceOrderStatus } from '../types/service-order-status';

export type StatusDirection = 'next' | 'back';

const statusTransitionMap: Record<
  ServiceOrderStatus,
  Partial<Record<StatusDirection, ServiceOrderStatus>>
> = {
  [ServiceOrderStatus.RECEIVED]: {
    next: ServiceOrderStatus.IN_DIAGNOSTIC,
  },
  [ServiceOrderStatus.IN_DIAGNOSTIC]: {
    next: ServiceOrderStatus.AWAITING_APPROVAL,
  },
  [ServiceOrderStatus.AWAITING_APPROVAL]: {
    next: ServiceOrderStatus.IN_EXECUTION,
    back: ServiceOrderStatus.RECEIVED,
  },
  [ServiceOrderStatus.IN_EXECUTION]: {
    next: ServiceOrderStatus.COMPLETED,
  },
  [ServiceOrderStatus.COMPLETED]: {
    next: ServiceOrderStatus.DELIVERED,
  },
  [ServiceOrderStatus.DELIVERED]: {},
  [ServiceOrderStatus.CANCELED]: {},
};

export const determineStatusTransition = (
  currentStatus: ServiceOrderStatus,
  direction: StatusDirection,
): ServiceOrderStatus | undefined => {
  const transition = statusTransitionMap[currentStatus];

  return transition?.[direction];
};
