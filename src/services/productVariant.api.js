import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_PRODUCT_VARIANTS = [
  { id: '1', productId: '1', size: 'Standard', color: 'Default', sku: 'DSF-LTH-101', barcode: '8901234500011', mrp: 2499, sellingPrice: 2499, status: 'active' },
  { id: '2', productId: '2', size: 'Standard', color: 'Default', sku: 'DSF-RUN-42', barcode: '8901234500028', mrp: 1899, sellingPrice: 1899, status: 'active' },
  { id: '3', productId: '3', size: 'Standard', color: 'Default', sku: 'DSF-CAS-77', barcode: '8901234500035', mrp: 1299, sellingPrice: 1299, status: 'active' },
  { id: '4', productId: '4', size: 'Standard', color: 'Default', sku: 'DSF-SFT-15', barcode: '8901234500042', mrp: 2999, sellingPrice: 2999, status: 'active' },
];

export const productVariantApi = createCrudApi('productVariants', MOCK_PRODUCT_VARIANTS);
