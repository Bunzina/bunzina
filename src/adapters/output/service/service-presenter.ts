import type { Service } from '@/domain/service/entities/service';
import dayjs from 'dayjs';
import type { ServiceResponse } from './dtos/service-response';

export const ServicePresenter = {
  toHttp(service: Service): ServiceResponse {
    return {
      id: service.id!,
      name: service.name,
      description: service.description,
      price: service.price.value,
      durationInMinutes: service.durationInMinutes,
      createdAt: dayjs(service.createdAt).toISOString(),
      updatedAt: dayjs(service.updatedAt).toISOString(),
    };
  },
};
