import type { User } from '@/domain/user/entities/user';
import type { UserRepository as IUserRepository } from '@/domain/user/repositories/user-repository';
import logger from '@lucas-pmelo/logger';
import { SQL } from 'bun';
import type { UserDbSchema } from './dtos/user-db-schema';
import { UserMapper } from './mappers/user-mapper';

export class UserRepository implements IUserRepository {
  constructor(private client: SQL) {}

  async findByEmail(email: string): Promise<User | null> {
    const [record] = await this.client<UserDbSchema[]>`
      SELECT * FROM bunzina.users WHERE email = ${email} LIMIT 1
    `;

    if (!record) {
      logger.debug({
        message: 'No user found with email',
        data: { email },
      });

      return null;
    }

    const user = UserMapper.toDomain(record);

    logger.debug({
      message: 'User found with email',
      data: { email },
    });

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const [record] = await this.client<UserDbSchema[]>`
      SELECT * FROM bunzina.users WHERE id = ${id} LIMIT 1
    `;

    if (!record) {
      logger.debug({
        message: 'No user found with id',
        data: { id },
      });

      return null;
    }

    const user = UserMapper.toDomain(record);

    logger.debug({
      message: 'User found with id',
      data: { id },
    });

    return user;
  }

  async create(user: User): Promise<User> {
    const recordToSave = UserMapper.toDatabase(user);

    logger.debug({
      message: 'Saving user to database',
      data: { ...recordToSave, password_hash: '[REDACTED]' },
    });

    await this.client`
      INSERT INTO bunzina.users ${this.client(recordToSave)}
    `;

    return user;
  }

  async update(user: User): Promise<User> {
    const recordToSave = UserMapper.toDatabase(user);

    logger.debug({
      message: 'Updating user in database',
      data: { ...recordToSave, password_hash: '[REDACTED]' },
    });

    const { id, created_at: _created_at, ...fieldsToUpdate } = recordToSave;

    await this.client`
      UPDATE bunzina.users SET ${this.client(fieldsToUpdate)} WHERE id = ${id}
    `;

    return user;
  }

  async delete(id: string): Promise<void> {
    logger.debug({
      message: 'Deleting user from database',
      data: { id },
    });

    await this.client`
      DELETE FROM bunzina.users WHERE id = ${id}
    `;
  }
}
