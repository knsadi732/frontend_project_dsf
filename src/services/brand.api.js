import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_BRANDS = [
  { id: '1', name: 'DS Footwear', country: 'India', description: 'In-house manufacturing brand', status: 'active' },
  { id: '2', name: 'Nike', country: 'USA', description: 'Licensed distribution', status: 'active' },
  { id: '3', name: 'Adidas', country: 'Germany', description: 'Licensed distribution', status: 'active' },
  { id: '4', name: 'Puma', country: 'Germany', description: 'Licensed distribution', status: 'active' },
];

export const brandApi = createCrudApi('brands', MOCK_BRANDS);
