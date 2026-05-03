import type { NotificationWithoutChannel } from '../value-objects/notification';

export interface NotificationService {
  sendEmail(notification: NotificationWithoutChannel): Promise<void>;
  sendSms(notification: NotificationWithoutChannel): Promise<void>;
  sendPush(notification: NotificationWithoutChannel): Promise<void>;
}
