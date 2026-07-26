import { AppTable } from '@/components/ui/AppTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DownloadButton, EditButton, DeleteButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
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
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <DownloadButton
            label={`Download ${row.name}`}
            onClick={(event) => {
              event.stopPropagation();
              downloadProductPdf(row, categoriesById, brandsById);
            }}
          />
          <Can module={MODULES.PRODUCTS} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.name}`} onClick={(event) => { event.stopPropagation(); onEdit(row); }} />
          </Can>
          <Can module={MODULES.PRODUCTS} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${row.name}`} onClick={(event) => { event.stopPropagation(); onDelete(row); }} />
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
