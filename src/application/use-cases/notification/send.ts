import type { NotificationService } from '@/domain/notification/services/notification';
import { DeliveryChannel } from '@/domain/notification/types/delivery-channel';
import {
  Notification,
  type NotificationWithoutChannel,
} from '@/domain/notification/value-objects/notification';

export class SendNotificationUseCase {
  deliveryChannelMap: Record<
    DeliveryChannel,
    (input: NotificationWithoutChannel) => Promise<void>
  > = {
    [DeliveryChannel.EMAIL]: (email: NotificationWithoutChannel) =>
      this.notificationService.sendEmail(email),
    [DeliveryChannel.SMS]: (sms: NotificationWithoutChannel) =>
      this.notificationService.sendSms(sms),
    [DeliveryChannel.PUSH]: (push: NotificationWithoutChannel) =>
      this.notificationService.sendPush(push),
  };

  constructor(private notificationService: NotificationService) {}

  async execute({
    deliveryChannel,
    message,
    to,
    subject,
  }: Notification): Promise<void> {
    await this.deliveryChannelMap[deliveryChannel]({
      message,
      to,
      subject,
    });
  }
}
