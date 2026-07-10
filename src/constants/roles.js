export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  VIEWER: 'VIEWER',
};

export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
};

const ALL_ACTIONS = Object.values(ACTIONS);
const READ_ONLY = [ACTIONS.VIEW];
const NO_DELETE = [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT];

export const MODULES = {
  DASHBOARD: 'dashboard',
  USERS: 'users',
  PRODUCTS: 'products',
  PURCHASES: 'purchases',
  INVENTORY: 'inventory',
  PRODUCTION: 'production',
  SALES: 'sales',
  FINANCE: 'finance',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
};

/**
 * Module -> allowed actions per role. SUPER_ADMIN and ADMIN get full access
 * by default (see hasPermission); this matrix only needs to encode the
 * restricted roles.
 */
export const ROLE_PERMISSIONS = {
  [ROLES.MANAGER]: {
    [MODULES.DASHBOARD]: ALL_ACTIONS,
    [MODULES.USERS]: READ_ONLY,
    [MODULES.PRODUCTS]: NO_DELETE,
    [MODULES.PURCHASES]: NO_DELETE,
    [MODULES.INVENTORY]: NO_DELETE,
    [MODULES.PRODUCTION]: NO_DELETE,
    [MODULES.SALES]: NO_DELETE,
    [MODULES.FINANCE]: READ_ONLY,
    [MODULES.NOTIFICATIONS]: ALL_ACTIONS,
    [MODULES.REPORTS]: READ_ONLY,
  },
  [ROLES.STAFF]: {
    [MODULES.DASHBOARD]: READ_ONLY,
    [MODULES.USERS]: [],
    [MODULES.PRODUCTS]: READ_ONLY,
    [MODULES.PURCHASES]: READ_ONLY,
    [MODULES.INVENTORY]: NO_DELETE,
    [MODULES.PRODUCTION]: NO_DELETE,
    [MODULES.SALES]: NO_DELETE,
    [MODULES.FINANCE]: [],
    [MODULES.NOTIFICATIONS]: READ_ONLY,
    [MODULES.REPORTS]: READ_ONLY,
  },
  [ROLES.VIEWER]: {
    [MODULES.DASHBOARD]: READ_ONLY,
    [MODULES.USERS]: [],
    [MODULES.PRODUCTS]: READ_ONLY,
    [MODULES.PURCHASES]: READ_ONLY,
    [MODULES.INVENTORY]: READ_ONLY,
    [MODULES.PRODUCTION]: READ_ONLY,
    [MODULES.SALES]: READ_ONLY,
    [MODULES.FINANCE]: READ_ONLY,
    [MODULES.NOTIFICATIONS]: READ_ONLY,
    [MODULES.REPORTS]: READ_ONLY,
  },
};

const FULL_ACCESS_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

export function hasPermission(role, module, action = ACTIONS.VIEW) {
  if (!role) return false;
  if (FULL_ACCESS_ROLES.includes(role)) return true;
  const modulePermissions = ROLE_PERMISSIONS[role]?.[module] ?? [];
  return modulePermissions.includes(action);
}
