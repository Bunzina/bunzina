import type { AutoPart } from '@/domain/auto-part/entities/auto-part';
import dayjs from 'dayjs';
import type { AutoPartResponse } from './dtos/auto-part-response';

export const AutoPartPresenter = {
  toHttp(autoPart: AutoPart): AutoPartResponse {
    return {
      id: autoPart.id!,
      name: autoPart.name,
      description: autoPart.description,
      price: autoPart.price.value,
      stock: autoPart.stock,
      createdAt: autoPart.createdAt.toISOString(),
      updatedAt: autoPart.updatedAt.toISOString(),
    };
  },
};
