import type { UserRepository } from '@/domain/user/repositories/user-repository';
import { makeUser } from '@/test/factories/make-user';
import type { MockProxy } from 'bun-mock-extended';
import { mock } from 'bun-mock-extended';
import { FindUserUseCase } from './find';

describe('find user use case', () => {
  let userRepository: MockProxy<UserRepository>;
  let findUserUseCase: FindUserUseCase;

  beforeEach(() => {
    userRepository = mock();
    findUserUseCase = new FindUserUseCase(userRepository);
  });

  test('should find a user by id', async () => {
    const mockUser = makeUser();

    userRepository.findById
      .calledWith(mockUser.id!)
      .mockResolvedValue(mockUser);

    const result = await findUserUseCase.execute({ id: mockUser.id! });

    expect(result).toEqual(mockUser);
    expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
  });

  test('should throw NotFoundError if user is not found', async () => {
    userRepository.findById
      .calledWith('non-existent-id')
      .mockResolvedValue(null);

    await expect(
      findUserUseCase.execute({ id: 'non-existent-id' }),
    ).rejects.toThrow('User not found');
    expect(userRepository.findById).toHaveBeenCalledWith('non-existent-id');
  });
});
