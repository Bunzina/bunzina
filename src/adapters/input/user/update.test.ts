import { UserPresenter } from '@/adapters/output/user/user-presenter';
import type { UpdateUserUseCase } from '@/application/use-cases/user/update';
import { makeUser } from '@/test/factories/make-user';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { UpdateUserInput } from './update';

describe('update user input', () => {
  let updateUserUseCase: MockProxy<UpdateUserUseCase>;
  let updateUserInput: UpdateUserInput;

  beforeEach(() => {
    updateUserUseCase = mock();
    updateUserInput = new UpdateUserInput(updateUserUseCase);
  });

  test('should update a user', async () => {
    const user = makeUser();

    updateUserUseCase.execute.calledWith(any()).mockResolvedValue(user);

    const request = {
      params: {
        id: user.id,
      },
      body: {
        name: 'Updated Name',
        document: '111.444.777-35',
        email: 'updated@example.com',
        role: 'ADMIN',
        isActive: true,
      },
    } as unknown as Context;

    const result = await updateUserInput.execute(request);

    expect(result?.status).toBe(200);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
    expect(await result?.json()).toEqual(
      JSON.parse(JSON.stringify(UserPresenter.toHttp(user))),
    );

    expect(updateUserUseCase.execute).toHaveBeenCalledWith({
      id: user.id,
      name: 'Updated Name',
      document: '11144477735',
      email: 'updated@example.com',
      role: 'ADMIN',
      isActive: true,
    });
  });

  test('should return 400 when validation fails', async () => {
    const request = {
      params: {
        id: 'invalid-uuid',
      },
      body: {
        name: 'Updated Name',
      },
    } as unknown as Context;

    const result = await updateUserInput.execute(request);

    expect(result?.status).toBe(400);
    expect(await result?.json()).toMatchObject({
      reason: 'Invalid data in request',
    });
    expect(updateUserUseCase.execute).not.toHaveBeenCalled();
  });

  test('should return 500 when use case throws', async () => {
    updateUserUseCase.execute
      .calledWith(any())
      .mockRejectedValue(new Error('db error'));

    const request = {
      params: {
        id: crypto.randomUUID(),
      },
      body: {
        name: 'Updated Name',
        document: '111.444.777-35',
        email: 'updated@example.com',
        role: 'ADMIN',
        isActive: true,
      },
    } as unknown as Context;

    const result = await updateUserInput.execute(request);

    expect(result?.status).toBe(500);
    expect(await result?.json()).toEqual({ error: 'Failed to update user' });
  });
});
