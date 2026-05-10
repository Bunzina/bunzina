import { VehiclesListPresenter } from '@/adapters/output/vehicle/vehicles-list-presenter';
import type { ListVehiclesUseCase } from '@/application/use-cases/vehicle/list';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import {
  listVehicleSchema,
  type ListVehiclesInput as ListVehiclesInputType,
} from './validations/list-vehicle-schema';

export class ListVehiclesInput {
  constructor(private listVehiclesUseCase: ListVehiclesUseCase) {}

  async execute(context: Context): Promise<Response> {
    const query = context.query as Record<string, unknown>;

    logger.info({
      message: 'List vehicles request',
      data: query,
    });

    const { data, errors } = validateSchemaZod(listVehicleSchema, query);

    if (errors?.length) {
      logger.warn({
        message: 'List vehicles validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const result = await this.listVehiclesUseCase.execute(
        data! as ListVehiclesInputType,
      );

      logger.info({
        message: 'Vehicles listed successfully',
        data: {
          count: result.data.length,
        },
      });

      const response = VehiclesListPresenter.toHttp(
        result.data,
        (data! as ListVehiclesInputType).page,
        (data! as ListVehiclesInputType).limit,
      );

      return createResponse({
        status: StatusCodes.OK,
        data: response,
      });
    }, 'Failed to list vehicles');
  }
}
