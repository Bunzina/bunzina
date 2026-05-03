import { ServiceUnavailableError } from '@lucas-pmelo/handlers';
import { makeNotification } from '@/test/factories/make-notification';
import type { Transporter } from 'nodemailer';
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

import { NotificationService } from './notification';

type MailInfo = {
  messageId: string;
  rejected: string[];
};

const makeMailInfo = (input?: Partial<MailInfo>): MailInfo => ({
  messageId: input?.messageId ?? 'mail-id-1',
  rejected: input?.rejected ?? [],
});

describe('notification infrastructure service', () => {
  let service: NotificationService;
  let sendMailMock: ReturnType<typeof mock>;

  beforeEach(() => {
    sendMailMock = mock(async () => makeMailInfo());
    service = new NotificationService(
      {
        sendMail: sendMailMock,
      } as unknown as Transporter,
      'email',
    );
  });

  test('should send email', async () => {
    const notification = makeNotification();

    await service.sendEmail(notification);

    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'email',
      to: notification.to,
      text: notification.message,
      subject: notification.subject,
    });
  });

  test('should resolve when some recipients are rejected', async () => {
    sendMailMock.mockResolvedValue(
      makeMailInfo({ rejected: ['invalid@bunzina.com'] }),
    );

    await expect(
      service.sendEmail(makeNotification()),
    ).resolves.toBeUndefined();
  });

  test('should map ECONNECTION to ServiceUnavailableError', async () => {
    sendMailMock.mockRejectedValue({ code: 'ECONNECTION', message: 'failure' });

    await expect(service.sendEmail(makeNotification())).rejects.toThrow(
      'Service failed to connect',
    );
  });

  test('should map ETIMEDOUT to ServiceUnavailableError', async () => {
    sendMailMock.mockRejectedValue({ code: 'ETIMEDOUT', message: 'timeout' });

    await expect(service.sendEmail(makeNotification())).rejects.toThrow(
      'Service timed out',
    );
  });

  test('should map EAUTH to ServiceUnavailableError', async () => {
    sendMailMock.mockRejectedValue({ code: 'EAUTH', message: 'auth failed' });

    await expect(service.sendEmail(makeNotification())).rejects.toThrow(
      'Service failed to authenticate',
    );
  });

  test('should map EENVELOPE to ServiceUnavailableError', async () => {
    sendMailMock.mockRejectedValue({
      code: 'EENVELOPE',
      message: 'invalid envelope',
      rejected: ['bad@bunzina.com'],
    });

    await expect(service.sendEmail(makeNotification())).rejects.toThrow(
      'Service failed to valid recipients',
    );
  });

  test('should map unknown errors to ServiceUnavailableError', async () => {
    sendMailMock.mockRejectedValue({ code: 'EUNKNOWN', message: 'unknown' });

    await expect(service.sendEmail(makeNotification())).rejects.toThrow(
      'Service failed to send message',
    );
  });

  test('should throw not ready error for sms', async () => {
    await expect(service.sendSms(makeNotification())).rejects.toThrow(
      'Feature not ready yet',
    );
  });

  test('should throw not ready error for push', async () => {
    await expect(service.sendPush(makeNotification())).rejects.toThrow(
      'Feature not ready yet',
    );
  });

  test('should throw ServiceUnavailableError on sendEmail failures', async () => {
    sendMailMock.mockRejectedValue({ code: 'EUNKNOWN', message: 'unknown' });

    await service.sendEmail(makeNotification()).catch((error) => {
      expect(error).toBeInstanceOf(ServiceUnavailableError);
    });
  });
});
