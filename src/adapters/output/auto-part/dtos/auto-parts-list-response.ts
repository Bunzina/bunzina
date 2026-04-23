import type { AutoPartResponse } from './auto-part-response';

export interface AutoPartsListResponse {
  data: AutoPartResponse[];
  pagination: {
    page: number;
    limit: number;
  };
}
