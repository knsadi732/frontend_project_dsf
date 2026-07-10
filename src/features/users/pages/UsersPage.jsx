import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useUsersQuery } from '@/features/users/queries/useUsersQuery';
import { useCreateUser } from '@/features/users/mutations/useCreateUser';
import { useUpdateUser } from '@/features/users/mutations/useUpdateUser';
import { useDeleteUser } from '@/features/users/mutations/useDeleteUser';
import { UserTable } from '@/features/users/components/UserTable';
import { UserFormModal } from '@/features/users/components/UserFormModal';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formState, setFormState] = useState({ open: false, user: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search);
  const filters = useMemo(
    () => ({ search: debouncedSearch, page, pageSize: DEFAULT_PAGE_SIZE }),
    [debouncedSearch, page],
  );

  const { data, isLoading } = useUsersQuery(filters);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const handleSubmit = (values) => {
    const action = formState.user
      ? updateUser.mutateAsync({ id: formState.user.id, payload: values })
      : createUser.mutateAsync(values);

    action.then(() => setFormState({ open: false, user: null }));
  };

  const handleConfirmDelete = () => {
    deleteUser.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Users</h1>
          <p className="text-sm text-text-muted">Manage users and their access.</p>
        </div>
        <Can module={MODULES.USERS} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, user: null })}>
            <Plus className="size-4" />
            New user
          </AppButton>
        </Can>
      </div>

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search users…" className="w-72" />
      </FilterBar>

      <UserTable
        users={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={DEFAULT_PAGE_SIZE}
        isLoading={isLoading}
        onPageChange={setPage}
        onEdit={(user) => setFormState({ open: true, user })}
        onDelete={setDeleteTarget}
      />

      <UserFormModal
        open={formState.open}
        initialValues={formState.user}
        onClose={() => setFormState({ open: false, user: null })}
        onSubmit={handleSubmit}
        isSubmitting={createUser.isPending || updateUser.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete user"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteUser.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Are you sure you want to delete <span className="font-medium text-text">{deleteTarget?.name}</span>
          ? This action cannot be undone.
        </p>
      </AppModal>
    </div>
  );
}
