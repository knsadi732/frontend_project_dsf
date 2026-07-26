import { ClipboardCheck } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DownloadButton, EditButton, DeleteButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { generateRecordPdf } from '@/utils/generateRecordPdf';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';

function totalCost(row) {
  return (
    Number(row.rawMaterialCost || 0) +
    Number(row.labourCost || 0) +
    Number(row.machineCost || 0) +
    Number(row.electricityCost || 0) +
    Number(row.packagingCost || 0) +
    Number(row.overheadCost || 0)
  );
}

function downloadWorkOrderPdf(row, productName) {
  generateRecordPdf({
    title: `Work Order - ${row.workOrderNumber}`,
    fields: [
      { label: 'Product', value: productName },
      { label: 'Quantity', value: row.quantity },
      { label: 'Due Date', value: row.dueDate },
      { label: 'Stage', value: row.stage },
      { label: 'Total Production Cost', value: `Rs.${totalCost(row).toLocaleString('en-IN')}` },
    ],
    fileName: `${row.workOrderNumber}.pdf`,
  });
}

export function WorkOrderTable({
  workOrders,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onRecordInspection,
}) {
  const { data: productsData } = useProductsQuery({ pageSize: 100 });
  const productNameById = new Map((productsData?.data ?? []).map((product) => [product.id, product.name]));

  const columns = [
    { key: 'workOrderNumber', header: 'Work Order #' },
    { key: 'product', header: 'Product', render: (row) => productNameById.get(row.productId) ?? row.productId },
    { key: 'quantity', header: 'Quantity' },
    { key: 'dueDate', header: 'Due Date' },
    { key: 'totalCost', header: 'Total Cost', render: (row) => `₹${totalCost(row).toLocaleString('en-IN')}` },
    { key: 'stage', header: 'Stage', render: (row) => <StatusBadge status={row.stage} /> },
    {
      key: 'linkedSo',
      header: 'Linked SO',
      render: (row) =>
        row.salesOrderNumber ? (
          <BaseBadge variant="info">{row.salesOrderNumber}</BaseBadge>
        ) : (
          <span className="text-xs text-text-muted">—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <DownloadButton
            label={`Download ${row.workOrderNumber}`}
            onClick={(event) => {
              event.stopPropagation();
              downloadWorkOrderPdf(row, productNameById.get(row.productId) ?? row.productId);
            }}
          />
          {row.stage !== 'completed' && row.stage !== 'cancelled' && (
            <Can module={MODULES.PRODUCTION} action={ACTIONS.EDIT}>
              <AppButton
                variant="ghost"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  onRecordInspection(row);
                }}
                aria-label={`Record inspection for ${row.workOrderNumber}`}
                title="Record inspection"
              >
                <ClipboardCheck className="size-4" />
              </AppButton>
            </Can>
          )}
          <Can module={MODULES.PRODUCTION} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.workOrderNumber}`} onClick={(event) => { event.stopPropagation(); onEdit(row); }} />
          </Can>
          <Can module={MODULES.PRODUCTION} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${row.workOrderNumber}`} onClick={(event) => { event.stopPropagation(); onDelete(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <AppTable
      columns={columns}
      data={workOrders}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRowClick={onEdit}
      emptyMessage="No work orders yet"
    />
  );
}
