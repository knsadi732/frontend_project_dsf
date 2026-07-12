import {
  LayoutDashboard,
  Users,
  Package,
  Contact,
  Truck,
  ShoppingCart,
  Warehouse,
  Factory,
  ShoppingBag,
  Wallet,
  Bell,
  FileBarChart,
  Undo2,
} from 'lucide-react';
import { MODULES } from '@/constants/roles';

export const NAV_ITEMS = [
  { module: MODULES.DASHBOARD, label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { module: MODULES.PRODUCTS, label: 'Products', to: '/products', icon: Package },
  { module: MODULES.CUSTOMERS, label: 'Customers', to: '/customers', icon: Contact },
  { module: MODULES.VENDORS, label: 'Vendors', to: '/vendors', icon: Truck },
  { module: MODULES.PURCHASES, label: 'Purchases', to: '/purchases', icon: ShoppingCart },
  { module: MODULES.INVENTORY, label: 'Inventory', to: '/inventory', icon: Warehouse },
  { module: MODULES.PRODUCTION, label: 'Production', to: '/production', icon: Factory },
  { module: MODULES.SALES, label: 'Sales', to: '/sales', icon: ShoppingBag },
  { module: MODULES.FINANCE, label: 'Finance', to: '/finance', icon: Wallet },
  { module: MODULES.RETURNS, label: 'Returns', to: '/returns', icon: Undo2 },
  { module: MODULES.NOTIFICATIONS, label: 'Notifications', to: '/notifications', icon: Bell },
  { module: MODULES.REPORTS, label: 'Reports', to: '/reports', icon: FileBarChart },
  { module: MODULES.USERS, label: 'Employees', to: '/users', icon: Users },
];
