import type { UserRepository } from '@/domain/user/repositories/user-repository';
import { UserRole } from '@/domain/user/types/user-role';
import { makeUser } from '@/test/factories/make-user';
import type { MockProxy } from 'bun-mock-extended';
import { mock } from 'bun-mock-extended';
import { UpdateUserUseCase } from './update';

describe('update user use case', () => {
  let userRepository: MockProxy<UserRepository>;
  let updateUserUseCase: UpdateUserUseCase;

  beforeEach(() => {
    userRepository = mock();
    updateUserUseCase = new UpdateUserUseCase(userRepository);
  });

  test('should update a user', async () => {
    const existingUser = makeUser();

    userRepository.findById
      .calledWith(existingUser.id!)
      .mockResolvedValue(existingUser);

    const input = {
      id: existingUser.id!,
      name: 'Jane Doe',
      document: '11144477735',
      email: 'jane@example.com',
      role: UserRole.ADMIN,
      isActive: false,
    };

    const result = await updateUserUseCase.execute(input);

    expect(result.name).toBe('Jane Doe');
    expect(result.document.value).toBe('11144477735');
    expect(result.email.value).toBe('jane@example.com');
    expect(result.role).toBe(UserRole.ADMIN);
    expect(result.isActive).toBe(false);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(userRepository.update).toHaveBeenCalledWith(result);
  });

  test('should throw NotFoundError if user does not exist', async () => {
    userRepository.findById
      .calledWith('non-existent-id')
      .mockResolvedValue(null);

    const input = {
      id: 'non-existent-id',
      name: 'Jane Doe',
      document: '11144477735',
      email: 'jane@example.com',
      role: UserRole.ADMIN,
      isActive: true,
    };

    await expect(updateUserUseCase.execute(input)).rejects.toThrow(
      'User not found',
    );
    expect(userRepository.findById).toHaveBeenCalledWith('non-existent-id');
    expect(userRepository.update).not.toHaveBeenCalled();
  });
});
