import type { UserRepository } from '@/domain/user/repositories/user-repository';
import { authenticationAttemptsTotal } from '@/infrastructure/observability/metrics';
import { signJwt } from '@/infrastructure/services/jwt';
import { UnauthorizedError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

interface Input {
  document: string;
  password: string;
}

interface Output {
  token: string;
}

export class LoginUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(input: Input): Promise<Output> {
    const user = await this.userRepository.findByDocument(input.document);

    if (!user) {
      authenticationAttemptsTotal.inc({ result: 'failure' });
      logger.warn({
        message: 'Login failed: user not found',
        data: { document: input.document },
      });

      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      authenticationAttemptsTotal.inc({ result: 'failure' });
      logger.warn({
        message: 'Login failed: user is inactive',
        data: { document: input.document },
      });

      throw new UnauthorizedError('Invalid credentials');
    }

    const passwordValid = await Bun.password.verify(
      input.password,
      user.passwordHash,
    );

    if (!passwordValid) {
      authenticationAttemptsTotal.inc({ result: 'failure' });
      logger.warn({
        message: 'Login failed: invalid password',
        data: { document: input.document },
      });

      throw new UnauthorizedError('Invalid credentials');
    }

    const token = await signJwt({
      sub: user.id!,
      document: user.document.value,
      email: user.email.value,
      role: user.role,
    });

    authenticationAttemptsTotal.inc({ result: 'success' });

    logger.info({
      message: 'Login successful',
      data: { document: input.document, role: user.role },
    });

    return { token };
  }
}
