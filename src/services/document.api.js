import { apiClient } from '@/services/api/axios';

// No frontend feature consumes this yet — added at the service layer to
// mirror ApiList.md; wiring an upload/attachments UI is a separate
// feature-build task. Real backend only (document.routes.js requires a
// real multipart upload target — no mock branch here).
export const documentApi = {
  list: (params) =>
    apiClient.get('/documents', { params }).then((res) => ({
      data: res.data.data,
      total: res.data.meta?.total_records ?? res.data.data.length,
    })),
  get: (id) => apiClient.get(`/documents/${id}`).then((res) => res.data.data),
  // `entityType` is required by document.validator.js:
  // product | vendor | employee | invoice | gst_certificate
  upload: ({ file, entityType, entityId, branchId, warehouseId, isPublic }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    if (entityId) formData.append('entityId', entityId);
    if (branchId) formData.append('branchId', branchId);
    if (warehouseId) formData.append('warehouseId', warehouseId);
    if (isPublic !== undefined) formData.append('isPublic', isPublic);
    return apiClient.post('/documents', formData).then((res) => res.data.data);
  },
  getDownloadUrl: (id) => apiClient.get(`/documents/${id}/download-url`).then((res) => res.data.data),
  remove: (id) => apiClient.delete(`/documents/${id}`).then((res) => res.data.data),
};
