import type { DeleteAutoPartInput } from '@/adapters/input/auto-part/validations/delete-auto-part-schema';
import type { AutoPartRepository } from '@/domain/auto-part/repositories/auto-part-repository';
import { NotFoundError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

export class DeleteAutoPartUseCase {
  constructor(private autoPartRepository: AutoPartRepository) {}

  async execute({ id }: DeleteAutoPartInput): Promise<void> {
    const autoPart = await this.autoPartRepository.findById(id);

    if (!autoPart) {
      const message = 'Auto part not found';

      logger.warn({
        message,
        autoPartId: id,
      });

      throw new NotFoundError(message);
    }

    logger.debug({
      message: 'Soft deleting auto part',
      autoPartId: id,
    });

    await this.autoPartRepository.delete(id);
  }
}
