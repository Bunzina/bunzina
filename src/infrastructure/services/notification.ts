import { type NotificationService as INotificationService } from '@/domain/notification/services/notification';
import type { NotificationWithoutChannel } from '@/domain/notification/value-objects/notification';
import type { Transporter } from 'nodemailer';
import logger from '@lucas-pmelo/logger';
import { ServiceUnavailableError } from '@lucas-pmelo/handlers';

export class NotificationService implements INotificationService {
  constructor(
    private email: Transporter,
    private defaultEmail: string,
  ) {}
  async sendEmail(notification: NotificationWithoutChannel): Promise<void> {
    try {
      logger.debug({ message: 'Notification received', data: notification });

      const info = await this.email.sendMail({
        from: this.defaultEmail,
        to: notification.to,
        text: notification.message,
        subject: notification.subject,
      });

      logger.info({ message: 'Message sent', data: info.messageId });

      if (info.rejected.length > 0) {
        logger.warn({
          message: 'Some recipients were rejected',
          data: info.rejected,
        });
      }
    } catch (err) {
      switch (err.code) {
        case 'ECONNECTION':
          logger.warn('Connection failed');
          throw new ServiceUnavailableError('Service failed to connect');
        case 'ETIMEDOUT':
          logger.warn({
            message: 'Network error - retry later',
            data: err.message,
          });
          throw new ServiceUnavailableError('Service timed out');
        case 'EAUTH':
          logger.warn({
            message: 'Authentication failed',
            data: err.message,
          });
          throw new ServiceUnavailableError('Service failed to authenticate');
        case 'EENVELOPE':
          logger.warn({ message: 'Invalid recipients', data: err.rejected });
          throw new ServiceUnavailableError(
            'Service failed to valid recipients',
          );
        default:
          logger.warn({ message: 'Send failed', data: err.message });
          throw new ServiceUnavailableError('Service failed to send message');
      }
    }
  }

  async sendSms(notification: NotificationWithoutChannel): Promise<void> {
    throw new Error('Feature not ready yet');
  }

  async sendPush(notification: NotificationWithoutChannel): Promise<void> {
    throw new Error('Feature not ready yet');
  }
}
