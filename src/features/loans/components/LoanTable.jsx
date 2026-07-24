import { Ban } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
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
    {
      key: 'status',
      header: 'Status',
      render: (row) => <BaseBadge variant={STATUS_VARIANT[row.status] ?? 'default'}>{row.status?.replace(/_/g, ' ')}</BaseBadge>,
    },
    {
      key: 'actions',
      header: '',
      render: (row) =>
        row.status === 'active' && (
          <div className="flex justify-end">
            <Can module={MODULES.FINANCE} action={ACTIONS.EDIT}>
              <AppButton
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onWriteOff(row); }}
                aria-label="Write off loan"
                className="text-danger hover:bg-danger/10"
              >
                <Ban className="size-4" />
              </AppButton>
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
