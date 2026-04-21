import { Vehicle } from '@/domain/vehicle/entities/vehicle';
import type {
  FindVehiclesParams,
  VehicleRepository as IVehicleRepository,
} from '@/domain/vehicle/repositories/vehicle-repository';
import logger from '@lucas-pmelo/logger';
import { SQL } from 'bun';
import type { VehicleDbSchema } from './dtos/vehicle-db-schema';
import { VehicleMapper } from './mappers/vehicle-mapper';

export class VehicleRepository implements IVehicleRepository {
  constructor(private client: SQL) {}

  private buildFindByParamsFiltersSql(
    filters: NonNullable<FindVehiclesParams['filters']>,
  ) {
    const customerIdFilter = filters.customerId
      ? this.client`AND customer_id = ${filters.customerId}`
      : this.client``;
    const licensePlateFilter = filters.licensePlate
      ? this.client`AND license_plate ILIKE ${`%${filters.licensePlate}%`}`
      : this.client``;
    const modelFilter = filters.model
      ? this.client`AND model ILIKE ${`%${filters.model}%`}`
      : this.client``;
    const brandFilter = filters.brand
      ? this.client`AND brand ILIKE ${`%${filters.brand}%`}`
      : this.client``;
    const yearFilter = filters.year
      ? this.client`AND year = ${filters.year}`
      : this.client``;
    const startCreatedAtFilter = filters.startCreatedAt
      ? this.client`AND created_at >= ${filters.startCreatedAt}`
      : this.client``;
    const endCreatedAtFilter = filters.endCreatedAt
      ? this.client`AND created_at <= ${filters.endCreatedAt}`
      : this.client``;

    return this.client`
      ${customerIdFilter}
      ${licensePlateFilter}
      ${modelFilter}
      ${brandFilter}
      ${yearFilter}
      ${startCreatedAtFilter}
      ${endCreatedAtFilter}
    `;
  }

  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    const [record] = await this.client<VehicleDbSchema[]>`
      SELECT * FROM bunzina.vehicles WHERE license_plate = ${licensePlate} LIMIT 1
    `;

    if (!record) {
      logger.debug({
        message: 'No vehicle found with license plate',
        data: { licensePlate },
      });

      return null;
    }

    const vehicle = VehicleMapper.toDomain(record);

    logger.debug({
      message: 'Vehicle found with license plate',
      data: {
        licensePlate,
        vehicle,
      },
    });

    return vehicle;
  }

  async findById(id: string): Promise<Vehicle | null> {
    const [record] = await this.client<VehicleDbSchema[]>`
      SELECT * FROM bunzina.vehicles WHERE id = ${id} LIMIT 1
    `;

    if (!record) {
      logger.debug({
        message: 'No vehicle found with id',
        data: { id },
      });

      return null;
    }

    const vehicle = VehicleMapper.toDomain(record);

    logger.debug({
      message: 'Vehicle found with id',
      data: {
        id,
        vehicle,
      },
    });

    return vehicle;
  }

  async create(vehicle: Vehicle): Promise<Vehicle> {
    const recordToSave = VehicleMapper.toDatabase(vehicle);

    logger.debug({
      message: 'Saving vehicle to database',
      data: recordToSave,
    });

    await this.client`
      INSERT INTO bunzina.vehicles ${this.client(recordToSave)}
    `;

    return vehicle;
  }

  async update(vehicle: Vehicle): Promise<Vehicle> {
    const recordToSave = VehicleMapper.toDatabase(vehicle);

    logger.debug({
      message: 'Updating vehicle in database',
      data: recordToSave,
    });

    const {
      id: _id,
      created_at: _created_at,
      ...fieldsToUpdate
    } = recordToSave;

    await this.client`
      UPDATE bunzina.vehicles SET ${this.client(fieldsToUpdate)} WHERE id = ${vehicle.id}
    `;

    return vehicle;
  }

  async delete(id: string): Promise<void> {
    logger.debug({
      message: 'Deleting vehicle from database',
      data: { id },
    });

    await this.client`
      DELETE FROM bunzina.vehicles WHERE id = ${id}
    `;
  }

  async findByParams(params: FindVehiclesParams): Promise<Vehicle[]> {
    const filters = params.filters ?? {};
    const filtersSql = this.buildFindByParamsFiltersSql(filters);
    const offset = (params.page - 1) * params.limit;

    logger.debug({
      message: 'Finding paginated vehicles',
      data: {
        page: params.page,
        limit: params.limit,
        filters,
      },
    });

    const records = await this.client<VehicleDbSchema[]>`
      SELECT *
      FROM bunzina.vehicles
      WHERE 1 = 1
      ${filtersSql}
      ORDER BY created_at DESC
      LIMIT ${params.limit}
      OFFSET ${offset}
    `;

    const data = records.map((record) => VehicleMapper.toDomain(record));

    logger.debug({
      message: 'Paginated vehicles found',
      data: {
        count: data.length,
        page: params.page,
        limit: params.limit,
      },
    });

    return data;
  }
}
