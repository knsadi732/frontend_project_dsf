import { useAuthStore, selectRole } from '@/store/authStore';
import { hasPermission } from '@/constants/roles';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore(selectRole);
  const logout = useAuthStore((state) => state.logout);

  const can = (module, action) => hasPermission(role, module, action);

  return { user, role, isAuthenticated, logout, can };
}
