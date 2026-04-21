import { beforeEach, describe, expect, mock, test } from 'bun:test';
import type { Context } from 'elysia';

const sendMailMock = mock(async () => ({
  messageId: 'message-1',
  rejected: [],
}));

mock.module('@/infrastructure/configs/email-transporter', () => ({
  DEFAULT_EMAIL: 'noreply@bunzina.com',
  emailTransporter: {
    sendMail: sendMailMock,
  },
}));

import { sendNotificationHandler } from './send';

describe('send notification handler', () => {
  beforeEach(() => {
    sendMailMock.mockClear();
    sendMailMock.mockResolvedValue({
      messageId: 'message-1',
      rejected: [],
    });
  });

  test('should return 204 when notification is sent', async () => {
    const context = {
      request: { method: 'POST', headers: new Headers() },
      body: {
        to: 'customer@bunzina.com',
        message: 'Your vehicle is ready',
        subject: 'Service update',
        deliveryChannel: 'EMAIL',
      },
    } as unknown as Context;

    const result = await sendNotificationHandler(context);

    expect(result?.status).toBe(204);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'noreply@bunzina.com',
      to: 'customer@bunzina.com',
      text: 'Your vehicle is ready',
      subject: 'Service update',
    });
  });

  test('should return 400 when request body is invalid', async () => {
    const context = {
      request: { method: 'POST', headers: new Headers() },
      body: {
        to: '',
        message: '',
        deliveryChannel: 'EMAIL',
      },
    } as unknown as Context;

    const result = await sendNotificationHandler(context);

    expect(result?.status).toBe(400);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  test('should return 500 when delivery channel is SMS', async () => {
    const context = {
      request: { method: 'POST', headers: new Headers() },
      body: {
        to: '+5511999999999',
        message: 'Your vehicle is ready',
        deliveryChannel: 'SMS',
      },
    } as unknown as Context;

    const result = await sendNotificationHandler(context);

    expect(result?.status).toBe(500);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  test('should return 500 when delivery channel is PUSH', async () => {
    const context = {
      request: { method: 'POST', headers: new Headers() },
      body: {
        to: 'device-token-1',
        message: 'Your vehicle is ready',
        deliveryChannel: 'PUSH',
      },
    } as unknown as Context;

    const result = await sendNotificationHandler(context);

    expect(result?.status).toBe(500);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
    expect(sendMailMock).not.toHaveBeenCalled();
  });
});
