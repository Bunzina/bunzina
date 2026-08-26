import type { UserRole } from '@/domain/user/types/user-role';

export interface UserResponse {
  id: string;
  name: string;
  document: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
