import type { DeleteServiceOrderUseCase } from '@/application/use-cases/service-order/delete';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import { DeleteServiceOrderInput } from './delete';

describe('delete service order input', () => {
  let deleteServiceOrderUseCase: MockProxy<DeleteServiceOrderUseCase>;
  let deleteServiceOrderInput: DeleteServiceOrderInput;

  beforeEach(() => {
    deleteServiceOrderUseCase = mock();
    deleteServiceOrderInput = new DeleteServiceOrderInput(
      deleteServiceOrderUseCase,
    );
  });

  test('should delete a service order', async () => {
    const serviceOrderId = '123e4567-e89b-12d3-a456-426614174000';

    deleteServiceOrderUseCase.execute
      .calledWith(any())
      .mockResolvedValue(undefined);

    const request = {
      params: { id: serviceOrderId },
    } as unknown as Context;

    const result = await deleteServiceOrderInput.execute(request);

    expect(result.status).toBe(StatusCodes.NO_CONTENT);
    expect(deleteServiceOrderUseCase.execute).toHaveBeenCalledWith({
      id: serviceOrderId,
    });
  });

  test('should return 500 if use case throws', async () => {
    deleteServiceOrderUseCase.execute
      .calledWith(any())
      .mockRejectedValue(new Error('unexpected error'));

    const request = {
      params: { id: '123e4567-e89b-12d3-a456-426614174000' },
    } as unknown as Context;

    const result = await deleteServiceOrderInput.execute(request);

    expect(result.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({
      error: 'Failed to delete service order',
    });
  });

  test('should return 400 if validation fails', async () => {
    const request = {
      params: { id: 'invalid-uuid' },
    } as unknown as Context;

    const result = await deleteServiceOrderInput.execute(request);

    expect(result.status).toBe(StatusCodes.BAD_REQUEST);
    expect(await result.json()).toMatchObject({
      reason: 'Invalid data in request',
    });
    expect(deleteServiceOrderUseCase.execute).not.toHaveBeenCalled();
  });
});
