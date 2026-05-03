import { AutoPart } from '@/domain/auto-part/entities/auto-part';
import { StockMovement } from '@/domain/auto-part/entities/stock-movement';
import type { AutoPartRepository } from '@/domain/auto-part/repositories/auto-part-repository';
import type { StockMovementRepository } from '@/domain/auto-part/repositories/stock-movement-repository';
import type { StockMovementType } from '@/domain/auto-part/types/stock-movement-type';
import { BadRequestError, NotFoundError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

export interface RegisterStockMovementInput {
  id: string;
  quantity: number;
  type: StockMovementType;
}

export class RegisterStockMovementUseCase {
  constructor(
    private autoPartRepository: AutoPartRepository,
    private stockMovementRepository: StockMovementRepository,
  ) {}

  async execute(input: RegisterStockMovementInput): Promise<AutoPart> {
    const autoPart = await this.autoPartRepository.findById(input.id);

    if (!autoPart) {
      const message = 'Auto part not found for stock movement';

      logger.warn({
        message,
        data: { id: input.id },
      });

      throw new NotFoundError(message);
    }

    const newStock =
      input.type === 'IN'
        ? autoPart.stock + input.quantity
        : autoPart.stock - input.quantity;

    if (newStock < 0) {
      const message = 'Stock cannot be negative';

      logger.warn({
        message,
        data: {
          id: input.id,
          currentStock: autoPart.stock,
          quantity: input.quantity,
          type: input.type,
        },
      });

      throw new BadRequestError(message);
    }

    const updatedAutoPart = new AutoPart({
      id: autoPart.id,
      name: autoPart.name,
      description: autoPart.description,
      price: autoPart.price,
      stock: newStock,
      createdAt: autoPart.createdAt,
    });

    logger.debug({
      message: 'Registering stock movement',
      data: {
        autoPartId: input.id,
        quantity: input.quantity,
        type: input.type,
        previousStock: autoPart.stock,
        newStock,
      },
    });

    await this.autoPartRepository.update(updatedAutoPart);

    const stockMovement = new StockMovement({
      autoPartId: autoPart.id!,
      quantity: input.quantity,
      type: input.type,
    });

    await this.stockMovementRepository.create(stockMovement);

    return updatedAutoPart;
  }
}
