import { useEmployeeCompensationQuery } from '@/features/users/queries/useEmployeeCompensationQuery';
import { BaseBadge } from '@/components/ui/BaseBadge';

function formatMoney(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN')}`;
}

// Renders nothing at all on a 403 (no employee_compensation.view
// permission) or 404 (employee has no active structure) — both are normal,
// expected outcomes for most viewers/employees, not failures worth
// surfacing (see employeeCompensation.api.js's `silent: true`).
export function EmployeeCompensationSection({ userId }) {
  const { data: compensation, isLoading, isError } = useEmployeeCompensationQuery(userId);

  if (isLoading || isError || !compensation) return null;

  const fixedComponents = compensation.components.filter((c) => c.type === 'fixed_salary');
  const otherComponents = compensation.components.filter((c) => c.type !== 'fixed_salary');

  return (
    <div className="flex flex-col">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Compensation</h3>

      <div className="flex items-center justify-between border-b border-border py-2.5">
        <span className="text-sm text-text-muted">Net salary (annual)</span>
        <span className="text-sm font-medium text-text">{formatMoney(compensation.annualNetSalary)}</span>
      </div>
      <div className="flex items-center justify-between border-b border-border py-2.5">
        <span className="text-sm text-text-muted">Total annual CTC</span>
        <span className="text-sm font-semibold text-text">{formatMoney(compensation.totalAnnualCtc)}</span>
      </div>
      <div className="flex items-center justify-between border-b border-border py-2.5">
        <span className="text-sm text-text-muted">Effective period</span>
        <span className="text-sm font-medium text-text">
          {compensation.effectiveFrom} {compensation.effectiveTo ? `– ${compensation.effectiveTo}` : '(ongoing)'}
        </span>
      </div>
      <div className="flex items-center justify-between border-b border-border py-2.5">
        <span className="text-sm text-text-muted">PF / Gratuity / Health insurance</span>
        <div className="flex gap-1">
          <BaseBadge variant={compensation.pfApplicable ? 'success' : 'default'}>PF {compensation.pfApplicable ? 'yes' : 'no'}</BaseBadge>
          <BaseBadge variant={compensation.gratuityApplicable ? 'success' : 'default'}>Gratuity {compensation.gratuityApplicable ? 'yes' : 'no'}</BaseBadge>
          <BaseBadge variant={compensation.healthInsuranceApplicable ? 'success' : 'default'}>Health {compensation.healthInsuranceApplicable ? 'yes' : 'no'}</BaseBadge>
        </div>
      </div>

      {fixedComponents.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-text-muted">Fixed salary breakup</p>
          {fixedComponents.map((c) => (
            <div key={c.name} className="flex items-center justify-between py-1 text-sm">
              <span className="text-text-muted">{c.name}</span>
              <span className="text-text">{formatMoney(c.annualAmount)}</span>
            </div>
          ))}
        </div>
      )}

      {otherComponents.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-text-muted">Reimbursements &amp; benefits (non-taxable unless noted)</p>
          {otherComponents.map((c) => (
            <div key={c.name} className="flex items-center justify-between py-1 text-sm" title={c.notes ?? undefined}>
              <span className="text-text-muted">{c.name}</span>
              <span className="text-text">{formatMoney(c.annualAmount)}</span>
            </div>
          ))}
        </div>
      )}

      {compensation.annualTravelReimbursementCap > 0 && (
        <p className="mt-3 text-xs leading-relaxed text-text-muted">
          Travel/vacation reimbursement cap: {formatMoney(compensation.annualTravelReimbursementCap)}/year.{' '}
          {compensation.travelReimbursementNotes}
        </p>
      )}

      {compensation.bonusStructure.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-text-muted">Performance bonus</p>
          {compensation.bonusStructure.map((rule) => (
            <p key={rule.financialYear} className="py-0.5 text-xs leading-relaxed text-text-muted">
              <span className="font-medium text-text">{rule.financialYear}:</span> {rule.notes}
            </p>
          ))}
        </div>
      )}

      {compensation.remarks && <p className="mt-3 text-xs italic text-text-muted">{compensation.remarks}</p>}
    </div>
  );
}
