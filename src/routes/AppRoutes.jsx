import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { PermissionGuard } from '@/routes/PermissionGuard';
import { BaseLoader } from '@/components/ui/BaseLoader';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { MODULES, ACTIONS } from '@/constants/roles';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const ProductsPage = lazy(() => import('@/features/products').then((m) => ({ default: m.ProductsPage })));
const PurchasesPage = lazy(() => import('@/features/purchases').then((m) => ({ default: m.PurchasesPage })));
const InventoryPage = lazy(() => import('@/features/inventory').then((m) => ({ default: m.InventoryPage })));
const ProductionPage = lazy(() => import('@/features/production').then((m) => ({ default: m.ProductionPage })));
const SalesPage = lazy(() => import('@/features/sales').then((m) => ({ default: m.SalesPage })));
const FinancePage = lazy(() => import('@/features/finance').then((m) => ({ default: m.FinancePage })));
const ReturnsPage = lazy(() => import('@/features/returns').then((m) => ({ default: m.ReturnsPage })));
const UsersPage = lazy(() => import('@/features/users').then((m) => ({ default: m.UsersPage })));
const ProfilePage = lazy(() => import('@/features/profile').then((m) => ({ default: m.ProfilePage })));
const NotificationsPage = lazy(() =>
  import('@/features/notifications').then((m) => ({ default: m.NotificationsPage })),
);
const ReportsPage = lazy(() => import('@/features/reports').then((m) => ({ default: m.ReportsPage })));

function SuspenseOutlet({ children }) {
  return <Suspense fallback={<BaseLoader label="Loading page…" />}>{children}</Suspense>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <SuspenseOutlet>
              <LoginPage />
            </SuspenseOutlet>
          }
        />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<SuspenseOutlet><DashboardPage /></SuspenseOutlet>} />

          <Route element={<PermissionGuard module={MODULES.PRODUCTS} action={ACTIONS.VIEW} />}>
            <Route path="/products" element={<SuspenseOutlet><ProductsPage /></SuspenseOutlet>} />
          </Route>

          <Route element={<PermissionGuard module={MODULES.PURCHASES} action={ACTIONS.VIEW} />}>
            <Route path="/purchases" element={<SuspenseOutlet><PurchasesPage /></SuspenseOutlet>} />
          </Route>

          <Route element={<PermissionGuard module={MODULES.INVENTORY} action={ACTIONS.VIEW} />}>
            <Route path="/inventory" element={<SuspenseOutlet><InventoryPage /></SuspenseOutlet>} />
          </Route>

          <Route element={<PermissionGuard module={MODULES.PRODUCTION} action={ACTIONS.VIEW} />}>
            <Route path="/production" element={<SuspenseOutlet><ProductionPage /></SuspenseOutlet>} />
          </Route>

          <Route element={<PermissionGuard module={MODULES.SALES} action={ACTIONS.VIEW} />}>
            <Route path="/sales" element={<SuspenseOutlet><SalesPage /></SuspenseOutlet>} />
          </Route>

          <Route element={<PermissionGuard module={MODULES.FINANCE} action={ACTIONS.VIEW} />}>
            <Route path="/finance" element={<SuspenseOutlet><FinancePage /></SuspenseOutlet>} />
          </Route>

          <Route element={<PermissionGuard module={MODULES.RETURNS} action={ACTIONS.VIEW} />}>
            <Route path="/returns" element={<SuspenseOutlet><ReturnsPage /></SuspenseOutlet>} />
          </Route>

          <Route element={<PermissionGuard module={MODULES.USERS} action={ACTIONS.VIEW} />}>
            <Route path="/users" element={<SuspenseOutlet><UsersPage /></SuspenseOutlet>} />
          </Route>

          <Route path="/profile" element={<SuspenseOutlet><ProfilePage /></SuspenseOutlet>} />

          <Route element={<PermissionGuard module={MODULES.NOTIFICATIONS} action={ACTIONS.VIEW} />}>
            <Route path="/notifications" element={<SuspenseOutlet><NotificationsPage /></SuspenseOutlet>} />
          </Route>

          <Route element={<PermissionGuard module={MODULES.REPORTS} action={ACTIONS.VIEW} />}>
            <Route path="/reports" element={<SuspenseOutlet><ReportsPage /></SuspenseOutlet>} />
          </Route>

          <Route path="/403" element={<ForbiddenPage />} />
          <Route index element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
