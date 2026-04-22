import type { AutoPart } from '@/domain/auto-part/entities/auto-part';
import type { AutoPartRepository } from '@/domain/auto-part/repositories/auto-part-repository';
import { NotFoundError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

interface Input {
  id: string;
}

export class FindAutoPartByIdUseCase {
  constructor(private autoPartRepository: AutoPartRepository) {}

  async execute({ id }: Input): Promise<AutoPart> {
    const autoPart = await this.autoPartRepository.findById(id);

    if (!autoPart) {
      const message = 'Auto part not found';

      logger.warn({
        message,
        data: {
          id,
        },
      });

      throw new NotFoundError(message);
    }

    return autoPart;
  }
}
