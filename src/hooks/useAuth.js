import { useAuthStore, selectRole } from '@/store/authStore';
import { usePermissionStore } from '@/store/permissionStore';
import { hasPermission } from '@/constants/roles';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore(selectRole);
  const logout = useAuthStore((state) => state.logout);
  const rolePermissions = usePermissionStore((state) => state.rolePermissions);

  const can = (module, action) => hasPermission(role, module, action, rolePermissions);

  return { user, role, isAuthenticated, logout, can };
}
