import type { SendNotificationUseCase } from '@/application/use-cases/notification/send';
import { DeliveryChannel } from '@/domain/notification/types/delivery-channel';
import { any, mock as mockExtended, type MockProxy } from 'bun-mock-extended';
import { beforeEach, describe, expect, test } from 'bun:test';
import type { Context } from 'elysia';
import { SendNotificationInput } from './send';

describe('send notification input', () => {
  let sendNotificationUseCase: MockProxy<SendNotificationUseCase>;
  let sendNotificationInput: SendNotificationInput;

  beforeEach(() => {
    sendNotificationUseCase = mockExtended();
    sendNotificationInput = new SendNotificationInput(sendNotificationUseCase);
  });

  test('should return 204 when notification is sent', async () => {
    sendNotificationUseCase.execute.calledWith(any()).mockResolvedValue();

    const request = {
      body: {
        to: 'customer@bunzina.com',
        message: 'Your vehicle is ready',
        subject: 'Service update',
        deliveryChannel: DeliveryChannel.EMAIL,
      },
    } as Context;

    const result = await sendNotificationInput.execute(request);

    expect(result?.status).toBe(204);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
    expect(sendNotificationUseCase.execute).toHaveBeenCalledWith({
      to: 'customer@bunzina.com',
      message: 'Your vehicle is ready',
      subject: 'Service update',
      deliveryChannel: DeliveryChannel.EMAIL,
    });
  });

  test('should return 400 when request body is invalid', async () => {
    const request = {
      body: {
        to: '',
        message: '',
        deliveryChannel: DeliveryChannel.EMAIL,
      },
    } as Context;

    const result = await sendNotificationInput.execute(request);

    expect(result?.status).toBe(400);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
    expect(sendNotificationUseCase.execute).not.toHaveBeenCalled();
  });

  test('should return 500 when use case throws', async () => {
    sendNotificationUseCase.execute
      .calledWith(any())
      .mockRejectedValue(new Error('unexpected error'));

    const request = {
      body: {
        to: 'customer@bunzina.com',
        message: 'Your vehicle is ready',
        deliveryChannel: DeliveryChannel.EMAIL,
      },
    } as Context;

    const result = await sendNotificationInput.execute(request);

    expect(result?.status).toBe(500);
    expect(await result?.json()).toEqual({
      error: 'Failed to send notification',
    });
  });
});
