import type { AutoPart } from '@/domain/auto-part/entities/auto-part';
import { AutoPartPresenter } from './auto-part-presenter';
import type { AutoPartsListResponse } from './dtos/auto-parts-list-response';

export const AutoPartsListPresenter = {
  toHttp(
    autoParts: AutoPart[],
    page: number,
    limit: number,
  ): AutoPartsListResponse {
    return {
      data: autoParts.map((autoPart) => AutoPartPresenter.toHttp(autoPart)),
      pagination: {
        page,
        limit,
      },
    };
  },
};
