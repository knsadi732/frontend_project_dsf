import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_PRODUCT_VARIANTS = [];

export const productVariantApi = createCrudApi('productVariants', MOCK_PRODUCT_VARIANTS);
