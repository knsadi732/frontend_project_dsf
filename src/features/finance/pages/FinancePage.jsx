import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useInvoicesQuery } from '@/features/finance/queries/useInvoicesQuery';
import { useCreateInvoice } from '@/features/finance/mutations/useCreateInvoice';
import { useUpdateInvoice } from '@/features/finance/mutations/useUpdateInvoice';
import { useDeleteInvoice } from '@/features/finance/mutations/useDeleteInvoice';
import { InvoiceTable } from '@/features/finance/components/InvoiceTable';
import { InvoiceFormModal } from '@/features/finance/components/InvoiceFormModal';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function FinancePage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formState, setFormState] = useState({ open: false, invoice: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search);
  const filters = useMemo(
    () => ({ search: debouncedSearch, page, pageSize: DEFAULT_PAGE_SIZE }),
    [debouncedSearch, page],
  );

  const { data, isLoading } = useInvoicesQuery(filters);
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();

  const handleSubmit = (values) => {
    const action = formState.invoice
      ? updateInvoice.mutateAsync({ id: formState.invoice.id, payload: values })
      : createInvoice.mutateAsync(values);

    action.then(() => setFormState({ open: false, invoice: null }));
  };

  const handleConfirmDelete = () => {
    deleteInvoice.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Finance</h1>
          <p className="text-sm text-text-muted">Manage your invoices.</p>
        </div>
        <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, invoice: null })}>
            <Plus className="size-4" />
            New invoice
          </AppButton>
        </Can>
      </div>

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search invoices…" className="w-72" />
      </FilterBar>

      <InvoiceTable
        invoices={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={DEFAULT_PAGE_SIZE}
        isLoading={isLoading}
        onPageChange={setPage}
        onEdit={(invoice) => setFormState({ open: true, invoice })}
        onDelete={setDeleteTarget}
      />

      <InvoiceFormModal
        open={formState.open}
        initialValues={formState.invoice}
        onClose={() => setFormState({ open: false, invoice: null })}
        onSubmit={handleSubmit}
        isSubmitting={createInvoice.isPending || updateInvoice.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete invoice"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteInvoice.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Are you sure you want to delete{' '}
          <span className="font-medium text-text">{deleteTarget?.invoiceNumber}</span>
          ? This action cannot be undone.
        </p>
      </AppModal>
    </div>
  );
}
