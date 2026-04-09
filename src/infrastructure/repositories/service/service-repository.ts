import type { Service } from '@/domain/service/entities/service';
import type { IServiceRepository } from '@/domain/service/repositories/service-repository';
import logger from '@lucas-pmelo/logger';
import type { SQL } from 'bun';
import { ServiceMapper } from './mappers/service-mappers';

export class ServiceRepository implements IServiceRepository {
  constructor(private client: SQL) {}

  async findById(id: string): Promise<Service | null> {
    logger.debug({
      message: 'Finding service by ID',
      data: { id },
    });

    const result = await this.client`
            SELECT * FROM bunzina.services WHERE id = ${id}
        `;

    if (!result.length) {
      return null;
    }

    return ServiceMapper.toDomain(result[0]);
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
            DELETE FROM bunzina.services WHERE id = ${id}
        `;
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
