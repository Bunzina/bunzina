import { Email } from '@/domain/core/value-objects/email';
import type { User } from '@/domain/user/entities/user';
import type { UserRepository } from '@/domain/user/repositories/user-repository';
import type { UserRole } from '@/domain/user/types/user-role';
import { NotFoundError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

interface Input {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export class UpdateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(input: Input): Promise<User> {
    const user = await this.userRepository.findById(input.id);

    if (!user) {
      const message = 'User not found';

      logger.warn({
        message,
        data: { id: input.id },
      });

      throw new NotFoundError(message);
    }

    user.name = input.name;
    user.email = new Email(input.email);
    user.role = input.role;
    user.isActive = input.isActive;
    user.updatedAt = new Date();

    logger.debug({
      message: 'Updating user',
      data: { id: input.id },
    });

    await this.userRepository.update(user);

    return user;
  }
}
