import type { Service } from '@/domain/service/entities/service';
import type {
  FindServicesParams,
  ServiceRepository as IServiceRepository,
} from '@/domain/service/repositories/service-repository';
import logger from '@lucas-pmelo/logger';
import type { SQL } from 'bun';
import type { ServiceDbSchema } from './dtos/service-db-schema';
import { ServiceMapper } from './mappers/service-mappers';

export class ServiceRepository implements IServiceRepository {
  constructor(private client: SQL) {}

  private buildFindByParamsFiltersSql(
    filters: NonNullable<FindServicesParams['filters']>,
  ) {
    const nameFilter = filters.name
      ? this.client`AND name ILIKE ${`%${filters.name}%`}`
      : this.client``;

    return this.client`
      ${nameFilter}
    `;
  }

  async findById(id: string): Promise<Service | null> {
    logger.debug({
      message: 'Finding service by ID',
      data: { id },
    });

    const result = await this.client`
            SELECT * FROM bunzina.services WHERE id = ${id} and is_active = true
        `;

    if (!result.length) {
      return null;
    }

    return ServiceMapper.toDomain(result[0]);
  }

  async findByParams(params: FindServicesParams): Promise<Service[]> {
    const filters = params.filters ?? {};
    const filtersSql = this.buildFindByParamsFiltersSql(filters);
    const offset = (params.page - 1) * params.limit;

    logger.debug({
      message: 'Finding paginated services',
      data: {
        page: params.page,
        limit: params.limit,
        filters,
      },
    });

    const records = await this.client<ServiceDbSchema[]>`
      SELECT *
      FROM bunzina.services
      WHERE is_active = true
      ${filtersSql}
      ORDER BY created_at DESC
      LIMIT ${params.limit}
      OFFSET ${offset}
    `;

    if (!records.length) {
      logger.debug({
        message: 'No services found for given params',
        data: {
          page: params.page,
          limit: params.limit,
          filters,
        },
      });
      return [];
    }

    const data = records.map((record) => ServiceMapper.toDomain(record));

    logger.debug({
      message: 'Paginated services found',
      data: {
        count: data.length,
        page: params.page,
        limit: params.limit,
      },
    });

    return data;
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

  async incrementExecutionStats(
    serviceId: string,
    newTimeMs: number,
  ): Promise<void> {
    logger.debug({
      message: 'Incrementing service execution stats',
      data: { serviceId, newTimeMs },
    });

    await this.client`
      UPDATE bunzina.services
      SET completed_count = completed_count + 1,
          total_execution_time_ms = total_execution_time_ms + ${newTimeMs},
          updated_at = NOW()
      WHERE id = ${serviceId}
    `;
  }
}
