import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('customers');

// Backend's party.validator.js knows {name, phone, email, gstin,
// billingAddress, shippingAddress, city, state, postalCode, country, status,
// customerType} — map the UI's `gstNumber`/`address` onto it. creditDays has
// no backend equivalent and passes through unchanged but won't persist.
function toBackendPayload(payload) {
  const { gstNumber, address, ...rest } = payload;
  return {
    ...rest,
    ...(gstNumber !== undefined && { gstin: gstNumber }),
    ...(address !== undefined && { billingAddress: address }),
  };
}

// Responses are raw `SELECT * FROM customers` / `RETURNING *` rows
// (party.repository.js) — snake_case Postgres columns (billing_address,
// customer_type, postal_code), unlike the camelCase the Joi validator expects
// on writes. city/state/country are already single words so pass through
// unchanged in both directions.
function fromBackendCustomer(customer) {
  return {
    ...customer,
    gstNumber: customer.gstin,
    address: customer.billing_address,
    customerType: customer.customer_type,
    postalCode: customer.postal_code,
  };
}

export const customerApi = {
  ...baseApi,
  list: (params) => baseApi.list(params).then(({ data, total }) => ({ data: data.map(fromBackendCustomer), total })),
  get: (id) => baseApi.get(id).then(fromBackendCustomer),
  create: (payload) => baseApi.create(toBackendPayload(payload)).then(fromBackendCustomer),
  update: (id, payload) => baseApi.update(id, toBackendPayload(payload)).then(fromBackendCustomer),
};
