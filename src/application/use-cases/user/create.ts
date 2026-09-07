import { Document } from '@/domain/core/value-objects/document';
import { Email } from '@/domain/core/value-objects/email';
import { User } from '@/domain/user/entities/user';
import type { UserRepository } from '@/domain/user/repositories/user-repository';
import type { UserRole } from '@/domain/user/types/user-role';
import { ConflictError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

interface Input {
  name: string;
  document: string;
  email: string;
  password: string;
  role: UserRole;
}

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(input: Input): Promise<User> {
    const persistedUser = await this.userRepository.findByEmail(input.email);

    if (persistedUser) {
      const message = 'User already exists';

      logger.warn({
        message,
        data: { email: input.email },
      });

      throw new ConflictError(message);
    }

    const persistedUserByDocument = await this.userRepository.findByDocument(
      input.document,
    );

    if (persistedUserByDocument) {
      const message = 'User already exists';

      logger.warn({
        message,
        data: { document: input.document },
      });

      throw new ConflictError(message);
    }

    const document = new Document(input.document);
    const email = new Email(input.email);
    const passwordHash = await Bun.password.hash(input.password);

    const user = new User({
      name: input.name,
      document,
      email,
      passwordHash,
      role: input.role,
      isActive: true,
    });

    logger.debug({
      message: 'Creating user',
      data: {
        id: user.id,
        document: input.document,
        email: input.email,
        role: input.role,
      },
    });

    await this.userRepository.create(user);

    return user;
  }
}
