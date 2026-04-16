import type { UserRepository } from '@/domain/user/repositories/user-repository';
import { NotFoundError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

interface Input {
  id: string;
}

export class DeleteUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({ id }: Input): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      const message = 'User not found';

      logger.warn({
        message,
        data: { id },
      });

      throw new NotFoundError(message);
    }

    logger.debug({
      message: 'Deleting user',
      data: { id },
    });

    await this.userRepository.delete(id);
  }
}
