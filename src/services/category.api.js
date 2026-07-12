import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_CATEGORIES = [
  { id: '1', name: 'Footwear', categoryCode: 'FOOTWEAR', parentId: null, status: 'active' },
  { id: '2', name: 'Shoes', categoryCode: 'SHOES', parentId: '1', status: 'active' },
  { id: '3', name: 'Sports Shoes', categoryCode: 'SPORTS-SHOES', parentId: '2', status: 'active' },
  { id: '4', name: 'Casual Shoes', categoryCode: 'CASUAL-SHOES', parentId: '2', status: 'active' },
  { id: '5', name: 'Formal Shoes', categoryCode: 'FORMAL-SHOES', parentId: '2', status: 'active' },
  { id: '6', name: 'Sandals', categoryCode: 'SANDALS', parentId: '1', status: 'active' },
  { id: '7', name: 'Slippers', categoryCode: 'SLIPPERS', parentId: '1', status: 'active' },
  { id: '8', name: 'Boots', categoryCode: 'BOOTS', parentId: '1', status: 'active' },
];

export const categoryApi = createCrudApi('categories', MOCK_CATEGORIES);
