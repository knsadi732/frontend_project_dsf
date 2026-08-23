import { useState } from 'react';
import { ArrowRightLeft, Wrench, Ban } from 'lucide-react';
import { useFixedAssetQuery } from '@/features/fixedAssets/queries/useFixedAssetQuery';
import { useReassignFixedAsset } from '@/features/fixedAssets/mutations/useReassignFixedAsset';
import { useAddFixedAssetMaintenance } from '@/features/fixedAssets/mutations/useAddFixedAssetMaintenance';
import { useDisposeFixedAsset } from '@/features/fixedAssets/mutations/useDisposeFixedAsset';
import { ReassignFixedAssetModal } from '@/features/fixedAssets/components/ReassignFixedAssetModal';
import { MaintenanceFormModal } from '@/features/fixedAssets/components/MaintenanceFormModal';
import { DisposeFixedAssetModal } from '@/features/fixedAssets/components/DisposeFixedAssetModal';
import { AppModal } from '@/components/ui/AppModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppTable } from '@/components/ui/AppTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';

const STATUS_VARIANT = { in_use: 'success', under_maintenance: 'warning', idle: 'default', disposed: 'danger' };

function money(value) {
  return value != null ? `₹${Number(value).toLocaleString('en-IN')}` : '—';
}

export function FixedAssetDetailModal({ assetId, onClose }) {
  const [reassignOpen, setReassignOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [disposeOpen, setDisposeOpen] = useState(false);

  const { data: asset, isLoading } = useFixedAssetQuery(assetId);
  const reassignAsset = useReassignFixedAsset();
  const addMaintenance = useAddFixedAssetMaintenance();
  const disposeAsset = useDisposeFixedAsset();

  const handleReassignSubmit = (values) => {
    reassignAsset.mutateAsync({ id: assetId, payload: values }).then(() => setReassignOpen(false));
  };

  const handleMaintenanceSubmit = (values) => {
    addMaintenance.mutateAsync({ id: assetId, payload: values }).then(() => setMaintenanceOpen(false));
  };

  const handleDisposeSubmit = (values) => {
    disposeAsset.mutateAsync({ id: assetId, payload: values }).then(() => setDisposeOpen(false));
  };

  // branchId/warehouseId on each history row are raw ids (backend joins no
  // display name onto assignment history, only onto the current asset) —
  // shown via custodian + location note instead of surfacing bare UUIDs.
  const assignmentColumns = [
    { key: 'assignedAt', header: 'Assigned on', render: (row) => (row.assignedAt ? new Date(row.assignedAt).toLocaleString('en-IN') : '—') },
    { key: 'custodianName', header: 'Custodian', render: (row) => row.custodianName ?? '—' },
    { key: 'locationNote', header: 'Location note', render: (row) => row.locationNote ?? '—' },
    { key: 'remarks', header: 'Remarks', render: (row) => row.remarks ?? '—' },
  ];

  const isDisposed = asset?.status === 'disposed';

  return (
    <AppModal
      open={Boolean(assetId)}
      onClose={onClose}
      title={asset ? `${asset.assetTag ?? asset.assetName} — ${asset.assetName}` : 'Asset'}
      className="max-w-3xl"
      footer={
        <>
          <AppButton variant="secondary" onClick={onClose}>Close</AppButton>
          {!isDisposed && (
            <Can module={MODULES.FIXED_ASSETS} action={ACTIONS.EDIT}>
              <AppButton variant="secondary" onClick={() => setReassignOpen(true)}>
                <ArrowRightLeft className="size-4" />
                Reassign
              </AppButton>
              <AppButton variant="secondary" onClick={() => setMaintenanceOpen(true)}>
                <Wrench className="size-4" />
                Log maintenance
              </AppButton>
              <AppButton variant="danger" onClick={() => setDisposeOpen(true)}>
                <Ban className="size-4" />
                Dispose
              </AppButton>
            </Can>
          )}
        </>
      }
    >
      {isLoading || !asset ? (
        <p className="text-sm text-text-muted">Loading…</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-text-muted">Asset tag</p>
              <p className="text-sm font-medium text-text">{asset.assetTag ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Item</p>
              <p className="text-sm font-medium text-text">{asset.itemCode ? `${asset.itemCode} — ${asset.itemName}` : (asset.itemName ?? '—')}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Vendor</p>
              <p className="text-sm font-medium text-text">{asset.vendorName ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Status</p>
              <StatusBadge status={asset.status} variantMap={STATUS_VARIANT} />
            </div>
            <div>
              <p className="text-xs text-text-muted">Purchase date</p>
              <p className="text-sm font-medium text-text">{asset.purchaseDate ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Purchase cost</p>
              <p className="text-sm font-medium text-text">{money(asset.purchaseCost)}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Accumulated depreciation</p>
              <p className="text-sm font-medium text-danger">{money(asset.accumulatedDepreciation)}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Net book value</p>
              <p className="text-sm font-bold text-text">{money(asset.netBookValue)}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Custodian</p>
              <p className="text-sm font-medium text-text">{asset.custodianName ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Location</p>
              <p className="text-sm font-medium text-text">{[asset.branchName, asset.warehouseName, asset.locationNote].filter(Boolean).join(' — ') || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Depreciation method</p>
              <p className="text-sm font-medium text-text capitalize">{asset.depreciationMethod ? asset.depreciationMethod.replace(/_/g, ' ') : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Useful life</p>
              <p className="text-sm font-medium text-text">{asset.usefulLifeYears != null ? `${asset.usefulLifeYears} years` : '—'}</p>
            </div>
          </div>

          {isDisposed && (
            <div className="rounded-md border border-danger/30 bg-danger/5 p-3">
              <p className="text-sm font-medium text-danger">Disposed</p>
              <p className="text-xs text-text-muted">
                {asset.disposalType ? asset.disposalType.replace(/_/g, ' ') : '—'} on {asset.disposalDate ?? '—'} · Value {money(asset.disposalValue)}
              </p>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-text">Assignment history</p>
            <AppTable columns={assignmentColumns} data={asset.assignments ?? []} emptyMessage="No assignment history yet" />
          </div>
        </div>
      )}

      <ReassignFixedAssetModal
        open={reassignOpen}
        asset={asset}
        onClose={() => setReassignOpen(false)}
        onSubmit={handleReassignSubmit}
        isSubmitting={reassignAsset.isPending}
      />
      <MaintenanceFormModal
        open={maintenanceOpen}
        onClose={() => setMaintenanceOpen(false)}
        onSubmit={handleMaintenanceSubmit}
        isSubmitting={addMaintenance.isPending}
      />
      <DisposeFixedAssetModal
        open={disposeOpen}
        onClose={() => setDisposeOpen(false)}
        onSubmit={handleDisposeSubmit}
        isSubmitting={disposeAsset.isPending}
      />
    </AppModal>
  );
}
