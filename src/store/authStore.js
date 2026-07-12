import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addAuditLog } from '@/services/auditLog.api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setSession: ({ user, accessToken, refreshToken }) =>
        set({
          user,
          accessToken,
          refreshToken: refreshToken ?? null,
          isAuthenticated: true,
        }),

      setAccessToken: (accessToken) => set({ accessToken }),

      updateUser: (patch) => set((state) => ({ user: { ...state.user, ...patch } })),

      logout: () => {
        const currentUser = get().user;
        if (currentUser) {
          addAuditLog({ employeeId: currentUser.id, action: 'logout', description: `${currentUser.name} signed out` });
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'ds-erp-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
