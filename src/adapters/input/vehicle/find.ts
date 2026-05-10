import { VehiclePresenter } from '@/adapters/output/vehicle/vehicle-presenter';
import type { FindVehicleByIdUseCase } from '@/application/use-cases/vehicle/find-by-id';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { HandlerContext } from '@/api/handler-context';
import { StatusCodes } from 'http-status-codes';
import { findVehicleSchema } from './validations/find-vehicle-schema';

export class FindVehicleByIdInput {
  constructor(private findVehicleByIdUseCase: FindVehicleByIdUseCase) {}

  async execute(context: HandlerContext): Promise<Response> {
    const { id } = context.params as { id: string };

    logger.info({
      message: 'Find vehicle request',
      data: { id },
    });

    const { errors } = validateSchemaZod(findVehicleSchema, { id });

    if (errors?.length) {
      logger.warn({
        message: 'Find vehicle validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const vehicle = await this.findVehicleByIdUseCase.execute({ id });

      logger.info({
        message: 'Vehicle found successfully',
        data: vehicle,
      });

      return createResponse({
        status: StatusCodes.OK,
        data: VehiclePresenter.toHttp(vehicle),
      });
    }, 'Failed to find vehicle');
  }
}
