import type { ServiceOrderResponse } from './service-order-response';

export interface ServiceOrdersListResponse {
  data: ServiceOrderResponse[];
  pagination: {
    page: number;
    limit: number;
  };
}
