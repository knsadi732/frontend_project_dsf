import { useState } from 'react';
import { useMaterialIssueRequestQuery } from '@/features/materialIssueRequests/queries/useMaterialIssueRequestQuery';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BaseLoader } from '@/components/ui/BaseLoader';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 last:border-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-medium text-text">{value || '—'}</span>
    </div>
  );
}

const ISSUABLE_STATUSES = ['approved', 'partially_issued'];

// Same Bill-of-Materials breakdown shown on both the Production ("Material
// Requests") and Inventory ("Material Issue") tabs — this is the one place
// warehouse actually confirms issuance (Submit), so it's kept as a detail
// view rather than a bare row-action icon.
export function MaterialIssueRequestDetailModal({ open, onClose, requestId, onIssue, isIssuing }) {
  const { data: mir, isLoading } = useMaterialIssueRequestQuery(requestId);
  // Warehouse staff types the exact qty they're physically handing over per
  // line — never auto-computed — keyed by item id, defaulted to that line's
  // full remaining balance (the common case) but editable down for a
  // partial hand-off. Backend caps each against balance + current stock.
  const [issueQty, setIssueQty] = useState({});
  // Re-sync the default qty-to-issue values whenever fresh MIR data arrives
  // (initial load, or a refetch after a partial submit changes balances) —
  // adjusted during render, not in an effect, per React's "storing
  // information from previous renders" pattern.
  const [syncedMir, setSyncedMir] = useState(mir);
  if (mir !== syncedMir) {
    setSyncedMir(mir);
    if (mir) {
      setIssueQty(
        Object.fromEntries((mir.items ?? []).map((item) => [item.id, String(Math.max(item.quantityRequired - item.quantityIssued, 0))])),
      );
    }
  }

  const handleSubmit = () => {
    const items = (mir.items ?? [])
      .map((item) => ({ itemId: item.id, quantity: Number(issueQty[item.id]) || 0 }))
      .filter((entry) => entry.quantity > 0);
    if (items.length) onIssue(mir.id, items);
  };

  return (
    <AppModal open={open} onClose={onClose} title={mir ? `Requisition Request — ${mir.mirNumber}` : 'Requisition request'} className="max-w-2xl">
      {isLoading || !mir ? (
        <BaseLoader />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col">
            <DetailRow label="Item" value={mir.productName} />
            <DetailRow label="Work Order" value={mir.workOrderNumber} />
            <DetailRow label="Department" value={mir.requestedByDepartment} />
            <DetailRow label="Warehouse" value={mir.warehouseName} />
            <DetailRow label="Date of requisition" value={mir.createdAt ? new Date(mir.createdAt).toLocaleDateString('en-IN') : null} />
            <DetailRow label="Date of issuance" value={mir.issuedAt ? new Date(mir.issuedAt).toLocaleDateString('en-IN') : null} />
            <DetailRow label="Requisition created by" value={mir.requestedByName} />
            <DetailRow label="Approved by" value={mir.approvedByName} />
            <DetailRow label="Status" value={<StatusBadge status={mir.status} />} />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Raw material — Bill of Materials</h3>
            {ISSUABLE_STATUSES.includes(mir.status) ? (
              <div className="grid grid-cols-[1fr_4rem_6rem_6rem_6rem_7rem] gap-2 px-0.5 text-xs font-medium text-text-muted">
                <span>Material</span>
                <span>UOM</span>
                <span className="text-right">Total qty required</span>
                <span className="text-right">Total issued</span>
                <span className="text-right">Balance</span>
                <span className="text-right">Qty to issue</span>
              </div>
            ) : (
              <div className="grid grid-cols-[1fr_4rem_6rem_6rem_6rem] gap-2 px-0.5 text-xs font-medium text-text-muted">
                <span>Material</span>
                <span>UOM</span>
                <span className="text-right">Total qty required</span>
                <span className="text-right">Total issued</span>
                <span className="text-right">Balance</span>
              </div>
            )}
            {(mir.items ?? []).map((item) => {
              const balance = item.quantityRequired - item.quantityIssued;
              return (
                <div
                  key={item.id}
                  className={`grid ${ISSUABLE_STATUSES.includes(mir.status) ? 'grid-cols-[1fr_4rem_6rem_6rem_6rem_7rem]' : 'grid-cols-[1fr_4rem_6rem_6rem_6rem]'} items-center gap-2 border-b border-border py-1.5 text-sm last:border-0`}
                >
                  <span className="text-text">
                    {[item.sku, item.rawMaterialName, item.size, item.color].filter(Boolean).join(' — ')}
                  </span>
                  <span className="text-text-muted">{item.uom || '—'}</span>
                  <span className="text-right text-text-muted">{item.quantityRequired}</span>
                  <span className="text-right text-text-muted">{item.quantityIssued}</span>
                  <span className={`text-right ${balance > 0 ? 'text-danger' : 'text-success'}`}>{balance}</span>
                  {ISSUABLE_STATUSES.includes(mir.status) && (
                    <AppInput
                      type="number"
                      min="0"
                      max={balance}
                      step="0.0001"
                      disabled={balance <= 0}
                      value={issueQty[item.id] ?? ''}
                      onChange={(event) => setIssueQty((prev) => ({ ...prev, [item.id]: event.target.value }))}
                      className="h-8 text-right"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {mir.remarks && <p className="text-xs text-text-muted">{mir.remarks}</p>}

          {ISSUABLE_STATUSES.includes(mir.status) && onIssue && (
            <Can module={MODULES.INVENTORY} action={ACTIONS.EDIT}>
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <p className="text-xs text-text-muted">
                  Type exactly what's physically going out per line — defaults to the full balance, edit down for a
                  partial hand-off. Repeatable until every balance hits zero, so production doesn't wait on a full
                  delivery.
                </p>
                <div className="flex justify-end">
                  <AppButton loading={isIssuing} onClick={handleSubmit}>
                    Submit
                  </AppButton>
                </div>
              </div>
            </Can>
          )}
        </div>
      )}
    </AppModal>
  );
}
