import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_PURCHASES = [
  {
    id: '1',
    poNumber: 'PO-1001',
    supplier: 'Leo Leathers',
    orderDate: '2026-06-20',
    status: 'approved',
    items: [
      { product: 'Finished Leather - Full Grain (sq ft)', quantity: 800, rate: 210 },
      { product: 'Leather Dye - Black (litre)', quantity: 40, rate: 425 },
    ],
    total: 185000,
  },
  {
    id: '2',
    poNumber: 'PO-1002',
    supplier: 'Sole Components Pvt Ltd',
    orderDate: '2026-06-28',
    status: 'pending',
    items: [
      { product: 'PU Sole - Size 8 (pair)', quantity: 1000, rate: 65 },
      { product: 'PU Sole - Size 9 (pair)', quantity: 500, rate: 55 },
    ],
    total: 92500,
  },
  {
    id: '3',
    poNumber: 'PO-1003',
    supplier: 'Metro Packaging Co',
    orderDate: '2026-07-02',
    status: 'draft',
    items: [
      { product: 'Shoe Box - Standard', quantity: 1200, rate: 18 },
      { product: 'Packing Tape Roll', quantity: 300, rate: 42 },
    ],
    total: 34200,
  },
];

export const purchaseApi = createCrudApi('purchases', MOCK_PURCHASES, { dateField: 'orderDate' });
