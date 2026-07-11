import { useMemo, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { useUsersQuery } from '@/features/users/queries/useUsersQuery';
import { useCreateUser } from '@/features/users/mutations/useCreateUser';
import { useUpdateUser } from '@/features/users/mutations/useUpdateUser';
import { useDeleteUser } from '@/features/users/mutations/useDeleteUser';
import { useDepartmentsQuery } from '@/features/departments/queries/useDepartmentsQuery';
import { useDesignationsQuery } from '@/features/designations/queries/useDesignationsQuery';
import { useBranchesQuery } from '@/features/users/queries/useBranchesQuery';
import { useWarehousesQuery } from '@/features/users/queries/useWarehousesQuery';
import { DepartmentsPanel } from '@/features/departments';
import { DesignationsPanel } from '@/features/designations';
import { UserTable } from '@/features/users/components/UserTable';
import { UserFormModal } from '@/features/users/components/UserFormModal';
import { UserDetailModal } from '@/features/users/components/UserDetailModal';
import { RolePermissionsPanel } from '@/features/users/components/RolePermissionsPanel';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { AppSelect } from '@/components/ui/AppSelect';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Tabs } from '@/layouts/components/Tabs';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { EMPLOYMENT_STATUS, toStatusOptions } from '@/constants/statusEnums';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import { downloadCsv } from '@/utils/downloadCsv';
import { getEmployeeFullName } from '@/utils/employeeName';

const STATUS_OPTIONS = toStatusOptions(EMPLOYMENT_STATUS);

const TABS = [
  { key: 'users', label: 'Employees' },
  { key: 'departments', label: 'Departments' },
  { key: 'designations', label: 'Designations' },
  { key: 'roles', label: 'Roles & Permissions' },
];

export function UsersPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, user: null });
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search);
  const filters = useMemo(
    () => ({ search: debouncedSearch, status, page, pageSize }),
    [debouncedSearch, status, page, pageSize],
  );

  const { data, isLoading, isFetching, refetch } = useUsersQuery(filters);
  const { data: departmentsData } = useDepartmentsQuery({ pageSize: 100 });
  const { data: designationsData } = useDesignationsQuery({ pageSize: 100 });
  const { data: branchesData } = useBranchesQuery();
  const { data: warehousesData } = useWarehousesQuery();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const departments = useMemo(() => departmentsData?.data ?? [], [departmentsData]);
  const designations = useMemo(() => designationsData?.data ?? [], [designationsData]);
  const branches = useMemo(() => branchesData?.data ?? [], [branchesData]);
  const warehouses = useMemo(() => warehousesData?.data ?? [], [warehousesData]);

  const departmentsById = useMemo(
    () => Object.fromEntries(departments.map((department) => [department.id, department])),
    [departments],
  );
  const designationsById = useMemo(
    () => Object.fromEntries(designations.map((designation) => [designation.id, designation])),
    [designations],
  );
  const branchesById = useMemo(() => Object.fromEntries(branches.map((branch) => [branch.id, branch])), [branches]);
  const warehousesById = useMemo(
    () => Object.fromEntries(warehouses.map((warehouse) => [warehouse.id, warehouse])),
    [warehouses],
  );

  const departmentOptions = departments.map((department) => ({ value: department.id, label: department.name }));
  const designationOptions = designations.map((designation) => ({ value: designation.id, label: designation.title }));
  const branchOptions = branches.map((branch) => ({ value: branch.id, label: branch.name }));
  const warehouseOptions = warehouses.map((warehouse) => ({ value: warehouse.id, label: warehouse.name }));

  const handleSubmit = (values) => {
    const action = formState.user
      ? updateUser.mutateAsync({ id: formState.user.id, payload: values })
      : createUser.mutateAsync(values);

    action.then(() => setFormState({ open: false, user: null }));
  };

  const handleConfirmDelete = () => {
    deleteUser.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  const handleDownloadList = () => {
    downloadCsv(
      'employees.csv',
      [
        { key: 'employeeCode', label: 'Employee code' },
        { key: 'name', label: 'Name', format: (_, row) => getEmployeeFullName(row) },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'department', label: 'Department', format: (_, row) => departmentsById[row.departmentId]?.name ?? '' },
        { key: 'designation', label: 'Designation', format: (_, row) => designationsById[row.designationId]?.title ?? '' },
        { key: 'branch', label: 'Branch', format: (_, row) => branchesById[row.branchId]?.name ?? '' },
        { key: 'warehouse', label: 'Warehouse', format: (_, row) => warehousesById[row.warehouseId]?.name ?? '' },
        { key: 'joiningDate', label: 'Joining date' },
        { key: 'employmentStatus', label: 'Employment status' },
      ],
      data?.data ?? [],
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-xl font-semibold text-text">Employee Management</h1>
        <p className="text-sm text-text-muted">Employees, departments, designations and role permissions.</p>
      </div>

      <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'users' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div />
            <div className="flex items-center gap-2">
              <AppButton variant="secondary" onClick={handleDownloadList}>
                <Download className="size-4" />
                Download list
              </AppButton>
              <Can module={MODULES.USERS} action={ACTIONS.CREATE}>
                <AppButton onClick={() => setFormState({ open: true, user: null })}>
                  <Plus className="size-4" />
                  New employee
                </AppButton>
              </Can>
            </div>
          </div>

          <FilterBar>
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search employees…"
              className="w-72"
            />
            <AppSelect
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              options={STATUS_OPTIONS}
              placeholder="All statuses"
              className="w-44"
              aria-label="Filter by employment status"
            />
            <RefreshButton onClick={refetch} isFetching={isFetching} />
          </FilterBar>

          <UserTable
            users={data?.data ?? []}
            departmentsById={departmentsById}
            total={data?.total ?? 0}
            page={page}
            pageSize={pageSize}
            isLoading={isLoading}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            onView={setViewTarget}
            onEdit={(user) => setFormState({ open: true, user })}
            onDelete={setDeleteTarget}
          />
        </div>
      )}

      {activeTab === 'departments' && <DepartmentsPanel />}
      {activeTab === 'designations' && <DesignationsPanel />}
      {activeTab === 'roles' && <RolePermissionsPanel />}

      <UserFormModal
        key={`${formState.open ? 'open' : 'closed'}-${formState.user?.id ?? 'new'}`}
        open={formState.open}
        initialValues={formState.user}
        departmentOptions={departmentOptions}
        designationOptions={designationOptions}
        branchOptions={branchOptions}
        warehouseOptions={warehouseOptions}
        onClose={() => setFormState({ open: false, user: null })}
        onSubmit={handleSubmit}
        isSubmitting={createUser.isPending || updateUser.isPending}
      />

      <UserDetailModal
        open={Boolean(viewTarget)}
        onClose={() => setViewTarget(null)}
        user={viewTarget}
        departmentsById={departmentsById}
        designationsById={designationsById}
        branchesById={branchesById}
        warehousesById={warehousesById}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete employee"
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
          Are you sure you want to delete{' '}
          <span className="font-medium text-text">{deleteTarget ? getEmployeeFullName(deleteTarget) : ''}</span>? This
          action cannot be undone.
        </p>
      </AppModal>
    </div>
  );
}
