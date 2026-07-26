import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { useVendorBillsQuery } from '@/features/vendorBills/queries/useVendorBillsQuery';
import { useCreateVendorBill } from '@/features/vendorBills/mutations/useCreateVendorBill';
import { useDeleteVendorBill } from '@/features/vendorBills/mutations/useDeleteVendorBill';
import { useCreateVendorPayment } from '@/features/vendorBills/mutations/useCreateVendorPayment';
import { useVendorsQuery } from '@/features/vendors/queries/useVendorsQuery';
import { usePurchasesQuery } from '@/features/purchases/queries/usePurchasesQuery';
import { useGoodsReceiptNotesQuery } from '@/features/goodsReceiptNotes/queries/useGoodsReceiptNotesQuery';
import { VendorBillFormModal } from '@/features/vendorBills/components/VendorBillFormModal';
import { VendorPaymentFormModal } from '@/features/vendorBills/components/VendorPaymentFormModal';
import { AppTable } from '@/components/ui/AppTable';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DeleteButton, CreateButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const BILL_STATUS_VARIANT = { pending: 'warning', partial: 'warning', paid: 'success', overdue: 'danger' };

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

  const columns = [
    { key: 'billNumber', header: 'Bill Number' },
    { key: 'vendor', header: 'Vendor', render: (row) => vendorsById?.[row.vendorId]?.name ?? '—' },
    { key: 'po', header: 'Purchase Order', render: (row) => purchaseOrdersById?.[row.purchaseOrderId]?.poNumber ?? '—' },
    { key: 'amount', header: 'Amount', render: (row) => `₹${Number(row.amount).toLocaleString('en-IN')}` },
    { key: 'balanceDue', header: 'Balance due', render: (row) => `₹${Number(row.balanceDue ?? row.amount).toLocaleString('en-IN')}` },
    { key: 'dueDate', header: 'Due date' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status ?? 'pending'} variantMap={BILL_STATUS_VARIANT} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          {row.status !== 'paid' && (
            <Can module={MODULES.FINANCE} action={ACTIONS.EDIT}>
              <AppButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setPaymentTarget(row); }} aria-label="Record payment" title="Record payment">
                <CreditCard className="size-4" />
              </AppButton>
            </Can>
          )}
          <Can module={MODULES.FINANCE} action={ACTIONS.DELETE}>
            <DeleteButton label="Delete bill" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Vendor bills and payments (Accounts Payable).</p>
        <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setBillFormOpen(true)}>New vendor bill</CreateButton>
        </Can>
      </div>

      <AppTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        emptyMessage="No vendor bills yet"
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
