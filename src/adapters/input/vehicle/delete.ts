import type { DeleteVehicleUseCase } from '@/application/use-cases/vehicle/delete';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import {
  deleteVehicleSchema,
  type DeleteVehicleInput as DeleteVehicleInputType,
} from './validations/delete-vehicle-schema';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';

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
        status: 400,
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
        status: 204,
        data: null,
      });
    }, 'Failed to delete vehicle');
  }
}
