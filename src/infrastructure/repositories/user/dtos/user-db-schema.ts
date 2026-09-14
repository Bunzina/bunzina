import type { UserRole } from '@/domain/user/types/user-role';

export interface UserDbSchema {
  id: string;
  name: string;
  document: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
