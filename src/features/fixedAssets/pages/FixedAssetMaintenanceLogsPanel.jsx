import { useState } from 'react';
import { useFixedAssetsQuery } from '@/features/fixedAssets/queries/useFixedAssetsQuery';
import { useFixedAssetMaintenanceLogsQuery } from '@/features/fixedAssets/queries/useFixedAssetMaintenanceLogsQuery';
import { AppTable } from '@/components/ui/AppTable';
import { AppSelect } from '@/components/ui/AppSelect';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { FilterBar } from '@/components/ui/FilterBar';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

function money(value) {
  return value != null ? `₹${Number(value).toLocaleString('en-IN')}` : '—';
}

const MAINTENANCE_TYPE_VARIANT = { scheduled: 'info', breakdown: 'danger' };

export function FixedAssetMaintenanceLogsPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [assetId, setAssetId] = useState('');

  const { data: assetsData } = useFixedAssetsQuery({ pageSize: 500 });
  const assetOptions = (assetsData?.data ?? []).map((asset) => ({ value: asset.id, label: `${asset.assetTag ?? ''} — ${asset.assetName}`.replace(/^ — /, '') }));

  const { data, isLoading, isFetching, refetch } = useFixedAssetMaintenanceLogsQuery({
    page,
    pageSize,
    assetId: assetId || undefined,
  });
  const logs = data?.data ?? [];

  const columns = [
    { key: 'maintenanceDate', header: 'Date', render: (row) => row.maintenanceDate ?? '—' },
    { key: 'assetName', header: 'Asset', render: (row) => (row.assetTag ? `${row.assetTag} — ${row.assetName}` : (row.assetName ?? '—')) },
    { key: 'maintenanceType', header: 'Type', render: (row) => <StatusBadge status={row.maintenanceType} variantMap={MAINTENANCE_TYPE_VARIANT} /> },
    { key: 'vendorName', header: 'Vendor', render: (row) => row.vendorName ?? '—' },
    { key: 'cost', header: 'Cost', render: (row) => money(row.cost) },
    { key: 'downtimeHours', header: 'Downtime (hrs)', render: (row) => row.downtimeHours ?? '—' },
    { key: 'nextScheduledDate', header: 'Next scheduled', render: (row) => row.nextScheduledDate ?? '—' },
    { key: 'remarks', header: 'Remarks', render: (row) => row.remarks ?? '—' },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Full maintenance history across every asset — logged from the asset detail view.</p>
        <RefreshButton onClick={refetch} isFetching={isFetching} />
      </div>

      <FilterBar>
        <AppSelect
          value={assetId}
          onChange={(event) => { setAssetId(event.target.value); setPage(1); }}
          options={assetOptions}
          placeholder="All assets"
          className="w-64"
          aria-label="Filter by asset"
        />
      </FilterBar>

      <AppTable
        columns={columns}
        data={logs}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        emptyMessage="No maintenance logged yet"
      />
    </div>
  );
}
