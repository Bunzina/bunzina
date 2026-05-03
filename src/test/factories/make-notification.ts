import type { NotificationWithoutChannel } from '@/domain/notification/value-objects/notification';

export const makeNotification = (
  override?: Partial<NotificationWithoutChannel>,
): NotificationWithoutChannel => {
  return {
    message: 'Vehicle is ready for pickup',
    to: 'customer@bunzina.com',
    subject: 'Service update',
    ...override,
  };
};
