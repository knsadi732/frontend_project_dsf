function resourceKeys(name) {
  return {
    all: [name],
    list: (filters) => [name, 'list', filters],
    detail: (id) => [name, 'detail', id],
  };
}

export const queryKeys = {
  auth: { me: ['auth', 'me'] },
  users: resourceKeys('users'),
  departments: resourceKeys('departments'),
  designations: resourceKeys('designations'),
  categories: resourceKeys('categories'),
  productVariants: resourceKeys('productVariants'),
  customers: resourceKeys('customers'),
  vendors: resourceKeys('vendors'),
  branches: resourceKeys('branches'),
  warehouses: resourceKeys('warehouses'),
  company: resourceKeys('company'),
  brands: resourceKeys('brands'),
  loginHistory: resourceKeys('loginHistory'),
  attendance: resourceKeys('attendance'),
  leaves: resourceKeys('leaves'),
  assets: resourceKeys('assets'),
  auditLogs: resourceKeys('auditLogs'),
  products: resourceKeys('products'),
  purchases: resourceKeys('purchases'),
  inventory: resourceKeys('inventory'),
  production: resourceKeys('production'),
  sales: resourceKeys('sales'),
  finance: resourceKeys('finance'),
  returns: resourceKeys('returns'),
  notifications: resourceKeys('notifications'),
  reports: resourceKeys('reports'),
  dashboard: { all: ['dashboard'] },
};
