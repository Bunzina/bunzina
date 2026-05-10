import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { HandlerContext } from '@/api/handler-context';
import {
  sendNotificationSchema,
  type SendNotificationInferredInput,
} from './validations/send-schema';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import type { SendNotificationUseCase } from '@/application/use-cases/notification/send';

export class SendNotificationInput {
  constructor(private sendNotificationUseCase: SendNotificationUseCase) {}

  async execute(context: HandlerContext): Promise<Response> {
    const { body } = context;

    logger.info({
      message: 'Send notification request',
      data: body,
    });

    const { data, errors } = validateSchemaZod(sendNotificationSchema, body);

    if (errors?.length) {
      logger.warn({
        message: 'Send notification validation error',
        data: errors,
      });

      return createResponse({
        status: 400,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      await this.sendNotificationUseCase.execute(
        data as SendNotificationInferredInput,
      );

      logger.info('Notification sent successfully');

      return createResponse({
        status: 204,
        data: null,
      });
    }, 'Failed to send notification');
  }
}
