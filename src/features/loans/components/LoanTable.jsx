import { AppTable } from '@/components/ui/AppTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CancelButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';

const STATUS_VARIANT = { active: 'warning', closed: 'success', written_off: 'danger' };

export function LoanTable({ loans, isLoading, page, pageSize, total, onPageChange, onPageSizeChange, onRowClick, onWriteOff }) {
  const columns = [
    { key: 'loanNumber', header: 'Loan #' },
    { key: 'lenderName', header: 'Lender', render: (row) => <span className="capitalize">{row.lenderName} <span className="text-text-muted">({row.lenderType})</span></span> },
    { key: 'principalAmount', header: 'Principal', render: (row) => `₹${row.principalAmount.toLocaleString('en-IN')}` },
    { key: 'interestRate', header: 'Interest', render: (row) => `${row.interestRate}% (${row.interestType})` },
    { key: 'startDate', header: 'Start date' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} variantMap={STATUS_VARIANT} /> },
    {
      key: 'actions',
      header: '',
      render: (row) =>
        row.status === 'active' && (
          <div className="flex justify-end">
            <Can module={MODULES.FINANCE} action={ACTIONS.EDIT}>
              <CancelButton label="Write off loan" onClick={(e) => { e.stopPropagation(); onWriteOff(row); }} />
            </Can>
          </div>
        ),
    },
  ];

  return (
    <AppTable
      columns={columns}
      data={loans}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRowClick={onRowClick}
      emptyMessage="No loans recorded yet"
    />
  );
}
