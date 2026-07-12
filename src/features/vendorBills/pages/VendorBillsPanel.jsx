import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useVendorBillsQuery } from '@/features/vendorBills/queries/useVendorBillsQuery';
import { useCreateVendorBill } from '@/features/vendorBills/mutations/useCreateVendorBill';
import { useDeleteVendorBill } from '@/features/vendorBills/mutations/useDeleteVendorBill';
import { useCreateVendorPayment } from '@/features/vendorBills/mutations/useCreateVendorPayment';
import { useVendorsQuery } from '@/features/vendors/queries/useVendorsQuery';
import { usePurchasesQuery } from '@/features/purchases/queries/usePurchasesQuery';
import { useGoodsReceiptNotesQuery } from '@/features/goodsReceiptNotes/queries/useGoodsReceiptNotesQuery';
import { VendorBillTable } from '@/features/vendorBills/components/VendorBillTable';
import { VendorBillFormModal } from '@/features/vendorBills/components/VendorBillFormModal';
import { VendorPaymentFormModal } from '@/features/vendorBills/components/VendorPaymentFormModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function VendorBillsPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [billFormOpen, setBillFormOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useVendorBillsQuery({ page, pageSize });
  const { data: vendorsData } = useVendorsQuery({ pageSize: 100 });
  const { data: purchasesData } = usePurchasesQuery({ pageSize: 100 });
  const { data: grnsData } = useGoodsReceiptNotesQuery({ pageSize: 100 });
  const vendors = vendorsData?.data ?? [];
  const purchaseOrders = purchasesData?.data ?? [];
  const grns = grnsData?.data ?? [];
  const vendorsById = Object.fromEntries(vendors.map((v) => [v.id, v]));
  const purchaseOrdersById = Object.fromEntries(purchaseOrders.map((po) => [po.id, po]));
  const vendorOptions = vendors.map((v) => ({ value: v.id, label: v.name }));
  const purchaseOrderOptions = purchaseOrders.map((po) => ({ value: po.id, label: po.poNumber }));
  const grnOptions = grns.map((grn) => ({ value: grn.id, label: grn.grnNumber }));

  const createBill = useCreateVendorBill();
  const deleteBill = useDeleteVendorBill();
  const createVendorPayment = useCreateVendorPayment();

  const handleConfirmDelete = () => {
    deleteBill.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Vendor bills and payments (Accounts Payable).</p>
        <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setBillFormOpen(true)}>
            <Plus className="size-4" />
            New vendor bill
          </AppButton>
        </Can>
      </div>

      <VendorBillTable
        bills={data?.data ?? []}
        vendorsById={vendorsById}
        purchaseOrdersById={purchaseOrdersById}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onDelete={setDeleteTarget}
        onRecordPayment={setPaymentTarget}
      />

      <VendorBillFormModal
        open={billFormOpen}
        vendorOptions={vendorOptions}
        purchaseOrderOptions={purchaseOrderOptions}
        grnOptions={grnOptions}
        onClose={() => setBillFormOpen(false)}
        onSubmit={(values) => createBill.mutateAsync(values).then(() => setBillFormOpen(false))}
        isSubmitting={createBill.isPending}
      />

      <VendorPaymentFormModal
        open={Boolean(paymentTarget)}
        bill={paymentTarget}
        onClose={() => setPaymentTarget(null)}
        onSubmit={(values) => createVendorPayment.mutateAsync(values).then(() => setPaymentTarget(null))}
        isSubmitting={createVendorPayment.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete vendor bill"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteBill.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">Are you sure you want to delete <span className="font-medium text-text">{deleteTarget?.billNumber}</span>? This action cannot be undone.</p>
      </AppModal>
    </div>
  );
}
