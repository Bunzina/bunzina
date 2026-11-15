import { makeUser } from '@/test/factories/make-user';
import { SQL } from 'bun';
import { mockFn } from 'bun-mock-extended';
import { describe, expect, test, type Mock } from 'bun:test';
import { UserRepository } from './user-repository';

const makeClient = () =>
  mockFn<(..._args: unknown[]) => Promise<unknown[]>>() as unknown as Mock<
    (..._args: unknown[]) => Promise<unknown[]>
  >;

const userRecord = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  name: 'John Doe',
  document: '11144477735',
  email: 'john@example.com',
  password_hash: 'hashed-password',
  role: 'CUSTOMER' as const,
  is_active: true,
  created_at: new Date('2026-01-01T00:00:00.000Z'),
  updated_at: new Date('2026-01-02T00:00:00.000Z'),
};

describe('user repository', () => {
  test.each([
    ['email', 'findByEmail'],
    ['document', 'findByDocument'],
    ['id', 'findById'],
  ] as const)('finds a user by %s', async (_label, method) => {
    const client = makeClient();
    client.mockResolvedValue([userRecord]);
    const repository = new UserRepository(client as unknown as SQL);

    const result = await repository[method]('lookup');

    expect(result?.id).toBe(userRecord.id);
    expect(result?.email.value).toBe(userRecord.email);
    expect(client).toHaveBeenCalled();
  });

  test.each([
    ['email', 'findByEmail'],
    ['document', 'findByDocument'],
    ['id', 'findById'],
  ] as const)(
    'returns null when user %s is not found',
    async (_label, method) => {
      const client = makeClient();
      client.mockResolvedValue([]);
      const repository = new UserRepository(client as unknown as SQL);

      expect(await repository[method]('missing')).toBeNull();
    },
  );

  test('creates a user', async () => {
    const client = makeClient();
    client.mockResolvedValue([]);
    const user = makeUser();
    const repository = new UserRepository(client as unknown as SQL);

    expect(await repository.create(user)).toBe(user);
    expect(client).toHaveBeenCalled();
  });

  test('updates a user without changing its creation timestamp', async () => {
    const client = makeClient();
    client.mockResolvedValue([]);
    const user = makeUser();
    const repository = new UserRepository(client as unknown as SQL);

    expect(await repository.update(user)).toBe(user);
    expect(client).toHaveBeenCalled();
  });

  test('deletes a user', async () => {
    const client = makeClient();
    client.mockResolvedValue([]);
    const repository = new UserRepository(client as unknown as SQL);

    await repository.delete(userRecord.id);

    expect(client).toHaveBeenCalled();
  });
});
