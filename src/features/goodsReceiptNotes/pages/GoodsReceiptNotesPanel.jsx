import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useGoodsReceiptNotesQuery } from '@/features/goodsReceiptNotes/queries/useGoodsReceiptNotesQuery';
import { useCreateGrn } from '@/features/goodsReceiptNotes/mutations/useCreateGrn';
import { useUpdateGrn } from '@/features/goodsReceiptNotes/mutations/useUpdateGrn';
import { useDeleteGrn } from '@/features/goodsReceiptNotes/mutations/useDeleteGrn';
import { usePurchasesQuery } from '@/features/purchases/queries/usePurchasesQuery';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { GrnTable } from '@/features/goodsReceiptNotes/components/GrnTable';
import { GrnFormModal } from '@/features/goodsReceiptNotes/components/GrnFormModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function GoodsReceiptNotesPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, grn: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useGoodsReceiptNotesQuery({ page, pageSize });
  const { data: purchasesData } = usePurchasesQuery({ pageSize: 100 });
  const { data: warehousesData } = useWarehousesQuery({ pageSize: 100 });
  const purchaseOrders = purchasesData?.data ?? [];
  const warehouses = warehousesData?.data ?? [];
  const purchaseOrdersById = Object.fromEntries(purchaseOrders.map((po) => [po.id, po]));
  const warehousesById = Object.fromEntries(warehouses.map((w) => [w.id, w]));
  const purchaseOrderOptions = purchaseOrders.map((po) => ({ value: po.id, label: po.poNumber }));
  const warehouseOptions = warehouses.map((w) => ({ value: w.id, label: w.name }));

  const createGrn = useCreateGrn();
  const updateGrn = useUpdateGrn();
  const deleteGrn = useDeleteGrn();

  const handleSubmit = (values) => {
    const action = formState.grn
      ? updateGrn.mutateAsync({ id: formState.grn.id, payload: values })
      : createGrn.mutateAsync(values);

    action.then(() => setFormState({ open: false, grn: null }));
  };

  const handleConfirmDelete = () => {
    deleteGrn.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Goods receipt notes — inventory increases only after approval.</p>
        <Can module={MODULES.PURCHASES} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, grn: null })}>
            <Plus className="size-4" />
            New GRN
          </AppButton>
        </Can>
      </div>

      <GrnTable
        grns={data?.data ?? []}
        purchaseOrdersById={purchaseOrdersById}
        warehousesById={warehousesById}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onEdit={(grn) => setFormState({ open: true, grn })}
        onDelete={setDeleteTarget}
        onApprove={(grn) => updateGrn.mutate({ id: grn.id, payload: { status: 'approved' } })}
      />

      <GrnFormModal
        open={formState.open}
        initialValues={formState.grn}
        purchaseOrderOptions={purchaseOrderOptions}
        warehouseOptions={warehouseOptions}
        onClose={() => setFormState({ open: false, grn: null })}
        onSubmit={handleSubmit}
        isSubmitting={createGrn.isPending || updateGrn.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete GRN"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteGrn.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">Are you sure you want to delete <span className="font-medium text-text">{deleteTarget?.grnNumber}</span>? This action cannot be undone.</p>
      </AppModal>
    </div>
  );
}
