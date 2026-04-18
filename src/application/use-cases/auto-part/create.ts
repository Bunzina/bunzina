import { Price } from '@/domain/core/value-objects/price';
import { AutoPart } from '@/domain/auto-part/entities/auto-part';
import type { AutoPartRepository } from '@/domain/auto-part/repositories/auto-part-repository';
import { ConflictError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

interface Input {
  name: string;
  description: string;
  price: number;
  stock: number;
}

export class CreateAutoPartUseCase {
  constructor(private autoPartRepository: AutoPartRepository) {}

  async execute(input: Input): Promise<AutoPart> {
    const persistedAutoPart = await this.autoPartRepository.findByName(input.name);

    if (persistedAutoPart) {
      const message = 'Auto-part already exists';

      logger.warn({
        message,
        data: {
          name: input.name,
        },
      });

      throw new ConflictError(message);
    }

    const price = new Price(input.price);

    const autoPart = new AutoPart({
      name: input.name,
      description: input.description,
      price,
      stock: input.stock,
    });

    await this.autoPartRepository.create(autoPart);

    return autoPart;
  }
}
