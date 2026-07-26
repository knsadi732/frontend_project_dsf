import { useState } from 'react';
import { useCreditNotesQuery } from '@/features/creditNotes/queries/useCreditNotesQuery';
import { useCreateCreditNote } from '@/features/creditNotes/mutations/useCreateCreditNote';
import { useDeleteCreditNote } from '@/features/creditNotes/mutations/useDeleteCreditNote';
import { useInvoicesQuery } from '@/features/finance/queries/useInvoicesQuery';
import { CreditNoteFormModal } from '@/features/creditNotes/components/CreditNoteFormModal';
import { AppTable } from '@/components/ui/AppTable';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { DeleteButton, CreateButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function CreditNotesPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useCreditNotesQuery({ page, pageSize });
  const { data: invoicesData } = useInvoicesQuery({ pageSize: 100 });
  const invoiceOptions = (invoicesData?.data ?? []).map((inv) => ({ value: inv.id, label: inv.invoiceNumber }));

  const createCreditNote = useCreateCreditNote();
  const deleteCreditNote = useDeleteCreditNote();

  const handleConfirmDelete = () => {
    deleteCreditNote.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  const columns = [
    { key: 'creditNoteNumber', header: 'Credit Note #' },
    { key: 'invoiceNumber', header: 'Invoice', render: (row) => row.invoiceNumber ?? '—' },
    { key: 'customer', header: 'Customer' },
    { key: 'amount', header: 'Amount', render: (row) => `₹${Number(row.amount).toLocaleString('en-IN')}` },
    { key: 'gstAmount', header: 'GST Adjustment', render: (row) => `₹${Number(row.gstAmount ?? 0).toLocaleString('en-IN')}` },
    { key: 'createdDate', header: 'Date' },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.FINANCE} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${row.creditNoteNumber}`} onClick={(event) => { event.stopPropagation(); setDeleteTarget(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Credit notes issued for approved returns and refunds.</p>
        <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormOpen(true)}>New credit note</CreateButton>
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
        emptyMessage="No credit notes yet"
      />

      <CreditNoteFormModal
        open={formOpen}
        invoiceOptions={invoiceOptions}
        onClose={() => setFormOpen(false)}
        onSubmit={(values) => createCreditNote.mutateAsync(values).then(() => setFormOpen(false))}
        isSubmitting={createCreditNote.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete credit note"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteCreditNote.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Are you sure you want to delete <span className="font-medium text-text">{deleteTarget?.creditNoteNumber}</span>? This action cannot be undone.
        </p>
      </AppModal>
    </div>
  );
}
