import { apiClient } from '@/services/api/axios';

// Backend rows are snake_case Postgres columns (no case-conversion layer —
// same convention as sales.api.js) plus a server-computed totalAnnualCtc.
function fromBackendCompensation(record) {
  return {
    id: record.id,
    userId: record.user_id,
    effectiveFrom: record.effective_from,
    effectiveTo: record.effective_to,
    annualNetSalary: Number(record.annual_net_salary),
    pfApplicable: record.pf_applicable,
    gratuityApplicable: record.gratuity_applicable,
    healthInsuranceApplicable: record.health_insurance_applicable,
    annualTravelReimbursementCap: Number(record.annual_travel_reimbursement_cap),
    travelReimbursementNotes: record.travel_reimbursement_notes,
    bonusStructure: record.bonus_structure ?? [],
    remarks: record.remarks,
    totalAnnualCtc: Number(record.totalAnnualCtc ?? record.annual_net_salary),
    components: (record.components ?? []).map((c) => ({
      name: c.component_name,
      type: c.component_type,
      annualAmount: Number(c.annual_amount),
      isTaxable: c.is_taxable,
      notes: c.notes,
    })),
  };
}

export const employeeCompensationApi = {
  getForUser: (userId) =>
    apiClient
      .get(`/employee-compensation/user/${userId}`, { silent: true })
      .then((res) => fromBackendCompensation(res.data.data)),
};
