import { FindServiceUseCase } from '@/application/use-cases/service/find';
import { makeService } from '@/test/factories/make-service';
import { mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { FindServiceInput } from './find';

describe('Find Service Input', () => {
  let findServiceUseCase: MockProxy<FindServiceUseCase>;
  let findServiceInput: FindServiceInput;

  beforeEach(() => {
    findServiceUseCase = mock<FindServiceUseCase>();
    findServiceInput = new FindServiceInput(findServiceUseCase);
  });

  test('should find a service by ID', async () => {
    const serviceId = '123e4567-e89b-12d3-a456-426614174000';
    const mockContext = {
      request: { method: 'GET', headers: new Headers(), body: null },
      params: { id: serviceId },
    } as unknown as Context;

    const service = makeService({ id: serviceId });

    findServiceUseCase.execute.calledWith(serviceId).mockResolvedValue(service);

    const response = await findServiceInput.execute(mockContext);

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
  });

  test('should return validation error for invalid ID', async () => {
    const invalidId = 'invalid-uuid';
    const mockContext = {
      request: { method: 'GET', headers: new Headers(), body: null },
      params: { id: invalidId },
    } as unknown as Context;

    const response = await findServiceInput.execute(mockContext);

    expect(response.status).toBe(400);
  });
});
