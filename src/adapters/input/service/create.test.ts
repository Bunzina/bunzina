import type { CreateServiceUseCase } from '@/application/use-cases/service/create';
import { makeService } from '@/test/factories/make-service';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { CreateServiceInput } from './create';

describe('Create Service Input', () => {
  let createServiceUseCase: MockProxy<CreateServiceUseCase>;
  let createServiceInput: CreateServiceInput;

  beforeEach(() => {
    createServiceUseCase = mock<CreateServiceUseCase>();
    createServiceInput = new CreateServiceInput(createServiceUseCase);
  });

  test('should create a new service successfully', async () => {
    const serviceData = {
      name: 'Tire Rotation',
      description: 'Rotate tires for even wear',
      price: 50,
      durationInMinutes: 30,
    };
    const mockContext = {
      request: {
        method: 'POST',
        headers: new Headers(),
      },
      body: serviceData,
      params: {},
    } as unknown as Context;

    const service = makeService();

    createServiceUseCase.execute.calledWith(any()).mockResolvedValue(service);

    const response = await createServiceInput.execute(mockContext);

    expect(response.status).toBe(201);
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  test('should return validation error for invalid input', async () => {
    const invalidData = {
      name: '',
      description: 'Rotate tires for even wear',
      price: -10,
      durationInMinutes: 30,
    };
    const mockContext = {
      request: {
        method: 'POST',
        headers: new Headers(),
      },
      body: invalidData,
      params: {},
    } as unknown as Context;

    const response = await createServiceInput.execute(mockContext);

    expect(response.status).toBe(400);
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });
});
