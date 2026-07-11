import { useAuth } from '@/hooks/useAuth';
import { usePermissionStore } from '@/store/permissionStore';
import { BaseCard, CardHeader, CardBody } from '@/components/ui/BaseCard';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { ROLES, MODULES, ACTIONS } from '@/constants/roles';

const FULL_ACCESS_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
const EDITABLE_ROLES = Object.values(ROLES).filter((role) => !FULL_ACCESS_ROLES.includes(role));
const MODULE_LABELS = {
  [MODULES.DASHBOARD]: 'Dashboard',
  [MODULES.USERS]: 'Employees',
  [MODULES.PRODUCTS]: 'Products',
  [MODULES.PURCHASES]: 'Purchases',
  [MODULES.INVENTORY]: 'Inventory',
  [MODULES.PRODUCTION]: 'Production',
  [MODULES.SALES]: 'Sales',
  [MODULES.FINANCE]: 'Finance',
  [MODULES.NOTIFICATIONS]: 'Notifications',
  [MODULES.REPORTS]: 'Reports',
};

export function RolePermissionsPanel() {
  const { can } = useAuth();
  const canEdit = can(MODULES.USERS, ACTIONS.EDIT);
  const rolePermissions = usePermissionStore((state) => state.rolePermissions);
  const setModuleActions = usePermissionStore((state) => state.setModuleActions);

  const toggleAction = (role, module, action) => {
    if (!canEdit) return;
    const current = rolePermissions[role]?.[module] ?? [];
    const next = current.includes(action) ? current.filter((item) => item !== action) : [...current, action];
    setModuleActions(role, module, next);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-muted">
        Each role's module-level access. Menu, page and action visibility all follow this matrix.
      </p>

      <div className="flex flex-wrap gap-2">
        {FULL_ACCESS_ROLES.map((role) => (
          <BaseBadge key={role} variant="success">
            {role} — Full access
          </BaseBadge>
        ))}
      </div>

      {EDITABLE_ROLES.map((role) => (
        <BaseCard key={role}>
          <CardHeader>
            <h3 className="text-sm font-semibold text-text">{role}</h3>
          </CardHeader>
          <CardBody className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
                  <th className="py-1.5 pr-3 font-medium">Module</th>
                  {Object.values(ACTIONS).map((action) => (
                    <th key={action} className="px-2 py-1.5 text-center font-medium capitalize">
                      {action}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.values(MODULES).map((module) => {
                  const active = rolePermissions[role]?.[module] ?? [];
                  return (
                    <tr key={module} className="border-b border-border last:border-0">
                      <td className="py-2 pr-3 text-text">{MODULE_LABELS[module] ?? module}</td>
                      {Object.values(ACTIONS).map((action) => (
                        <td key={action} className="px-2 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={active.includes(action)}
                            disabled={!canEdit}
                            onChange={() => toggleAction(role, module, action)}
                            aria-label={`${role} ${MODULE_LABELS[module] ?? module} ${action}`}
                            className="size-4 accent-primary disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </BaseCard>
      ))}
    </div>
  );
}
