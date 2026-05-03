import type { StockMovement } from '@/domain/auto-part/entities/stock-movement';
import type { AutoPartRepository } from '@/domain/auto-part/repositories/auto-part-repository';
import type { StockMovementRepository } from '@/domain/auto-part/repositories/stock-movement-repository';
import { NotFoundError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

interface Input {
  id: string;
  page: number;
  limit: number;
}

interface Output {
  data: StockMovement[];
}

export class ListStockMovementsUseCase {
  constructor(
    private autoPartRepository: AutoPartRepository,
    private stockMovementRepository: StockMovementRepository,
  ) {}

  async execute(input: Input): Promise<Output> {
    const autoPart = await this.autoPartRepository.findById(input.id);

    if (!autoPart) {
      const message = 'Auto part not found for stock movements';

      logger.warn({
        message,
        data: { id: input.id },
      });

      throw new NotFoundError(message);
    }

    logger.info({
      message: 'Listing stock movements by auto part',
      data: input,
    });

    const data = await this.stockMovementRepository.findByAutoPartId({
      autoPartId: input.id,
      page: input.page,
      limit: input.limit,
    });

    return {
      data,
    };
  }
}
