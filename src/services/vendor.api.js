import { createCrudApi } from '@/services/api/createCrudApi';

const baseApi = createCrudApi('vendors');

// Backend's party.validator.js (createVendor/updateVendor) now really does
// support the extended fields: vendorType, addresses[] ({label?, address}),
// bankAccountNumber, bankIfsc, bankName, creditDays, creditLimit,
// qualityRating, paymentTerms — all real columns (migration
// 0059_alter_vendors_add_extended_fields.sql). Field names already match
// the UI's camelCase 1:1, so writes need no renaming beyond gstNumber.
function toBackendPayload(payload) {
  const { gstNumber, ...rest } = payload;
  return { ...rest, ...(gstNumber !== undefined && { gstin: gstNumber }) };
}

// Responses are raw `SELECT * FROM vendors` rows — snake_case Postgres
// columns, no case-conversion layer on the backend.
function fromBackendVendor(vendor) {
  return {
    ...vendor,
    gstNumber: vendor.gstin,
    vendorType: vendor.vendorType ?? vendor.vendor_type,
    bankAccountNumber: vendor.bankAccountNumber ?? vendor.bank_account_number,
    bankIfsc: vendor.bankIfsc ?? vendor.bank_ifsc,
    bankName: vendor.bankName ?? vendor.bank_name,
    creditDays: vendor.creditDays ?? vendor.credit_days,
    creditLimit: vendor.creditLimit ?? vendor.credit_limit,
    qualityRating: vendor.qualityRating ?? vendor.quality_rating,
    paymentTerms: vendor.paymentTerms ?? vendor.payment_terms,
  };
}

export const vendorApi = {
  ...baseApi,
  list: (params) => baseApi.list(params).then(({ data, total }) => ({ data: data.map(fromBackendVendor), total })),
  get: (id) => baseApi.get(id).then(fromBackendVendor),
  create: (payload) => baseApi.create(toBackendPayload(payload)).then(fromBackendVendor),
  update: (id, payload) => baseApi.update(id, toBackendPayload(payload)).then(fromBackendVendor),
};
