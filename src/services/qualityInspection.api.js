import { createCrudApi } from '@/services/api/createCrudApi';
import { qualityInspections } from '@/services/api/mockDb';

// Ch12.17 Quality Inspection: a standalone record (not just a work-order
// stage) with accepted/rework/rejected quantities — `onWorkOrderStageChange`
// in businessRules.js requires an `accepted` inspection to exist before a
// work order can move to `completed`.
export const qualityInspectionApi = createCrudApi('qualityInspections', qualityInspections, {
  dateField: 'inspectedDate',
});
