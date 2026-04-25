import type { SQL } from 'bun';
import { StockMovement } from '@/domain/auto-part/entities/stock-movement';
import type { StockMovementRepository as IStockMovementRepository } from '@/domain/auto-part/repositories/stock-movement-repository';
import logger from '@lucas-pmelo/logger';
import { StockMovementMapper } from './mappers/stock-movement-mapper';

export class StockMovementRepository implements IStockMovementRepository {
  constructor(private client: SQL) {}

  async create(stockMovement: StockMovement): Promise<StockMovement> {
    const recordToSave = StockMovementMapper.toDatabase(stockMovement);

    logger.debug({
      message: 'Saving stock movement to database',
      data: recordToSave,
    });

    await this.client`
      INSERT INTO bunzina.stock_movements ${this.client(recordToSave)}
    `;

    return stockMovement;
  }
}
