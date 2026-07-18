import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('vendors');

// Backend's party.validator.js only knows {name, phone, email, gstin,
// address, status} — map the UI's `gstNumber` onto it. Fields with no
// backend equivalent (vendorType, addresses[], creditLimit, creditDays,
// qualityRating) pass through unchanged but won't persist server-side.
function toBackendPayload(payload) {
  const { gstNumber, ...rest } = payload;
  return { ...rest, ...(gstNumber !== undefined && { gstin: gstNumber }) };
}

function fromBackendVendor(vendor) {
  return { ...vendor, gstNumber: vendor.gstin };
}

export const vendorApi = {
  ...baseApi,
  list: (params) => baseApi.list(params).then(({ data, total }) => ({ data: data.map(fromBackendVendor), total })),
  get: (id) => baseApi.get(id).then(fromBackendVendor),
  create: (payload) => baseApi.create(toBackendPayload(payload)).then(fromBackendVendor),
  update: (id, payload) => baseApi.update(id, toBackendPayload(payload)).then(fromBackendVendor),
};
