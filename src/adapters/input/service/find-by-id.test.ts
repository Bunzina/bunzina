import { FindServiceByIdUseCase } from '@/application/use-cases/service/find-by-id';
import { makeService } from '@/test/factories/make-service';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { FindServiceByIdInput } from './find-by-id';

describe('Find Service Input', () => {
  let findServiceByIdUseCase: MockProxy<FindServiceByIdUseCase>;
  let findServiceByIdInput: FindServiceByIdInput;

  beforeEach(() => {
    findServiceByIdUseCase = mock<FindServiceByIdUseCase>();
    findServiceByIdInput = new FindServiceByIdInput(findServiceByIdUseCase);
  });

  test('should find a service by ID', async () => {
    const serviceId = '123e4567-e89b-12d3-a456-426614174000';
    const mockContext = {
      request: { method: 'GET', headers: new Headers(), body: null },
      params: { id: serviceId },
    } as unknown as Context;

    const service = makeService({ id: serviceId });

    findServiceByIdUseCase.execute.calledWith(any()).mockResolvedValue(service);

    const response = await findServiceByIdInput.execute(mockContext);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(await response.json()).toMatchObject({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price.value,
      durationInMinutes: service.durationInMinutes,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    });
    expect(findServiceByIdUseCase.execute).toHaveBeenCalledWith({
      id: serviceId,
    });
  });

  test('should return validation error for invalid ID', async () => {
    const invalidId = 'invalid-uuid';
    const mockContext = {
      request: { method: 'GET', headers: new Headers(), body: null },
      params: { id: invalidId },
    } as unknown as Context;

    const response = await findServiceByIdInput.execute(mockContext);

    expect(response.status).toBe(400);
  });
});
