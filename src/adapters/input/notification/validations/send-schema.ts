import { DeliveryChannel } from '@/domain/notification/types/delivery-channel';
import { z } from 'zod';

export const sendNotificationSchema = z.object({
  to: z.string().min(1, 'Destination is required'),
  message: z.string().min(1, 'Message is required'),
  subject: z.string().optional(),
  deliveryChannel: z.enum(DeliveryChannel),
});

export type SendNotificationInferredInput = z.infer<
  typeof sendNotificationSchema
>;
