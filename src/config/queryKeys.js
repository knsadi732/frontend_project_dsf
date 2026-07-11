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
  branches: resourceKeys('branches'),
  warehouses: resourceKeys('warehouses'),
  loginHistory: resourceKeys('loginHistory'),
  products: resourceKeys('products'),
  purchases: resourceKeys('purchases'),
  inventory: resourceKeys('inventory'),
  production: resourceKeys('production'),
  sales: resourceKeys('sales'),
  finance: resourceKeys('finance'),
  notifications: resourceKeys('notifications'),
  reports: resourceKeys('reports'),
  dashboard: { all: ['dashboard'] },
};
