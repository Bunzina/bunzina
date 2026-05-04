import type { SQL } from 'bun';
import logger from '@lucas-pmelo/logger';
import type {
  FindServiceOrdersParams,
  ServiceOrderRepository as IServiceOrderRepository,
} from '@/domain/service-order/repositories/service-order-repository';
import type { ServiceOrder } from '@/domain/service-order/entities/service-order';
import {
  ServiceOrderAutoPartItemMapper,
  ServiceOrderMapper,
  ServiceOrderServiceItemMapper,
} from './mappers/service-order-mapper';
import type {
  ServiceOrderAutoPartItemDbSchema,
  ServiceOrderDbSchema,
  ServiceOrderServiceItemDbSchema,
} from './dtos/service-order-db-schema';

export class ServiceOrderRepository implements IServiceOrderRepository {
  constructor(private client: SQL) {}

  async create(serviceOrder: ServiceOrder): Promise<ServiceOrder> {
    const recordToSave = ServiceOrderMapper.toDatabase(serviceOrder);
    const serviceItemRecords = serviceOrder.serviceItems.map((item) =>
      ServiceOrderServiceItemMapper.toDatabase(serviceOrder.id!, item),
    );
    const autoPartItemRecords = serviceOrder.autoPartItems.map((item) =>
      ServiceOrderAutoPartItemMapper.toDatabase(serviceOrder.id!, item),
    );

    logger.debug({
      message: 'Saving service order to database',
      data: {
        serviceOrder: recordToSave,
        serviceItemsCount: serviceItemRecords.length,
        autoPartItemsCount: autoPartItemRecords.length,
      },
    });

    const persist = async (sql: SQL) => {
      await sql`
        INSERT INTO bunzina.service_orders ${sql(recordToSave)}
      `;

      for (const item of serviceItemRecords) {
        await sql`
          INSERT INTO bunzina.service_order_service_items ${sql(item)}
        `;
      }

      for (const item of autoPartItemRecords) {
        await sql`
          INSERT INTO bunzina.service_order_auto_part_items ${sql(item)}
        `;
      }
    };

    await this.client.transaction(async (sql) => {
      await persist(sql);
    });

    return serviceOrder;
  }

  async findById(id: string): Promise<ServiceOrder | null> {
    const [record] = await this.client<ServiceOrderDbSchema[]>`
      SELECT *
      FROM bunzina.service_orders
      WHERE id = ${id}
      LIMIT 1
    `;

    if (!record) {
      logger.debug({
        message: 'No service order found with id',
        data: { id },
      });

      return null;
    }

    const serviceItems = await this.client<ServiceOrderServiceItemDbSchema[]>`
      SELECT *
      FROM bunzina.service_order_service_items
      WHERE service_order_id = ${id}
    `;

    const autoPartItems = await this.client<ServiceOrderAutoPartItemDbSchema[]>`
        SELECT *
        FROM bunzina.service_order_auto_part_items
        WHERE service_order_id = ${id}
      `;

    const serviceOrder = ServiceOrderMapper.toDomain(
      record,
      serviceItems,
      autoPartItems,
    );

    logger.debug({
      message: 'Service order found',
      data: { id },
    });

    return serviceOrder;
  }

  async findByParams(
    _params: FindServiceOrdersParams,
  ): Promise<ServiceOrder[]> {
    throw new Error('Method not implemented.');
  }

  async update(serviceOrder: ServiceOrder): Promise<ServiceOrder> {
    const recordToUpdate = ServiceOrderMapper.toDatabase(serviceOrder);
    const serviceItemRecords = serviceOrder.serviceItems.map((item) =>
      ServiceOrderServiceItemMapper.toDatabase(serviceOrder.id!, item),
    );
    const autoPartItemRecords = serviceOrder.autoPartItems.map((item) =>
      ServiceOrderAutoPartItemMapper.toDatabase(serviceOrder.id!, item),
    );

    logger.debug({
      message: 'Updating service order',
      data: {
        serviceOrder: recordToUpdate,
        serviceItemsCount: serviceItemRecords.length,
        autoPartItemsCount: autoPartItemRecords.length,
      },
    });

    const {
      id: _id,
      created_at: _created_at,
      ...fieldsToUpdate
    } = recordToUpdate;

    const persist = async (sql: SQL) => {
      await sql`
        UPDATE bunzina.service_orders
        SET ${sql(fieldsToUpdate)}
        WHERE id = ${serviceOrder.id}
      `;

      await sql`
        DELETE FROM bunzina.service_order_service_items
        WHERE service_order_id = ${serviceOrder.id}
      `;

      await sql`
        DELETE FROM bunzina.service_order_auto_part_items
        WHERE service_order_id = ${serviceOrder.id}
      `;

      for (const item of serviceItemRecords) {
        await sql`
          INSERT INTO bunzina.service_order_service_items ${sql(item)}
        `;
      }

      for (const item of autoPartItemRecords) {
        await sql`
          INSERT INTO bunzina.service_order_auto_part_items ${sql(item)}
        `;
      }
    };

    await this.client.transaction(async (sql) => {
      await persist(sql);
    });

    return serviceOrder;
  }

  async delete(id: string): Promise<void> {
    logger.debug({
      message: 'Deleting service order',
      data: { id },
    });

    const persist = async (sql: SQL) => {
      await sql`
        DELETE FROM bunzina.service_order_service_items
        WHERE service_order_id = ${id}
      `;

      await sql`
        DELETE FROM bunzina.service_order_auto_part_items
        WHERE service_order_id = ${id}
      `;

      await sql`
        DELETE FROM bunzina.service_orders
        WHERE id = ${id}
      `;
    };

    await this.client.transaction(async (sql) => {
      await persist(sql);
    });
  }
}
