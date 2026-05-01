import { DeleteServiceUseCase } from '@/application/use-cases/service/delete';
import { mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import { DeleteServiceInput } from './delete';

describe('Delete Service Input', () => {
  let deleteServiceUseCase: MockProxy<DeleteServiceUseCase>;
  let deleteServiceInput: DeleteServiceInput;

  beforeEach(() => {
    deleteServiceUseCase = mock<DeleteServiceUseCase>();
    deleteServiceInput = new DeleteServiceInput(deleteServiceUseCase);
  });

  test('should delete a service successfully', async () => {
    const serviceId = '123e4567-e89b-12d3-a456-426614174000';
    const mockContext = {
      params: { id: serviceId },
    } as unknown as Context;

    deleteServiceUseCase.execute
      .calledWith({ id: serviceId })
      .mockResolvedValue();

    const response = await deleteServiceInput.execute(mockContext);

    expect(response.status).toBe(StatusCodes.NO_CONTENT);
  });

  test('should return validation error for invalid ID', async () => {
    const invalidId = 'invalid-uuid';
    const mockContext = {
      params: { id: invalidId },
    } as unknown as Context;

    const response = await deleteServiceInput.execute(mockContext);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });
});
