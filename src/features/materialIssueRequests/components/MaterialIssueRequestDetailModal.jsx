import { useMaterialIssueRequestQuery } from '@/features/materialIssueRequests/queries/useMaterialIssueRequestQuery';
import { AppModal } from '@/components/ui/AppModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BaseLoader } from '@/components/ui/BaseLoader';

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 last:border-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-medium text-text">{value || '—'}</span>
    </div>
  );
}

export function MaterialIssueRequestDetailModal({ open, onClose, requestId }) {
  const { data: mir, isLoading } = useMaterialIssueRequestQuery(requestId);

  return (
    <AppModal open={open} onClose={onClose} title={mir ? `Material Issue Request — ${mir.mirNumber}` : 'Material issue request'} className="max-w-xl">
      {isLoading || !mir ? (
        <BaseLoader />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col">
            <DetailRow label="Work Order" value={mir.workOrderNumber} />
            <DetailRow label="Product" value={mir.productName} />
            <DetailRow label="Warehouse" value={mir.warehouseName} />
            <DetailRow label="Requested by" value={mir.requestedByName} />
            <DetailRow label="Status" value={<StatusBadge status={mir.status} />} />
            {mir.approvedByName && <DetailRow label="Approved by" value={mir.approvedByName} />}
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Raw material required (per Bill of Materials)</h3>
            <div className="grid grid-cols-[1fr_6rem_6rem] gap-2 px-0.5 text-xs font-medium text-text-muted">
              <span>Material</span>
              <span className="text-right">Qty required</span>
              <span className="text-right">Qty reserved</span>
            </div>
            {(mir.items ?? []).map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_6rem_6rem] gap-2 border-b border-border py-1.5 text-sm last:border-0">
                <span className="text-text">
                  {[item.sku, item.rawMaterialName, item.size, item.color].filter(Boolean).join(' — ')}
                </span>
                <span className="text-right text-text-muted">{item.quantityRequired}</span>
                <span className={`text-right ${item.quantityReserved < item.quantityRequired ? 'text-danger' : 'text-success'}`}>
                  {item.quantityReserved}
                </span>
              </div>
            ))}
          </div>

          {mir.remarks && <p className="text-xs text-text-muted">{mir.remarks}</p>}
        </div>
      )}
    </AppModal>
  );
}
