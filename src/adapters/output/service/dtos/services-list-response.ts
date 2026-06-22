import type { ServiceResponse } from './service-response';

export interface ServicesListResponse {
  data: ServiceResponse[];
  pagination: {
    page: number;
    limit: number;
  };
}
