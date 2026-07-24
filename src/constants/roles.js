/**
 * ERP Roles (plan.md Chapter 2, RBAC UI Engine) — department-scoped roles
 * instead of generic tiers, so each role maps to the module its own
 * department works in.
 */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OWNER: 'OWNER',
  ACCOUNTANT: 'ACCOUNTANT',
  CA: 'CA',
  PURCHASE: 'PURCHASE',
  INVENTORY: 'INVENTORY',
  PRODUCTION: 'PRODUCTION',
  SALES: 'SALES',
  DISPATCH: 'DISPATCH',
  CUSTOMER_SUPPORT: 'CUSTOMER_SUPPORT',
  EMPLOYEE: 'EMPLOYEE',
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
const NONE = [];

export const MODULES = {
  DASHBOARD: 'dashboard',
  USERS: 'users',
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  VENDORS: 'vendors',
  PURCHASES: 'purchases',
  INVENTORY: 'inventory',
  PRODUCTION: 'production',
  SALES: 'sales',
  FINANCE: 'finance',
  RETURNS: 'returns',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  ATTENDANCE: 'attendance',
};

/**
 * Module -> allowed actions per role. SUPER_ADMIN and OWNER get full access
 * by default (see hasPermission); every other role only sees its own
 * department's module edited, and everything else read-only or hidden.
 */
export const ROLE_PERMISSIONS = {
  [ROLES.ACCOUNTANT]: {
    [MODULES.DASHBOARD]: READ_ONLY,
    [MODULES.ATTENDANCE]: NONE,
    [MODULES.USERS]: NONE,
    [MODULES.PRODUCTS]: NONE,
    [MODULES.CUSTOMERS]: READ_ONLY,
    [MODULES.VENDORS]: READ_ONLY,
    [MODULES.PURCHASES]: READ_ONLY,
    [MODULES.INVENTORY]: NONE,
    [MODULES.PRODUCTION]: NONE,
    [MODULES.SALES]: NONE,
    [MODULES.FINANCE]: NO_DELETE,
    [MODULES.RETURNS]: READ_ONLY,
    [MODULES.NOTIFICATIONS]: READ_ONLY,
    [MODULES.REPORTS]: READ_ONLY,
  },
  // CA is a read-only compliance/audit role — sees everything (financials,
  // inventory valuation, salaries, sales/purchase history) for verification,
  // but never creates/edits/deletes anywhere. Inventory location detail
  // (warehouse/bin) is still hidden from CA at the screen level (see
  // InventoryTable.jsx) since that's operational, not financial, data.
  [ROLES.CA]: {
    [MODULES.DASHBOARD]: READ_ONLY,
    [MODULES.ATTENDANCE]: NONE,
    [MODULES.USERS]: READ_ONLY,
    [MODULES.PRODUCTS]: NONE,
    [MODULES.CUSTOMERS]: READ_ONLY,
    [MODULES.VENDORS]: READ_ONLY,
    [MODULES.PURCHASES]: READ_ONLY,
    [MODULES.INVENTORY]: READ_ONLY,
    [MODULES.PRODUCTION]: READ_ONLY,
    [MODULES.SALES]: READ_ONLY,
    [MODULES.FINANCE]: READ_ONLY,
    [MODULES.RETURNS]: READ_ONLY,
    [MODULES.NOTIFICATIONS]: READ_ONLY,
    [MODULES.REPORTS]: READ_ONLY,
  },
  [ROLES.PURCHASE]: {
    [MODULES.DASHBOARD]: READ_ONLY,
    [MODULES.ATTENDANCE]: NONE,
    [MODULES.USERS]: NONE,
    [MODULES.PRODUCTS]: READ_ONLY,
    [MODULES.CUSTOMERS]: NONE,
    [MODULES.VENDORS]: NO_DELETE,
    [MODULES.PURCHASES]: NO_DELETE,
    [MODULES.INVENTORY]: READ_ONLY,
    [MODULES.PRODUCTION]: NONE,
    [MODULES.SALES]: NONE,
    [MODULES.FINANCE]: NONE,
    [MODULES.RETURNS]: NONE,
    [MODULES.NOTIFICATIONS]: READ_ONLY,
    [MODULES.REPORTS]: READ_ONLY,
  },
  [ROLES.INVENTORY]: {
    [MODULES.DASHBOARD]: READ_ONLY,
    [MODULES.ATTENDANCE]: NONE,
    [MODULES.USERS]: NONE,
    [MODULES.PRODUCTS]: READ_ONLY,
    [MODULES.CUSTOMERS]: NONE,
    [MODULES.VENDORS]: READ_ONLY,
    [MODULES.PURCHASES]: READ_ONLY,
    [MODULES.INVENTORY]: NO_DELETE,
    [MODULES.PRODUCTION]: READ_ONLY,
    [MODULES.SALES]: NONE,
    [MODULES.FINANCE]: NONE,
    [MODULES.RETURNS]: NO_DELETE,
    [MODULES.NOTIFICATIONS]: READ_ONLY,
    [MODULES.REPORTS]: READ_ONLY,
  },
  [ROLES.PRODUCTION]: {
    [MODULES.DASHBOARD]: READ_ONLY,
    [MODULES.ATTENDANCE]: NONE,
    [MODULES.USERS]: NONE,
    [MODULES.PRODUCTS]: READ_ONLY,
    [MODULES.CUSTOMERS]: NONE,
    [MODULES.VENDORS]: NONE,
    [MODULES.PURCHASES]: READ_ONLY,
    [MODULES.INVENTORY]: READ_ONLY,
    [MODULES.PRODUCTION]: NO_DELETE,
    [MODULES.SALES]: NONE,
    [MODULES.FINANCE]: NONE,
    [MODULES.RETURNS]: NONE,
    [MODULES.NOTIFICATIONS]: READ_ONLY,
    [MODULES.REPORTS]: READ_ONLY,
  },
  [ROLES.SALES]: {
    [MODULES.DASHBOARD]: READ_ONLY,
    [MODULES.ATTENDANCE]: NONE,
    [MODULES.USERS]: NONE,
    [MODULES.PRODUCTS]: READ_ONLY,
    [MODULES.CUSTOMERS]: NO_DELETE,
    [MODULES.VENDORS]: NONE,
    [MODULES.PURCHASES]: NONE,
    [MODULES.INVENTORY]: READ_ONLY,
    [MODULES.PRODUCTION]: NONE,
    [MODULES.SALES]: NO_DELETE,
    [MODULES.FINANCE]: NONE,
    [MODULES.RETURNS]: NO_DELETE,
    [MODULES.NOTIFICATIONS]: READ_ONLY,
    [MODULES.REPORTS]: READ_ONLY,
  },
  [ROLES.DISPATCH]: {
    [MODULES.DASHBOARD]: READ_ONLY,
    [MODULES.ATTENDANCE]: NONE,
    [MODULES.USERS]: NONE,
    [MODULES.PRODUCTS]: NONE,
    [MODULES.CUSTOMERS]: READ_ONLY,
    [MODULES.VENDORS]: NONE,
    [MODULES.PURCHASES]: NONE,
    [MODULES.INVENTORY]: READ_ONLY,
    [MODULES.PRODUCTION]: NONE,
    [MODULES.SALES]: READ_ONLY,
    [MODULES.FINANCE]: NONE,
    [MODULES.RETURNS]: NO_DELETE,
    [MODULES.NOTIFICATIONS]: READ_ONLY,
    [MODULES.REPORTS]: NONE,
  },
  [ROLES.CUSTOMER_SUPPORT]: {
    [MODULES.DASHBOARD]: READ_ONLY,
    [MODULES.ATTENDANCE]: NONE,
    [MODULES.USERS]: NONE,
    [MODULES.PRODUCTS]: READ_ONLY,
    [MODULES.CUSTOMERS]: NO_DELETE,
    [MODULES.VENDORS]: NONE,
    [MODULES.PURCHASES]: NONE,
    [MODULES.INVENTORY]: NONE,
    [MODULES.PRODUCTION]: NONE,
    [MODULES.SALES]: READ_ONLY,
    [MODULES.FINANCE]: NONE,
    [MODULES.RETURNS]: NO_DELETE,
    [MODULES.NOTIFICATIONS]: ALL_ACTIONS,
    [MODULES.REPORTS]: NONE,
  },
  [ROLES.EMPLOYEE]: {
    [MODULES.DASHBOARD]: READ_ONLY,
    [MODULES.ATTENDANCE]: NONE,
    [MODULES.USERS]: NONE,
    [MODULES.PRODUCTS]: READ_ONLY,
    [MODULES.CUSTOMERS]: READ_ONLY,
    [MODULES.VENDORS]: READ_ONLY,
    [MODULES.PURCHASES]: READ_ONLY,
    [MODULES.INVENTORY]: READ_ONLY,
    [MODULES.PRODUCTION]: READ_ONLY,
    [MODULES.SALES]: READ_ONLY,
    [MODULES.FINANCE]: NONE,
    [MODULES.RETURNS]: READ_ONLY,
    [MODULES.NOTIFICATIONS]: READ_ONLY,
    [MODULES.REPORTS]: READ_ONLY,
  },
};

export const FULL_ACCESS_ROLES = [ROLES.SUPER_ADMIN, ROLES.OWNER];

// backend_project_dsf seeds its sole full-access system role as 'admin'
// (lowercase, and named differently from ROLES.SUPER_ADMIN) — normalize
// role keys to uppercase here, in one place, so callers never have to care
// whether a role came from the mock data, the real backend, or user input.
const ROLE_KEY_ALIASES = {
  ADMIN: ROLES.SUPER_ADMIN,
};

function normalizeRoleKey(role) {
  const upper = String(role).toUpperCase();
  return ROLE_KEY_ALIASES[upper] ?? upper;
}

export function hasPermission(role, module, action = ACTIONS.VIEW, permissions = ROLE_PERMISSIONS) {
  if (!role) return false;
  const key = normalizeRoleKey(role);
  if (FULL_ACCESS_ROLES.includes(key)) return true;
  const modulePermissions = permissions[key]?.[module] ?? [];
  return modulePermissions.includes(action);
}
