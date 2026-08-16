import { ServiceOrderPublicPresenter } from '@/adapters/output/service-order/service-order-public-presenter';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { HandlerContext } from '@/api/handler-context';
import { StatusCodes } from 'http-status-codes';
import type { ValidateQuoteConfirmationUseCase } from '@/application/use-cases/service-order/validate-quote-confirmation';
import { Document } from '@/domain/core/value-objects/document';
import { validateQuoteConfirmationSchema } from './validations/validate-quote-confirmation-schema';

export class ValidateQuoteConfirmationInput {
  constructor(
    private validateQuoteConfirmationUseCase: ValidateQuoteConfirmationUseCase,
  ) {}

  async execute(context: HandlerContext): Promise<Response> {
    const { id } = context.params as { id: string };
    const { documentNumber, isConfirmed } = context.body as {
      documentNumber: string;
      isConfirmed: boolean | string;
    };
    const normalizedIsConfirmed =
      isConfirmed === 'true'
        ? true
        : isConfirmed === 'false'
          ? false
          : isConfirmed;

    logger.info({
      message: 'Validate confirmation quote request',
      data: { documentNumber },
    });

    const { errors, data } = validateSchemaZod(
      validateQuoteConfirmationSchema,
      {
        id,
        documentNumber,
        isConfirmed: normalizedIsConfirmed,
      },
    );

    if (errors?.length) {
      logger.warn({
        message: 'Validate confirmation quote validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const serviceOrder = await this.validateQuoteConfirmationUseCase.execute({
        customerRequesterDocument: new Document(data!.documentNumber),
        id: data!.id,
        isConfirmed: data!.isConfirmed,
      });

      logger.info({
        message: 'Service orders quote validate successfully',
        data: { serviceOrder },
      });

      return createResponse({
        status: StatusCodes.OK,
        data: ServiceOrderPublicPresenter.toHttp(serviceOrder),
      });
    }, 'Failed to validate service order quote');
  }
}
