import { createCrudApi } from '@/services/api/createCrudApi';

const MOCK_CUSTOMERS = [
  {
    id: '1',
    name: 'Metro Footwear',
    customerType: 'wholesale',
    companyName: 'Metro Footwear Pvt Ltd',
    phone: '9811100001',
    email: 'accounts@metrofootwear.example',
    address: 'Karol Bagh, Delhi',
    gstNumber: '07AAACM1234F1Z5',
    creditLimit: 500000,
    creditDays: 30,
    addresses: [
      { type: 'billing', contactPerson: 'Metro Accounts', phone: '9811100001', addressLine: 'Karol Bagh Market', city: 'Delhi', state: 'Delhi', country: 'India', postalCode: '110005' },
    ],
    status: 'active',
  },
  {
    id: '2',
    name: 'City Shoe Mart',
    customerType: 'retail',
    companyName: '',
    phone: '9811100002',
    email: 'purchase@cityshoemart.example',
    address: 'MG Road, Agra',
    gstNumber: '09AAACC5678G1Z3',
    creditLimit: 100000,
    creditDays: 15,
    addresses: [],
    status: 'active',
  },
  {
    id: '3',
    name: 'Sharma Footwear Traders',
    customerType: 'distributor',
    companyName: 'Sharma Footwear Traders',
    phone: '9811100003',
    email: 'contact@sharmafootwear.example',
    address: 'Sadar Bazaar, Agra',
    gstNumber: '09AAACS9012H1Z1',
    creditLimit: 300000,
    creditDays: 30,
    addresses: [],
    status: 'active',
  },
];

export const customerApi = createCrudApi('customers', MOCK_CUSTOMERS);
