import type { DeleteUserUseCase } from '@/application/use-cases/user/delete';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { DeleteUserInput } from './delete';

describe('delete user input', () => {
  let deleteUserUseCase: MockProxy<DeleteUserUseCase>;
  let deleteUserInput: DeleteUserInput;

  beforeEach(() => {
    deleteUserUseCase = mock();
    deleteUserInput = new DeleteUserInput(deleteUserUseCase);
  });

  test('should delete a user', async () => {
    const id = crypto.randomUUID();

    deleteUserUseCase.execute
      .calledWith(any())
      .mockResolvedValue(undefined as never);

    const request = {
      params: { id },
    } as unknown as Context;

    const result = await deleteUserInput.execute(request);

    expect(result?.status).toBe(204);

    expect(deleteUserUseCase.execute).toHaveBeenCalledWith({ id });
  });

  test('should return 400 when validation fails', async () => {
    const request = {
      params: {
        id: 'invalid-uuid',
      },
    } as unknown as Context;

    const result = await deleteUserInput.execute(request);

    expect(result?.status).toBe(400);
    expect(await result?.json()).toMatchObject({
      reason: 'Invalid data in request',
    });
    expect(deleteUserUseCase.execute).not.toHaveBeenCalled();
  });

  test('should return 500 when use case throws', async () => {
    deleteUserUseCase.execute
      .calledWith(any())
      .mockRejectedValue(new Error('db error'));

    const request = {
      params: {
        id: crypto.randomUUID(),
      },
    } as unknown as Context;

    const result = await deleteUserInput.execute(request);

    expect(result?.status).toBe(500);
    expect(await result?.json()).toEqual({ error: 'Failed to delete user' });
  });
});
