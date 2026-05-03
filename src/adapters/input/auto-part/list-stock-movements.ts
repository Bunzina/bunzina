import { StockMovementsListPresenter } from '@/adapters/output/auto-part/stock-movements-list-presenter';
import type { ListStockMovementsUseCase } from '@/application/use-cases/auto-part/list-stock-movements';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import {
  listStockMovementsSchema,
  type ListStockMovementsInput as ListStockMovementsInputType,
} from './validations/list-stock-movements-schema';

export class ListStockMovementsInput {
  constructor(private listStockMovementsUseCase: ListStockMovementsUseCase) {}

  async execute(context: Context): Promise<Response> {
    const query = context.query as Record<string, unknown>;
    const { id } = context.params as { id: string };

    logger.info({
      message: 'List stock movements request',
      data: { id, ...query },
    });

    const { data, errors } = validateSchemaZod(listStockMovementsSchema, {
      ...query,
      id,
    } as ListStockMovementsInputType);

    if (errors?.length) {
      logger.warn({
        message: 'List stock movements validation error',
        data: errors,
      });

      return createResponse({
        status: 400,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const result = await this.listStockMovementsUseCase.execute(
        data! as ListStockMovementsInputType,
      );

      logger.info({
        message: 'Stock movements listed successfully',
        data: {
          count: result.data.length,
          autoPartId: id,
        },
      });

      return createResponse({
        status: 200,
        data: StockMovementsListPresenter.toHttp(
          result.data,
          (data! as ListStockMovementsInputType).page,
          (data! as ListStockMovementsInputType).limit,
        ),
      });
    }, 'Failed to list stock movements');
  }
}
