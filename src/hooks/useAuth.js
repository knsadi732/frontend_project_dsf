import { useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePermissionStore } from '@/store/permissionStore';
import { hasPermission } from '@/constants/roles';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const rolePermissions = usePermissionStore((state) => state.rolePermissions);

  const roles = useMemo(
    () => (user ? [user.primaryRole, ...(user.additionalRoles ?? [])].filter(Boolean) : []),
    [user],
  );

  const can = (module, action) => roles.some((role) => hasPermission(role, module, action, rolePermissions));

  return { user, role: roles[0] ?? null, roles, isAuthenticated, logout, can };
}
