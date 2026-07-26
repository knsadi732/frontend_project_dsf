import { useState } from 'react';
import { useLedgerQuery } from '@/features/ledger/queries/useLedgerQuery';
import { useLedgerSummaryQuery } from '@/features/ledger/queries/useLedgerSummaryQuery';
import { useRecordTransaction } from '@/features/ledger/mutations/useRecordTransaction';
import { LedgerTable } from '@/features/ledger/components/LedgerTable';
import { AddFundModal } from '@/features/ledger/components/AddFundModal';
import { CreateButton } from '@/components/ui/ActionButtons';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function LedgerPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [addFundOpen, setAddFundOpen] = useState(false);

  const { data, isLoading, isFetching, refetch } = useLedgerQuery();
  const { data: summary, refetch: refetchSummary } = useLedgerSummaryQuery();
  const recordTransaction = useRecordTransaction();
  const allEntries = data?.data ?? [];
  const start = (page - 1) * pageSize;
  const pageEntries = allEntries.slice(start, start + pageSize);
  const balance = summary?.balance ?? 0;

  const handleAddFund = (values) => {
    recordTransaction.mutateAsync(values).then(() => {
      setAddFundOpen(false);
      refetchSummary();
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          General ledger — every finance transaction (debit/credit). Balance is credit minus debit, all-time.
        </p>
        <div className="flex items-center gap-3">
          <p className="text-sm font-bold text-text">
            Balance: <span className={balance >= 0 ? 'text-success' : 'text-danger'}>
              {balance >= 0 ? 'Cr' : 'Dr'} ₹{Math.abs(balance).toLocaleString('en-IN')}
            </span>
          </p>
          <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
            <CreateButton onClick={() => setAddFundOpen(true)}>Add fund</CreateButton>
          </Can>
          <RefreshButton
            onClick={() => {
              refetch();
              refetchSummary();
            }}
            isFetching={isFetching}
          />
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
