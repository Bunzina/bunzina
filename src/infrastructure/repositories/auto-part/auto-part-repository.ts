import type { SQL } from 'bun';
import { AutoPart } from '@/domain/auto-part/entities/auto-part';
import type { AutoPartRepository as IAutoPartRepository } from '@/domain/auto-part/repositories/auto-part-repository';
import type { AutoPartDbSchema } from './dtos/auto-part-db-schema';
import { AutoPartMapper } from './mappers/auto-part-mapper';

export class AutoPartRepository implements IAutoPartRepository {
  constructor(private client: SQL) {}

  async findByName(name: string): Promise<AutoPart | null> {
    const [record] = await this.client<AutoPartDbSchema[]>`
      SELECT * FROM bunzina.auto_parts WHERE name = ${name} LIMIT 1
    `;

    if (!record) return null;

    return AutoPartMapper.toDomain(record);
  }

  async findById(id: string): Promise<AutoPart | null> {
    const [record] = await this.client<AutoPartDbSchema[]>`
      SELECT * FROM bunzina.auto_parts WHERE id = ${id} LIMIT 1
    `;

    if (!record) return null;

    return AutoPartMapper.toDomain(record);
  }

  async create(autoPart: AutoPart): Promise<AutoPart> {
    const dbData = AutoPartMapper.toDatabase(autoPart);

    await this.client`
      INSERT INTO bunzina.auto_parts ${this.client(dbData)}
    `;

    return autoPart;
  }
}
