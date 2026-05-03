import type { AutoPart } from '@/domain/auto-part/entities/auto-part';
import { StockMovement } from '@/domain/auto-part/entities/stock-movement';
import type { StockMovementRepository } from '@/domain/auto-part/repositories/stock-movement-repository';
import { StockMovementType } from '@/domain/auto-part/types/stock-movement-type';
import logger from '@lucas-pmelo/logger';

export interface CreateStockMovementInput {
  existingAutoPart: AutoPart;
  updatedAutoPart: AutoPart;
  serviceOrderId?: string;
}

export class CreateStockMovementUseCase {
  constructor(private stockMovementRepository: StockMovementRepository) {}

  async execute(
    input: CreateStockMovementInput,
  ): Promise<StockMovement | void> {
    const quantityDifference =
      input.updatedAutoPart.stock - input.existingAutoPart.stock;

    if (quantityDifference === 0) {
      logger.debug({
        message:
          'Skipping stock movement creation because stock did not change',
        data: input,
      });

      return;
    }

    const type =
      quantityDifference >= 0 ? StockMovementType.IN : StockMovementType.OUT;

    const stockMovement = new StockMovement({
      autoPartId: input.existingAutoPart.id!,
      quantity: quantityDifference,
      type,
      serviceOrderId: input.serviceOrderId,
    });

    logger.debug({
      message: 'Creating stock movement',
      data: { stockMovement },
    });

    await this.stockMovementRepository.create(stockMovement);

    return stockMovement;
  }
}
