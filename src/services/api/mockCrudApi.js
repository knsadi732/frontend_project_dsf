/**
 * In-memory CRUD backend used when no real API server is available
 * (VITE_MOCK_AUTH=true). Mirrors the response shape of createCrudApi
 * so feature pages work identically against mock or real data.
 *
 * `records` is mutated in place (push/splice/index-assignment) rather than
 * copied, so callers that share the same array reference (see mockDb.js)
 * stay in sync with each other — that's what lets business rules in
 * businessRules.js read/write the same sales/inventory/production/finance
 * data the CRUD layer exposes.
 */
function matchesSearch(record, search) {
  if (!search) return true;
  const needle = search.toLowerCase();
  return Object.values(record).some((value) => String(value ?? '').toLowerCase().includes(needle));
}

function nextRecordId(records) {
  return String(records.reduce((max, record) => Math.max(max, Number(record.id) || 0), 0) + 1);
}

export function createMockCrudApi(resource, records, options = {}) {
  const { statusField = 'status', dateField, hooks = {} } = options;

  return {
    list: ({ search, status, dateFrom, dateTo, page = 1, pageSize = 20 } = {}) => {
      let filtered = records.filter((record) => matchesSearch(record, search));

      if (status) {
        filtered = filtered.filter((record) => record[statusField] === status);
      }

      if (dateField && (dateFrom || dateTo)) {
        filtered = filtered.filter((record) => {
          const value = record[dateField];
          if (!value) return false;
          if (dateFrom && value < dateFrom) return false;
          if (dateTo && value > dateTo) return false;
          return true;
        });
      }

      const start = (page - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize);
      return Promise.resolve({ data, total: filtered.length });
    },

    get: (id) => {
      const record = records.find((item) => String(item.id) === String(id));
      if (!record) return Promise.reject(new Error(`${resource} record not found`));
      return Promise.resolve(record);
    },

    create: (payload) => {
      let record = { id: nextRecordId(records), ...payload };
      if (hooks.afterCreate) record = hooks.afterCreate(record) ?? record;
      records.unshift(record);
      return Promise.resolve(record);
    },

    update: (id, payload) => {
      const index = records.findIndex((item) => String(item.id) === String(id));
      if (index === -1) return Promise.reject(new Error(`${resource} record not found`));
      const previous = records[index];
      let next = { ...previous, ...payload };
      if (hooks.afterUpdate) next = hooks.afterUpdate(previous, next) ?? next;
      records[index] = next;
      return Promise.resolve(next);
    },

    remove: (id) => {
      const index = records.findIndex((item) => String(item.id) === String(id));
      if (index !== -1) records.splice(index, 1);
      return Promise.resolve({ id });
    },
  };
}
