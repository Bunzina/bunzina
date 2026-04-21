import type { NotificationService } from '@/domain/notification/services/notification';
import { DeliveryChannel } from '@/domain/notification/types/delivery-channel';
import type { MockProxy } from 'bun-mock-extended';
import { mock as mockExtended } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test } from 'bun:test';

mock.module('@lucas-pmelo/logger', () => ({
  default: {
    setEvent: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  },
}));

import { SendNotificationUseCase } from './send';

describe('send notification use case', () => {
  let notificationService: MockProxy<NotificationService>;
  let sendNotificationUseCase: SendNotificationUseCase;

  beforeEach(() => {
    notificationService = mockExtended();
    sendNotificationUseCase = new SendNotificationUseCase(notificationService);
  });

  test('should send an email notification', async () => {
    const input = {
      deliveryChannel: DeliveryChannel.EMAIL,
      message: 'Your appointment is tomorrow',
      to: 'john@example.com',
      subject: 'Appointment reminder',
    };

    await sendNotificationUseCase.execute(input);

    expect(notificationService.sendEmail).toHaveBeenCalledWith({
      message: 'Your appointment is tomorrow',
      to: 'john@example.com',
      subject: 'Appointment reminder',
    });
    expect(notificationService.sendSms).not.toHaveBeenCalled();
    expect(notificationService.sendPush).not.toHaveBeenCalled();
  });

  test('should send an sms notification', async () => {
    const input = {
      deliveryChannel: DeliveryChannel.SMS,
      message: 'Code 123456',
      to: '+5511999999999',
      subject: undefined,
    };

    await sendNotificationUseCase.execute(input);

    expect(notificationService.sendSms).toHaveBeenCalledWith({
      message: 'Code 123456',
      to: '+5511999999999',
      subject: undefined,
    });
    expect(notificationService.sendEmail).not.toHaveBeenCalled();
    expect(notificationService.sendPush).not.toHaveBeenCalled();
  });

  test('should send a push notification', async () => {
    const input = {
      deliveryChannel: DeliveryChannel.PUSH,
      message: 'Your vehicle is ready for pickup',
      to: 'user-device-token',
      subject: undefined,
    };

    await sendNotificationUseCase.execute(input);

    expect(notificationService.sendPush).toHaveBeenCalledWith({
      message: 'Your vehicle is ready for pickup',
      to: 'user-device-token',
      subject: undefined,
    });
    expect(notificationService.sendEmail).not.toHaveBeenCalled();
    expect(notificationService.sendSms).not.toHaveBeenCalled();
  });
});
