import { SendNotificationInput } from '@/adapters/input/notification/send';
import { SendNotificationUseCase } from '@/application/use-cases/notification/send';
import {
  DEFAULT_EMAIL,
  emailTransporter,
} from '@/infrastructure/configs/email-transporter';
import { NotificationService } from '@/infrastructure/services/notification';
import logger from '@lucas-pmelo/logger';
import type { Context } from 'elysia';

let notificationService: NotificationService;
let sendNotificationUseCase: SendNotificationUseCase;
let sendNotificationInput: SendNotificationInput;

const setDependencies = () => {
  notificationService = new NotificationService(
    emailTransporter,
    DEFAULT_EMAIL,
  );

  sendNotificationUseCase = new SendNotificationUseCase(notificationService);

  sendNotificationInput = new SendNotificationInput(sendNotificationUseCase);
};

export const sendNotificationHandler = async (
  context: Context,
): Promise<Response | undefined> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await sendNotificationInput.execute(context);
};
