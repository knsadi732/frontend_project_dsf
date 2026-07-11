import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ROLE_PERMISSIONS } from '@/constants/roles';

/**
 * Makes the Role → Permission matrix editable at runtime (RBAC UI Engine,
 * plan.md Chapter 2) instead of a code-only constant. Seeded from the
 * default ROLE_PERMISSIONS matrix; edits persist like authStore/themeStore.
 */
export const usePermissionStore = create(
  persist(
    (set) => ({
      rolePermissions: ROLE_PERMISSIONS,

      setModuleActions: (role, module, actions) =>
        set((state) => ({
          rolePermissions: {
            ...state.rolePermissions,
            [role]: { ...state.rolePermissions[role], [module]: actions },
          },
        })),

      resetToDefaults: () => set({ rolePermissions: ROLE_PERMISSIONS }),
    }),
    { name: 'ds-erp-permissions-v2' },
  ),
);
