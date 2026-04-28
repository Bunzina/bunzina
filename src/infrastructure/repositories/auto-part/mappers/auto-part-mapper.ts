import { AutoPart } from '@/domain/auto-part/entities/auto-part';
import { Price } from '@/domain/core/value-objects/price';
import type { AutoPartDbSchema } from '../dtos/auto-part-db-schema';

export const AutoPartMapper = {
  toDatabase(autoPart: AutoPart): AutoPartDbSchema {
    return {
      id: autoPart.id!,
      name: autoPart.name,
      description: autoPart.description,
      price: autoPart.price.value,
      stock: autoPart.stock,
      is_active: true,
      created_at: autoPart.createdAt,
      updated_at: autoPart.updatedAt,
    };
  },

  toDomain(record: AutoPartDbSchema): AutoPart {
    return new AutoPart({
      id: record.id,
      name: record.name,
      description: record.description,
      price: new Price(record.price),
      stock: record.stock,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  },
};
