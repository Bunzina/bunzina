import type { DeliveryChannel } from '../types/delivery-channel';

export class Notification {
  message: string;
  to: string;
  deliveryChannel: DeliveryChannel;
  subject?: string;

  constructor(input: Notification) {
    Object.assign(this, input);
  }
}

export type NotificationWithoutChannel = Omit<Notification, 'deliveryChannel'>;
