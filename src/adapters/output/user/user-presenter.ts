import type { User } from '@/domain/user/entities/user';
import dayjs from 'dayjs';
import type { UserResponse } from './dtos/user-response';

export const UserPresenter = {
  toHttp(user: User): UserResponse {
    return {
      id: user.id!,
      name: user.name,
      email: user.email.value,
      role: user.role,
      isActive: user.isActive,
      createdAt: dayjs(user.createdAt).format('YYYY-MM-DD'),
      updatedAt: dayjs(user.updatedAt).format('YYYY-MM-DD'),
    };
  },
};
