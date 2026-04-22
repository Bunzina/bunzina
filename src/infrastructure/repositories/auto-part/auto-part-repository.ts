import type { SQL } from 'bun';
import { AutoPart } from '@/domain/auto-part/entities/auto-part';
import type { AutoPartRepository as IAutoPartRepository } from '@/domain/auto-part/repositories/auto-part-repository';
import logger from '@lucas-pmelo/logger';
import type { AutoPartDbSchema } from './dtos/auto-part-db-schema';
import { AutoPartMapper } from './mappers/auto-part-mapper';

export class AutoPartRepository implements IAutoPartRepository {
  constructor(private client: SQL) { }

  async findByName(name: string): Promise<AutoPart | null> {
    const [record] = await this.client<AutoPartDbSchema[]>`
      SELECT * FROM bunzina.auto_parts WHERE name = ${name} LIMIT 1
    `;

    if (!record) {
      logger.debug({
        message: 'No auto-part found with name',
        data: { name },
      });

      return null;
    }

    const autoPart = AutoPartMapper.toDomain(record);

    logger.debug({
      message: 'Auto-part found with name',
      data: {
        name,
        autoPart,
      },
    });

    return autoPart;
  }

  async findById(id: string): Promise<AutoPart | null> {
    const [record] = await this.client<AutoPartDbSchema[]>`
      SELECT * FROM bunzina.auto_parts WHERE id = ${id} LIMIT 1
    `;

    if (!record) {
      logger.debug({
        message: 'No auto-part found with id',
        data: { id },
      });

      return null;
    }

    const autoPart = AutoPartMapper.toDomain(record);

    logger.debug({
      message: 'Auto-part found with id',
      data: {
        id,
        autoPart,
      },
    });

    return autoPart;
  }

  async create(autoPart: AutoPart): Promise<AutoPart> {
    const recordToSave = AutoPartMapper.toDatabase(autoPart);

    logger.debug({
      message: 'Saving auto-part to database',
      data: recordToSave,
    });

    await this.client`
      INSERT INTO bunzina.auto_parts ${this.client(recordToSave)}
    `;

    return autoPart;
  }
}
