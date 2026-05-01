import { VehiclePresenter } from '@/adapters/output/vehicle/vehicle-presenter';
import type { UpdateVehicleUseCase } from '@/application/use-cases/vehicle/update';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import {
  updateVehicleSchema,
  type UpdateVehicleInput as UpdateVehicleInputType,
} from './validations/update-vehicle-schema';

export class UpdateVehicleInput {
  constructor(private updateVehicleUseCase: UpdateVehicleUseCase) {}

  async execute(context: Context): Promise<Response> {
    const { id } = context.params as { id: string };
    const { body } = context;

    logger.info({
      message: 'Update vehicle request',
      data: { id, body },
    });

    const { data, errors } = validateSchemaZod(updateVehicleSchema, {
      id,
      ...(body as object),
    } as UpdateVehicleInputType);

    if (errors?.length) {
      logger.warn({
        message: 'Update vehicle validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const vehicle = await this.updateVehicleUseCase.execute(
        data as UpdateVehicleInputType,
      );

      logger.info({
        message: 'Vehicle updated successfully',
        data: vehicle,
      });

      return createResponse({
        status: StatusCodes.OK,
        data: VehiclePresenter.toHttp(vehicle),
      });
    }, 'Failed to update vehicle');
  }
}
