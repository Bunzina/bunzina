import { VehiclePresenter } from '@/adapters/output/vehicle/vehicle-presenter';
import type { CreateVehicleUseCase } from '@/application/use-cases/vehicle/create';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import {
  createVehicleSchema,
  type CreateVehicleInput as CreateVehicleInputType,
} from './validations/create-vehicle-schema';

export class CreateVehicleInput {
  constructor(private createVehicleUseCase: CreateVehicleUseCase) {}

  async execute(context: Context): Promise<Response | undefined> {
    const { body } = context;

    logger.info({
      message: 'Create vehicle request',
      data: body,
    });

    const { data, errors } = validateSchemaZod(createVehicleSchema, body);

    if (errors?.length) {
      logger.warn({
        message: 'Create vehicle validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const vehicle = await this.createVehicleUseCase.execute(
        data as CreateVehicleInputType,
      );

      logger.info({
        message: 'Vehicle created successfully',
        data: vehicle,
      });

      return createResponse({
        status: StatusCodes.CREATED,
        data: VehiclePresenter.toHttp(vehicle),
      });
    }, 'Failed to create vehicle');
  }
}
