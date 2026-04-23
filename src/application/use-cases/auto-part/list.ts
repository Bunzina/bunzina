import type { AutoPart } from '@/domain/auto-part/entities/auto-part';
import type { AutoPartRepository } from '@/domain/auto-part/repositories/auto-part-repository';
import logger from '@lucas-pmelo/logger';

interface Input {
  page: number;
  limit: number;
  filters?: {
    name?: string;
  };
}

interface Output {
  data: AutoPart[];
}

export class ListAutoPartsUseCase {
  constructor(private autoPartRepository: AutoPartRepository) {}

  async execute(input: Input): Promise<Output> {
    logger.info({
      message: 'Listing auto parts',
      data: input,
    });

    const data = await this.autoPartRepository.findByParams(input);

    return {
      data,
    };
  }
}
