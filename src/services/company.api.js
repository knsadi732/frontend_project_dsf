import { apiClient } from '@/services/api/axios';

// Backend's `company` resource is a tenant singleton (GET/PATCH /company,
// no id/list/create/delete) — unlike createCrudApi's list-shaped wrapper,
// so this talks to it directly. Only `name`/`gstin` have a backend
// equivalent (updateCompany validator); other UI fields (panNumber, cin,
// address block, financial year) have no backend column yet — sent anyway
// (the validator's `stripUnknown` drops them silently) but won't persist.
function toBackendPayload(company) {
  return { name: company.name, gstin: company.gstNumber };
}

function fromBackendCompany(company) {
  return { ...company, gstNumber: company.gstin };
}

export const companyApi = {
  // `get`/`update` accept and ignore a leading id (the feature layer still
  // calls `companyApi.get('1')` / `companyApi.update('1', payload)` from
  // when this was a createCrudApi-shaped resource) since /company is a
  // tenant singleton with no id in its URL.
  get: () => apiClient.get('/company').then((res) => fromBackendCompany(res.data.data)),
  update: (idOrPayload, maybePayload) => {
    const payload = maybePayload ?? idOrPayload;
    return apiClient.patch('/company', toBackendPayload(payload)).then((res) => fromBackendCompany(res.data.data));
  },
};
