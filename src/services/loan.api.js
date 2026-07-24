import { apiClient } from '@/services/api/axios';

// Money borrowed by the company from a bank/vendor/other lender.
// Outstanding balance is never stored on the loan itself — it's always
// derived server-side as `principal_amount - SUM(repayments.principal_component)`
// (only present on the GET /loans/:id detail response, not the list).
// Disbursement auto-posts a credit finance_transaction; each repayment
// auto-posts a debit — both flow into /finance/ledger/summary automatically.
function fromBackendLoan(loan) {
  return {
    id: loan.id,
    loanNumber: loan.loanNumber ?? loan.loan_number,
    branchId: loan.branchId ?? loan.branch_id,
    lenderName: loan.lenderName ?? loan.lender_name,
    lenderType: loan.lenderType ?? loan.lender_type,
    principalAmount: Number(loan.principalAmount ?? loan.principal_amount),
    interestRate: Number(loan.interestRate ?? loan.interest_rate ?? 0),
    interestType: loan.interestType ?? loan.interest_type,
    startDate: loan.startDate ?? loan.start_date,
    tenureMonths: loan.tenureMonths ?? loan.tenure_months,
    status: loan.status,
    remarks: loan.remarks,
    repaidPrincipal: loan.repaidPrincipal != null ? Number(loan.repaidPrincipal) : undefined,
    outstandingBalance: loan.outstandingBalance != null ? Number(loan.outstandingBalance) : undefined,
  };
}

function fromBackendRepayment(row) {
  return {
    id: row.id,
    loanId: row.loanId ?? row.loan_id,
    amount: Number(row.amount),
    principalComponent: Number(row.principalComponent ?? row.principal_component),
    interestComponent: Number(row.interestComponent ?? row.interest_component),
    paidAt: row.paidAt ?? row.paid_at,
    remarks: row.remarks,
  };
}

export const loanApi = {
  // GET /loans/generate-number — previews (does not consume/reserve) the
  // next loan number, e.g. DSF-LN-0001.
  generateNumber: () => apiClient.get('/loans/generate-number').then((res) => res.data.data.loanNumber),
  list: ({ status, ...params } = {}) =>
    apiClient.get('/loans', { params: { ...params, ...(status && { status }) } }).then((res) => ({
      data: (res.data.data ?? []).map(fromBackendLoan),
      total: res.data.meta?.total_records ?? res.data.data.length,
    })),
  get: (id) => apiClient.get(`/loans/${id}`).then((res) => fromBackendLoan(res.data.data)),
  create: (payload) =>
    apiClient
      .post('/loans', {
        lenderName: payload.lenderName,
        lenderType: payload.lenderType,
        principalAmount: payload.principalAmount,
        interestRate: payload.interestRate,
        interestType: payload.interestType,
        startDate: payload.startDate,
        ...(payload.tenureMonths && { tenureMonths: payload.tenureMonths }),
        ...(payload.remarks && { remarks: payload.remarks }),
        ...(payload.branchId && { branchId: payload.branchId }),
      })
      .then((res) => fromBackendLoan(res.data.data)),
  // Manual terminal state for a loan that will never be repaid — only
  // valid from `active`.
  writeOff: (id) => apiClient.patch(`/loans/${id}/write-off`).then((res) => fromBackendLoan(res.data.data)),
  listRepayments: (id) =>
    apiClient.get(`/loans/${id}/repayments`).then((res) => (res.data.data ?? []).map(fromBackendRepayment)),
  // interestComponent is derived server-side as amount - principalComponent.
  // Loan auto-closes once outstandingBalance hits 0 — no separate close
  // call needed. Fails with LOAN_002 if the loan isn't active.
  createRepayment: (id, { amount, principalComponent, paidAt, remarks }) =>
    apiClient
      .post(`/loans/${id}/repayments`, {
        amount,
        principalComponent,
        ...(paidAt && { paidAt }),
        ...(remarks && { remarks }),
      })
      .then((res) => fromBackendRepayment(res.data.data)),
};
