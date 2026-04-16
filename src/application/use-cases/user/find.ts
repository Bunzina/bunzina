import type { User } from '@/domain/user/entities/user';
import type { UserRepository } from '@/domain/user/repositories/user-repository';
import { NotFoundError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

interface Input {
  id: string;
}

export class FindUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({ id }: Input): Promise<User> {
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
      message: 'User found',
      data: { id },
    });

    return user;
  }
}
