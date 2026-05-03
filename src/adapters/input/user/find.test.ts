import { UserPresenter } from '@/adapters/output/user/user-presenter';
import type { FindUserUseCase } from '@/application/use-cases/user/find';
import { makeUser } from '@/test/factories/make-user';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import { FindUserInput } from './find';

describe('find user input', () => {
  let findUserUseCase: MockProxy<FindUserUseCase>;
  let findUserInput: FindUserInput;

  beforeEach(() => {
    findUserUseCase = mock();
    findUserInput = new FindUserInput(findUserUseCase);
  });

  test('should find a user', async () => {
    const user = makeUser();

    findUserUseCase.execute.calledWith(any()).mockResolvedValue(user);

    const request = {
      params: {
        id: user.id,
      },
    } as unknown as Context;

    const result = await findUserInput.execute(request);

    expect(result?.status).toBe(StatusCodes.OK);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
    expect(await result?.json()).toEqual(
      JSON.parse(JSON.stringify(UserPresenter.toHttp(user))),
    );

    expect(findUserUseCase.execute).toHaveBeenCalledWith({
      id: user.id,
    });
  });

  test('should return 400 when validation fails', async () => {
    const request = {
      params: {
        id: 'invalid-uuid',
      },
    } as unknown as Context;

    const result = await findUserInput.execute(request);

    expect(result?.status).toBe(StatusCodes.BAD_REQUEST);
    expect(await result?.json()).toMatchObject({
      reason: 'Invalid data in request',
    });
    expect(findUserUseCase.execute).not.toHaveBeenCalled();
  });

  test('should return 500 when use case throws', async () => {
    findUserUseCase.execute
      .calledWith(any())
      .mockRejectedValue(new Error('db error'));

    const request = {
      params: {
        id: crypto.randomUUID(),
      },
    } as unknown as Context;

    const result = await findUserInput.execute(request);

    expect(result?.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(await result?.json()).toEqual({ error: 'Failed to find user' });
  });
});
