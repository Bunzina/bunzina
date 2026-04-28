import type { DeleteAutoPartUseCase } from '@/application/use-cases/auto-part/delete';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { DeleteAutoPartInput } from './delete';

describe('delete auto part input', () => {
  let deleteAutoPartUseCase: MockProxy<DeleteAutoPartUseCase>;
  let deleteAutoPartInput: DeleteAutoPartInput;

  beforeEach(() => {
    deleteAutoPartUseCase = mock();
    deleteAutoPartInput = new DeleteAutoPartInput(deleteAutoPartUseCase);
  });

  test('should soft delete an auto part', async () => {
    const autoPartId = '123e4567-e89b-12d3-a456-426614174000';

    deleteAutoPartUseCase.execute
      .calledWith(any())
      .mockResolvedValue(undefined);

    const request = {
      params: { id: autoPartId },
    } as unknown as Context;

    const result = await deleteAutoPartInput.execute(request);

    expect(result.status).toBe(204);
    expect(deleteAutoPartUseCase.execute).toHaveBeenCalledWith({
      id: autoPartId,
    });
  });

  test('should return 500 if use case throws', async () => {
    deleteAutoPartUseCase.execute
      .calledWith(any())
      .mockRejectedValue(new Error('unexpected error'));

    const request = {
      params: { id: '123e4567-e89b-12d3-a456-426614174000' },
    } as unknown as Context;

    const result = await deleteAutoPartInput.execute(request);

    expect(result.status).toBe(500);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({
      error: 'Failed to delete auto part',
    });
  });

  test('should return 400 if validation fails', async () => {
    const request = {
      params: { id: 'invalid-uuid' },
    } as unknown as Context;

    const result = await deleteAutoPartInput.execute(request);

    expect(result.status).toBe(400);
    expect(await result.json()).toMatchObject({
      reason: 'Invalid data in request',
    });
    expect(deleteAutoPartUseCase.execute).not.toHaveBeenCalled();
  });
});
