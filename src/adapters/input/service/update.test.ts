import type { UpdateServiceUseCase } from '@/application/use-cases/service/update';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import type { Context } from 'elysia';
import { UpdateServiceInput } from './update';

describe('Update Service Input', () => {
  let updateServiceUseCase: MockProxy<UpdateServiceUseCase>;
  let updateServiceInput: UpdateServiceInput;

  beforeEach(() => {
    updateServiceUseCase = mock<UpdateServiceUseCase>();
    updateServiceInput = new UpdateServiceInput(updateServiceUseCase);
  });

  test('should update a service successfully', async () => {
    const mockContext = {
      request: {
        method: 'PUT',
        headers: new Headers(),
      },
      body: {
        name: 'Updated Service Name',
        description: 'Updated Service Description',
        price: 150,
        durationInMinutes: 90,
        isActive: false,
      },
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
    } as unknown as Context;

    const updatedService = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Updated Service Name',
      description: 'Updated Service Description',
      price: { value: 150 },
      durationInMinutes: 90,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    updateServiceUseCase.execute
      .calledWith(any())
      .mockResolvedValue(updatedService);

    const response = await updateServiceInput.execute(mockContext);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  test('should return validation error for invalid input', async () => {
    const mockContext = {
      request: {
        method: 'PUT',
        headers: new Headers(),
      },
      body: {
        name: '',
        description: 'Updated Service Description',
        price: -10,
        durationInMinutes: 90,
        isActive: false,
      },
      params: { id: 'service-id' },
    } as unknown as Context;

    const response = await updateServiceInput.execute(mockContext);

    expect(response.status).toBe(400);
  });
});
