import { makeUser } from '@/test/factories/make-user';
import { describe, expect, test } from 'bun:test';
import { UserPresenter } from './user-presenter';

describe('user presenter', () => {
  test('should convert a user entity to http response', () => {
    const user = makeUser();

    const response = UserPresenter.toHttp(user);

    expect(response).toEqual({
      id: user.id!,
      name: user.name,
      document: user.document.value,
      email: user.email.value,
      role: user.role,
      isActive: user.isActive,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
});
