import type { UserRepository } from '@/domain/user/repositories/user-repository';
import { UserRole } from '@/domain/user/types/user-role';
import { makeUser } from '@/test/factories/make-user';
import { mock, type MockProxy } from 'bun-mock-extended';
import { LoginUseCase } from './login';

describe('login use case', () => {
  let userRepository: MockProxy<UserRepository>;
  let loginUseCase: LoginUseCase;

  beforeEach(() => {
    userRepository = mock();
    loginUseCase = new LoginUseCase(userRepository);
  });

  test('should login successfully with valid credentials', async () => {
    const passwordHash = await Bun.password.hash('password123');
    const user = makeUser({ passwordHash, role: UserRole.ADMIN });

    userRepository.findByEmail
      .calledWith(user.email.value)
      .mockResolvedValue(user);

    const result = await loginUseCase.execute({
      email: user.email.value,
      password: 'password123',
    });

    expect(result.token).toBeDefined();
    expect(result.token.split('.')).toHaveLength(3);
  });

  test('should throw when user is not found', async () => {
    userRepository.findByEmail
      .calledWith('notfound@test.com')
      .mockResolvedValue(null);

    await expect(
      loginUseCase.execute({
        email: 'notfound@test.com',
        password: 'password123',
      }),
    ).rejects.toThrow('Invalid credentials');
  });

  test('should throw when user is inactive', async () => {
    const passwordHash = await Bun.password.hash('password123');
    const user = makeUser({ passwordHash, isActive: false });

    userRepository.findByEmail
      .calledWith(user.email.value)
      .mockResolvedValue(user);

    await expect(
      loginUseCase.execute({
        email: user.email.value,
        password: 'password123',
      }),
    ).rejects.toThrow('Invalid credentials');
  });

  test('should throw when password is invalid', async () => {
    const passwordHash = await Bun.password.hash('password123');
    const user = makeUser({ passwordHash });

    userRepository.findByEmail
      .calledWith(user.email.value)
      .mockResolvedValue(user);

    await expect(
      loginUseCase.execute({
        email: user.email.value,
        password: 'wrongpassword',
      }),
    ).rejects.toThrow('Invalid credentials');
  });
});
