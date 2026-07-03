import { UserRole } from './constants/user-role';
import type { AuthUser } from '../store/slices/auth-slice';

export function canCreateJob(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.role === UserRole.Admin || user.role === UserRole.Manager;
}
