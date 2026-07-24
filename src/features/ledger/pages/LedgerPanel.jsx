import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useLedgerQuery } from '@/features/ledger/queries/useLedgerQuery';
import { useRecordTransaction } from '@/features/ledger/mutations/useRecordTransaction';
import { LedgerTable } from '@/features/ledger/components/LedgerTable';
import { AddFundModal } from '@/features/ledger/components/AddFundModal';
import { AppButton } from '@/components/ui/AppButton';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function LedgerPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [addFundOpen, setAddFundOpen] = useState(false);

  const { data, isLoading, isFetching, refetch } = useLedgerQuery();
  const recordTransaction = useRecordTransaction();
  const allEntries = data?.data ?? [];
  const start = (page - 1) * pageSize;
  const pageEntries = allEntries.slice(start, start + pageSize);
  const closingBalance = allEntries[allEntries.length - 1]?.balance ?? 0;

  const handleAddFund = (values) => {
    recordTransaction.mutateAsync(values).then(() => setAddFundOpen(false));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          General ledger — every finance transaction (debit/credit), oldest first, with a running balance.
        </p>
        <div className="flex items-center gap-3">
          <p className="text-sm font-bold text-text">
            Balance: <span className={closingBalance >= 0 ? 'text-success' : 'text-danger'}>
              {closingBalance >= 0 ? 'Cr' : 'Dr'} ₹{Math.abs(closingBalance).toLocaleString('en-IN')}
            </span>
          </p>
          <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
            <AppButton onClick={() => setAddFundOpen(true)}>
              <Plus className="size-4" />
              Add fund
            </AppButton>
          </Can>
          <RefreshButton onClick={refetch} isFetching={isFetching} />
        </div>
      </div>

      <LedgerTable
        entries={pageEntries}
        total={allEntries.length}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      <AddFundModal
        open={addFundOpen}
        onClose={() => setAddFundOpen(false)}
        onSubmit={handleAddFund}
        isSubmitting={recordTransaction.isPending}
      />
    </div>
  );
}
