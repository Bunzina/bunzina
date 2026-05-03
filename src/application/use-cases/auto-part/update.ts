import type { UpdateAutoPartHttpInput } from '@/adapters/input/auto-part/validations/update-auto-part-schema';
import { AutoPart } from '@/domain/auto-part/entities/auto-part';
import type { AutoPartRepository } from '@/domain/auto-part/repositories/auto-part-repository';
import { Price } from '@/domain/core/value-objects/price';
import { NotFoundError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import type { CreateStockMovementUseCase } from './create-stock-movement';

export class UpdateAutoPartUseCase {
  constructor(
    private autoPartRepository: AutoPartRepository,
    private createStockMovementUseCase: CreateStockMovementUseCase,
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

    if (input.stock !== existingAutoPart.stock) {
      await this.createStockMovementUseCase.execute({
        existingAutoPart,
        updatedAutoPart,
      });
    }

    return updatedAutoPart;
  }
}
