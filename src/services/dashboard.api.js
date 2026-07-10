import { apiClient } from '@/services/api/axios';
import { env } from '@/config/env';

const MOCK_SUMMARY = {
  stats: [
    { key: 'sales', label: 'Sales (30d)', value: '₹18,42,300', delta: '+12.4%' },
    { key: 'purchases', label: 'Purchases (30d)', value: '₹9,86,120', delta: '+4.1%' },
    { key: 'inventory', label: 'Inventory Value', value: '₹32,10,500', delta: '-1.8%' },
    { key: 'production', label: 'Open Work Orders', value: '27', delta: '+3' },
  ],
  salesTrend: [
    { month: 'Jan', sales: 320000 },
    { month: 'Feb', sales: 410000 },
    { month: 'Mar', sales: 380000 },
    { month: 'Apr', sales: 460000 },
    { month: 'May', sales: 502000 },
    { month: 'Jun', sales: 470000 },
  ],
  recentActivity: [
    { id: '1', title: 'New sales order #SO-1042', description: 'Customer: Metro Footwear', timestamp: '10 min ago' },
    { id: '2', title: 'Purchase order approved #PO-885', description: 'Supplier: Leo Leathers', timestamp: '1 hr ago' },
    { id: '3', title: 'Low stock alert', description: 'SKU DSF-RUN-42 below reorder level', timestamp: '3 hr ago' },
  ],
};

export const dashboardApi = {
  summary: () => {
    if (env.mockAuth) return Promise.resolve(MOCK_SUMMARY);
    return apiClient.get('/dashboard/summary').then((res) => res.data);
  },
};
