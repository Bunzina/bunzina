import type { Service } from '@/domain/service/entities/service';
import { ServicePresenter } from './service-presenter';
import type { ServicesListResponse } from './dtos/services-list-response';

export const ServicesListPresenter = {
  toHttp(
    services: Service[],
    page: number,
    limit: number,
  ): ServicesListResponse {
    return {
      data: services.map((service) => ServicePresenter.toHttp(service)),
      pagination: {
        page,
        limit,
      },
    };
  },
};
