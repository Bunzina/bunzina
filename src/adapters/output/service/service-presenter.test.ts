import { makeService } from '@/test/factories/make-service';
import { ServicePresenter } from './service-presenter';

describe('Service Presenter', () => {
  test('should map service to HTTP response with averageExecutionTimeMs', () => {
    const service = makeService();
    service.averageExecutionTimeMs = 5000;

    const result = ServicePresenter.toHttp(service);

    expect(result).toMatchObject({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price.value,
      durationInMinutes: service.durationInMinutes,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      averageExecutionTimeMs: 5000,
    });
  });

  test('should map service to HTTP response with null averageExecutionTimeMs', () => {
    const service = makeService();
    service.averageExecutionTimeMs = null;

    const result = ServicePresenter.toHttp(service);

    expect(result).toMatchObject({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price.value,
      durationInMinutes: service.durationInMinutes,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      averageExecutionTimeMs: null,
    });
  });

  test('should map service to HTTP response with undefined averageExecutionTimeMs as null', () => {
    const service = makeService();

    const result = ServicePresenter.toHttp(service);

    expect(result).toMatchObject({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price.value,
      durationInMinutes: service.durationInMinutes,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      averageExecutionTimeMs: null,
    });
  });
});
