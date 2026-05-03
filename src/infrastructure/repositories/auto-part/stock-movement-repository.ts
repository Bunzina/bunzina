import type { SQL } from 'bun';
import { StockMovement } from '@/domain/auto-part/entities/stock-movement';
import type {
  FindStockMovementsByAutoPartIdParams,
  StockMovementRepository as IStockMovementRepository,
} from '@/domain/auto-part/repositories/stock-movement-repository';
import logger from '@lucas-pmelo/logger';
import type { StockMovementDbSchema } from './dtos/stock-movement-db-schema';
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

  async findByAutoPartId(
    params: FindStockMovementsByAutoPartIdParams,
  ): Promise<StockMovement[]> {
    const offset = (params.page - 1) * params.limit;

    logger.debug({
      message: 'Finding stock movements by auto part ID',
      data: params,
    });

    const records = await this.client<StockMovementDbSchema[]>`
      SELECT *
      FROM bunzina.stock_movements
      WHERE auto_part_id = ${params.autoPartId}
      ORDER BY created_at DESC
      LIMIT ${params.limit}
      OFFSET ${offset}
    `;

    return records.map((record: StockMovementDbSchema) =>
      StockMovementMapper.toDomain(record),
    );
  }
}
