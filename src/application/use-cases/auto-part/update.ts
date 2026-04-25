import type { UpdateAutoPartHttpInput } from '@/adapters/input/auto-part/validations/update-auto-part-schema';
import { Price } from '@/domain/core/value-objects/price';
import { AutoPart } from '@/domain/auto-part/entities/auto-part';
import type { AutoPartRepository } from '@/domain/auto-part/repositories/auto-part-repository';
import { StockMovement } from '@/domain/auto-part/entities/stock-movement';
import type { StockMovementRepository } from '@/domain/auto-part/repositories/stock-movement-repository';
import { StockMovementType } from '@/domain/auto-part/types/stock-movement-type';
import { NotFoundError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

export class UpdateAutoPartUseCase {
  constructor(
    private autoPartRepository: AutoPartRepository,
    private stockMovementRepository: StockMovementRepository,
  ) {}

  async execute(input: UpdateAutoPartHttpInput): Promise<AutoPart> {
    const existingAutoPart = await this.autoPartRepository.findById(input.id);

    if (!existingAutoPart) {
      const message = 'Auto part not found for update';

      logger.warn({
        message,
        data: { id: input.id },
      });

      throw new NotFoundError(message);
    }

    logger.debug({
      message: 'Updating auto part',
      data: { input },
    });

    const updatedAutoPart = new AutoPart({
      id: existingAutoPart.id,
      name: input.name,
      description: input.description,
      price: new Price(input.price),
      stock: input.stock,
      createdAt: existingAutoPart.createdAt,
    });

    await this.autoPartRepository.update(updatedAutoPart);

    const stockDifference = input.stock - existingAutoPart.stock;

    if (stockDifference !== 0) {
      const stockMovement = new StockMovement({
        autoPartId: existingAutoPart.id!,
        quantity: Math.abs(stockDifference),
        type:
          stockDifference > 0 ? StockMovementType.IN : StockMovementType.OUT,
      });

      logger.debug({
        message: 'Creating stock movement for auto part update',
        data: { stockMovement },
      });

      await this.stockMovementRepository.create(stockMovement);
    }

    return updatedAutoPart;
  }
}
