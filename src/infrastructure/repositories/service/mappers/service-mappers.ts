import { Service } from '@/domain/service/entities/service';
import type { ServiceDbSchema } from '../dtos/service-db-schema';

export const ServiceMapper = {
  toDatabase(service: Service): ServiceDbSchema {
    return {
      id: service.id!,
      name: service.name,
      description: service.description,
      price: service.price.value,
      duration_in_minutes: service.durationInMinutes,
      is_active: service.isActive,
      created_at: service.createdAt,
      updated_at: service.updatedAt,
    };
  },

  toDomain(record: ServiceDbSchema): Service {
    return new Service({
      id: record.id,
      name: record.name,
      description: record.description,
      price: {
        value: record.price,
      },
      durationInMinutes: record.duration_in_minutes,
      isActive: record.is_active,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  },
};
