import { Download, Pencil, Trash2 } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { STATUS_BADGE_VARIANT } from '@/constants/statusEnums';
import { generateRecordPdf } from '@/utils/generateRecordPdf';

function downloadProductPdf(row, categoriesById, brandsById) {
  generateRecordPdf({
    title: `Product - ${row.name}`,
    fields: [
      { label: 'Product code', value: row.productCode },
      { label: 'Category', value: categoriesById?.[row.categoryId]?.name },
      { label: 'Brand', value: brandsById?.[row.brandId]?.name },
      { label: 'Gender', value: row.gender },
      { label: 'HSN code', value: row.hsnCode },
      { label: 'GST %', value: row.gstPercentage },
      { label: 'Status', value: row.status },
    ],
    fileName: `${row.productCode || row.name}.pdf`,
  });
}

export function ProductTable({
  products,
  categoriesById,
  brandsById,
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
    { key: 'name', header: 'Name' },
    { key: 'productCode', header: 'Code' },
    { key: 'category', header: 'Category', render: (row) => categoriesById?.[row.categoryId]?.name ?? '—' },
    { key: 'brand', header: 'Brand', render: (row) => brandsById?.[row.brandId]?.name ?? '—' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <BaseBadge variant={STATUS_BADGE_VARIANT[row.status] ?? 'default'}>{row.status}</BaseBadge>
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
              downloadProductPdf(row, categoriesById, brandsById);
            }}
            aria-label={`Download ${row.name}`}
          >
            <Download className="size-4" />
          </AppButton>
          <Can module={MODULES.PRODUCTS} action={ACTIONS.EDIT}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(row);
              }}
              aria-label={`Edit ${row.name}`}
            >
              <Pencil className="size-4" />
            </AppButton>
          </Can>
          <Can module={MODULES.PRODUCTS} action={ACTIONS.DELETE}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(row);
              }}
              aria-label={`Delete ${row.name}`}
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
      data={products}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRowClick={onEdit}
      emptyMessage="No products yet"
    />
  );
}
