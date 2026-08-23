import { useState } from 'react';
import { useFundingSourcesQuery } from '@/features/ledger/queries/useFundingSourcesQuery';
import { useCreateFundingSource } from '@/features/ledger/mutations/useCreateFundingSource';
import { FundingSourceModal } from '@/features/ledger/components/FundingSourceModal';
import { AppTable } from '@/components/ui/AppTable';
import { CreateButton } from '@/components/ui/ActionButtons';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const FUNDING_TYPE_LABEL = { advance: 'Advance', loan: 'Loan', equity: 'Equity', other: 'Other' };
const PARTY_TYPE_LABEL = { owner: 'Owner', employee: 'Employee', vendor: 'Vendor', other: 'Other' };

export function FundingSourcesPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [fundingSourceOpen, setFundingSourceOpen] = useState(false);

  const { data, isLoading, isFetching, refetch } = useFundingSourcesQuery();
  const createFundingSource = useCreateFundingSource();
  const allSources = data?.data ?? [];
  const start = (page - 1) * pageSize;
  const pageSources = allSources.slice(start, start + pageSize);

  const handleCreateFundingSource = (values) => {
    createFundingSource.mutateAsync(values).then(() => setFundingSourceOpen(false));
  };

  const columns = [
    { key: 'partyName', header: 'Party Name' },
    { key: 'partyType', header: 'Party Type', render: (row) => PARTY_TYPE_LABEL[row.partyType] || row.partyType || '—' },
    {
      key: 'defaultFundingType',
      header: 'Default Funding Type',
      render: (row) => FUNDING_TYPE_LABEL[row.defaultFundingType] || row.defaultFundingType || '—',
    },
    { key: 'entryCount', header: 'Entries', render: (row) => row.entryCount.toLocaleString('en-IN') },
    {
      key: 'totalFunded',
      header: 'Total Funded (₹)',
      render: (row) => `₹${row.totalFunded.toLocaleString('en-IN')}`,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          Funding sources — parties who personally advance money for business expenses. Total Funded is the sum of all
          ledger entries tagged with that source.
        </p>
        <div className="flex items-center gap-3">
          <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
            <CreateButton onClick={() => setFundingSourceOpen(true)}>New funding source</CreateButton>
          </Can>
          <RefreshButton onClick={refetch} isFetching={isFetching} />
        </div>
      </div>

      <AppTable
        columns={columns}
        data={pageSources}
        total={allSources.length}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        emptyMessage="No funding sources yet"
      />

      <FundingSourceModal
        open={fundingSourceOpen}
        onClose={() => setFundingSourceOpen(false)}
        onSubmit={handleCreateFundingSource}
        isSubmitting={createFundingSource.isPending}
      />
    </div>
  );
}
