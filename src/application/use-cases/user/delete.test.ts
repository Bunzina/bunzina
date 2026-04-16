import type { UserRepository } from '@/domain/user/repositories/user-repository';
import { makeUser } from '@/test/factories/make-user';
import type { MockProxy } from 'bun-mock-extended';
import { mock } from 'bun-mock-extended';
import { DeleteUserUseCase } from './delete';

describe('delete user use case', () => {
  let userRepository: MockProxy<UserRepository>;
  let deleteUserUseCase: DeleteUserUseCase;

  beforeEach(() => {
    userRepository = mock();
    deleteUserUseCase = new DeleteUserUseCase(userRepository);
  });

  test('should delete a user by id', async () => {
    const mockUser = makeUser();

    userRepository.findById
      .calledWith(mockUser.id!)
      .mockResolvedValue(mockUser);

    await deleteUserUseCase.execute({ id: mockUser.id! });

    expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
    expect(userRepository.delete).toHaveBeenCalledWith(mockUser.id);
  });

  test('should throw NotFoundError if user does not exist', async () => {
    userRepository.findById
      .calledWith('non-existent-id')
      .mockResolvedValue(null);

    await expect(
      deleteUserUseCase.execute({ id: 'non-existent-id' }),
    ).rejects.toThrow('User not found');
    expect(userRepository.findById).toHaveBeenCalledWith('non-existent-id');
    expect(userRepository.delete).not.toHaveBeenCalled();
  });
});
