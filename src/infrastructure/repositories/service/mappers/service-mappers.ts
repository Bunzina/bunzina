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
      completed_count: service.completedCount,
      total_execution_time_ms: service.totalExecutionTimeMs,
      average_execution_time_ms: service.averageExecutionTimeMs,
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
      completedCount: record.completed_count,
      totalExecutionTimeMs: record.total_execution_time_ms,
      averageExecutionTimeMs: record.average_execution_time_ms,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  },
};
