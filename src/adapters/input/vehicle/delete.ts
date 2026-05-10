import type { DeleteVehicleUseCase } from '@/application/use-cases/vehicle/delete';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import {
  deleteVehicleSchema,
  type DeleteVehicleInput as DeleteVehicleInputType,
} from './validations/delete-vehicle-schema';

export class DeleteVehicleInput {
  constructor(private deleteVehicleUseCase: DeleteVehicleUseCase) {}

  async execute(context: Context): Promise<Response> {
    const { id } = context.params as { id: string };

    logger.info({
      message: 'Delete vehicle request',
      data: { id },
    });

    const { data, errors } = validateSchemaZod(deleteVehicleSchema, { id });

    if (errors?.length) {
      logger.warn({
        message: 'Delete vehicle validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      await this.deleteVehicleUseCase.execute(data as DeleteVehicleInputType);

      logger.info({
        message: 'Vehicle deleted successfully',
        data: { id },
      });

      return createResponse({
        status: StatusCodes.NO_CONTENT,
        data: null,
      });
    }, 'Failed to delete vehicle');
  }
}
