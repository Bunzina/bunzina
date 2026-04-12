import type { UserRepository } from '@/domain/user/repositories/user-repository';
import { UserRole } from '@/domain/user/types/user-role';
import { makeEmail } from '@/test/factories/make-email';
import { makeUser } from '@/test/factories/make-user';
import type { MockProxy } from 'bun-mock-extended';
import { mock } from 'bun-mock-extended';
import { CreateUserUseCase } from './create';

describe('create user use case', () => {
  let userRepository: MockProxy<UserRepository>;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    userRepository = mock();
    createUserUseCase = new CreateUserUseCase(userRepository);
  });

  test('should create a user', async () => {
    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: UserRole.MECHANIC,
    };

    const result = await createUserUseCase.execute(input);

    expect(result).toMatchObject({
      name: 'John Doe',
      email: { value: 'john@example.com' },
      role: UserRole.MECHANIC,
      isActive: true,
      id: expect.any(String),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
    expect(result.passwordHash).toBeDefined();
    expect(result.passwordHash).not.toBe('password123');
    expect(userRepository.create).toHaveBeenCalledWith(result);
  });

  test('should throw ConflictError if user already exists', async () => {
    const existingUser = makeUser({
      email: makeEmail('john@example.com'),
    });

    userRepository.findByEmail
      .calledWith('john@example.com')
      .mockResolvedValue(existingUser);

    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: UserRole.MECHANIC,
    };

    await expect(createUserUseCase.execute(input)).rejects.toThrow(
      'User already exists',
    );
    expect(userRepository.create).not.toHaveBeenCalled();
  });
});
