import { Download, Pencil, Trash2 } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { STATUS_BADGE_VARIANT } from '@/constants/statusEnums';
import { generateRecordPdf } from '@/utils/generateRecordPdf';

function downloadSalesOrderPdf(row) {
  generateRecordPdf({
    title: `Sales Order - ${row.soNumber}`,
    fields: [
      { label: 'Customer', value: row.customer },
      { label: 'Order Date', value: row.orderDate },
      { label: 'Total', value: `Rs.${Number(row.total).toLocaleString('en-IN')}` },
      { label: 'Status', value: row.status },
    ],
    fileName: `${row.soNumber}.pdf`,
  });
}

export function SalesOrderTable({
  salesOrders,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
}) {
  const columns = [
    { key: 'soNumber', header: 'SO Number' },
    { key: 'customer', header: 'Customer' },
    { key: 'orderDate', header: 'Order Date' },
    {
      key: 'total',
      header: 'Total',
      render: (row) => `₹${Number(row.total).toLocaleString('en-IN')}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <BaseBadge variant={STATUS_BADGE_VARIANT[row.status] ?? 'default'}>{row.status}</BaseBadge>
      ),
    },
    {
      key: 'eta',
      header: 'Dispatch / ETA',
      render: (row) =>
        row.dispatchDate ? `Dispatch ${row.dispatchDate}` : row.productionEta ? `ETA ${row.productionEta}` : '—',
    },
    {
      key: 'linked',
      header: 'Linked',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.linkedWorkOrders?.map((wo) => (
            <BaseBadge key={wo} variant="info">
              {wo}
            </BaseBadge>
          ))}
          {row.invoiceNumber && <BaseBadge variant="success">{row.invoiceNumber}</BaseBadge>}
          {!row.linkedWorkOrders?.length && !row.invoiceNumber && (
            <span className="text-xs text-text-muted">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <AppButton
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              downloadSalesOrderPdf(row);
            }}
            aria-label={`Download ${row.soNumber}`}
          >
            <Download className="size-4" />
          </AppButton>
          <Can module={MODULES.SALES} action={ACTIONS.EDIT}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(row);
              }}
              aria-label={`Edit ${row.soNumber}`}
            >
              <Pencil className="size-4" />
            </AppButton>
          </Can>
          <Can module={MODULES.SALES} action={ACTIONS.DELETE}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(row);
              }}
              aria-label={`Delete ${row.soNumber}`}
              className="text-danger hover:bg-danger/10"
            >
              <Trash2 className="size-4" />
            </AppButton>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <AppTable
      columns={columns}
      data={salesOrders}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRowClick={onEdit}
      emptyMessage="No sales orders yet"
    />
  );
}
