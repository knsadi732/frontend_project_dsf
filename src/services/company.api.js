import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_COMPANY = [
  {
    id: '1',
    name: 'DS Footwear Pvt Ltd',
    gstNumber: '09AABCD1234E1Z5',
    panNumber: 'AABCD1234E',
    cin: 'U19201UP2020PTC123456',
    address: 'Industrial Area, Phase 2',
    city: 'Agra',
    state: 'Uttar Pradesh',
    country: 'India',
    postalCode: '282006',
    phone: '9000000001',
    email: 'info@dsfootwear.example',
    financialYearStart: '2026-04-01',
    financialYearEnd: '2027-03-31',
    status: 'active',
  },
];

export const companyApi = createCrudApi('company', MOCK_COMPANY);
