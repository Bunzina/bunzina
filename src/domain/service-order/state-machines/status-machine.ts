import type { ServiceOrderStatus } from '../types/service-order-status';

export const determineNextStatus = (
  currentStatus: ServiceOrderStatus,
  receivedStatus: ServiceOrderStatus,
): ServiceOrderStatus => {
  const nextStatus = {
    RECEIVED: {
      IN_DIAGNOSTIC: 'IN_DIAGNOSTIC',
      CANCELED: 'CANCELED',
    },
    IN_DIAGNOSTIC: {
      AWAITING_APPROVAL: 'AWAITING_APPROVAL',
      CANCELED: 'CANCELED',
    },
    AWAITING_APPROVAL: {
      IN_EXECUTION: 'IN_EXECUTION',
      RECEIVED: 'RECEIVED',
      CANCELED: 'CANCELED',
    },
    IN_EXECUTION: {
      COMPLETED: 'COMPLETED',
    },
    COMPLETED: {
      DELIVERED: 'DELIVERED',
    },
    DELIVERED: {},
    CANCELED: {},
  };

  const fromMap = (nextStatus as Record<string, Record<string, string>>)[
    currentStatus as unknown as string
  ];

  const candidate = fromMap ? fromMap[receivedStatus as unknown as string] : undefined;

  return (candidate as unknown as ServiceOrderStatus) ?? currentStatus;
};
