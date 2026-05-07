import type { Service } from '@/domain/service/entities/service';
import type { IServiceRepository } from '@/domain/service/repositories/service-repository';
import logger from '@lucas-pmelo/logger';
import type { SQL } from 'bun';
import { ServiceMapper } from './mappers/service-mappers';
import type { ServiceDbSchema } from './dtos/service-db-schema';

export class ServiceRepository implements IServiceRepository {
  constructor(private client: SQL) {}

  async findById(id: string): Promise<Service | null> {
    const [record] = await this.client<ServiceDbSchema[]>`
      SELECT * FROM bunzina.services WHERE id = ${id} and is_active = true LIMIT 1
    `;

    if (!record) {
      logger.debug({
        message: 'No service found with id',
        data: { id },
      });

      return null;
    }

    const service = ServiceMapper.toDomain(record);

    logger.debug({
      message: 'Service found with id',
      data: {
        id,
        service,
      },
    });

    return service;
  }

  async update(service: Service): Promise<Service> {
    const recordToUpdate = ServiceMapper.toDatabase(service);

    logger.debug({
      message: 'Updating service',
      data: { service },
    });

    const {
      id: _id,
      created_at: _created_at,
      ...fieldsToUpdate
    } = recordToUpdate;

    await this.client`
            UPDATE bunzina.services
            SET ${this.client(fieldsToUpdate)}
            WHERE id = ${service.id}            
        `;

    return service;
  }

  async delete(id: string): Promise<void> {
    logger.debug({
      message: 'Deleting service from database',
      data: { id },
    });

    await this.client`
            UPDATE bunzina.services SET is_active = false WHERE id = ${id}
        `;
  }

  async getAverageExecutionTimeMs(serviceId: string): Promise<number | null> {
    logger.debug({
      message: 'Getting average execution time for service',
      data: { serviceId },
    });

    const result = await this.client<{
      avg_execution_time: number | string | null;
    }[]>`
      SELECT AVG(execution_time_ms) as avg_execution_time
      FROM bunzina.service_order_service_items
      WHERE service_id = ${serviceId} AND is_completed = true
    `;

    const raw = result[0]?.avg_execution_time;
    if (raw === null || raw === undefined) return null;

    const parsed = typeof raw === 'string' ? Number(raw) : raw;
    if (Number.isNaN(parsed)) return null;

    return parsed;
  }

  async create(service: Service): Promise<Service> {
    const recordToSave = ServiceMapper.toDatabase(service);

    logger.debug({
      message: 'Saving service to database',
      data: recordToSave,
    });

    await this.client`
            INSERT INTO bunzina.services ${this.client(recordToSave)}
        `;

    return service;
  }
}
