import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('customers');

// Backend's party.validator.js knows {name, phone, email, gstin,
// billingAddress, shippingAddress, status, customerType} — map the UI's
// `gstNumber`/`address` onto it. Fields with no backend equivalent
// (addresses[], creditLimit, creditDays) pass through unchanged but won't
// persist server-side.
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
// customer_type), unlike the camelCase the Joi validator expects on writes.
function fromBackendCustomer(customer) {
  return {
    ...customer,
    gstNumber: customer.gstin,
    address: customer.billing_address,
    customerType: customer.customer_type,
  };
}

export const customerApi = {
  ...baseApi,
  list: (params) => baseApi.list(params).then(({ data, total }) => ({ data: data.map(fromBackendCustomer), total })),
  get: (id) => baseApi.get(id).then(fromBackendCustomer),
  create: (payload) => baseApi.create(toBackendPayload(payload)).then(fromBackendCustomer),
  update: (id, payload) => baseApi.update(id, toBackendPayload(payload)).then(fromBackendCustomer),
};
