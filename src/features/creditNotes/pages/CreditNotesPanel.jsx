import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCreditNotesQuery } from '@/features/creditNotes/queries/useCreditNotesQuery';
import { useCreateCreditNote } from '@/features/creditNotes/mutations/useCreateCreditNote';
import { useDeleteCreditNote } from '@/features/creditNotes/mutations/useDeleteCreditNote';
import { useInvoicesQuery } from '@/features/finance/queries/useInvoicesQuery';
import { CreditNoteTable } from '@/features/creditNotes/components/CreditNoteTable';
import { CreditNoteFormModal } from '@/features/creditNotes/components/CreditNoteFormModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Credit notes issued for approved returns and refunds.</p>
        <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            New credit note
          </AppButton>
        </Can>
      </div>

      <CreditNoteTable
        creditNotes={data?.data ?? []}
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
