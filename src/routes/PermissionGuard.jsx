import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ACTIONS } from '@/constants/roles';

export function PermissionGuard({ module, action = ACTIONS.VIEW }) {
  const { can } = useAuth();

  if (!can(module, action)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}

/** Inline conditional render for buttons/sections gated by permission. */
export function Can({ module, action = ACTIONS.VIEW, children }) {
  const { can } = useAuth();
  return can(module, action) ? children : null;
}
