import { useMemo, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { useUsersQuery } from '@/features/users/queries/useUsersQuery';
import { useCreateUser } from '@/features/users/mutations/useCreateUser';
import { useUpdateUser } from '@/features/users/mutations/useUpdateUser';
import { useDepartmentsQuery } from '@/features/departments/queries/useDepartmentsQuery';
import { useDesignationsQuery } from '@/features/designations/queries/useDesignationsQuery';
import { useBranchesQuery } from '@/features/branches/queries/useBranchesQuery';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { useRolesQuery } from '@/features/roles/queries/useRolesQuery';
import { DepartmentsPanel } from '@/features/departments';
import { DesignationsPanel } from '@/features/designations';
import { CompanyPanel } from '@/features/company';
import { BranchesPanel } from '@/features/branches';
import { WarehousesPanel } from '@/features/warehouses';
import { LeavesPanel } from '@/features/leaves';
import { AssetsPanel } from '@/features/assets';
import { AuditLogsPanel } from '@/features/auditLogs';
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
import { markPendingPasswordChange } from '@/utils/pendingPasswordChange';
import { pushToast } from '@/utils/toastBus';

const DEFAULT_TEMP_PASSWORD = '123456';

// No real email/SMS gateway is connected, so the login credentials are
// handed to the employee via Gmail's web compose URL right after creation
// — opens directly in the browser with the recipient/subject/body already
// filled in, unlike mailto: which silently does nothing unless the OS has
// a default mail app registered.
function buildGmailComposeUrl({ email, phone, password }) {
  const subject = 'Your DS Footwear ERP login';
  const body = [
    `Login ID (phone): ${phone}`,
    `Temporary password: ${password}`,
    '',
    'Sign in and update your password from Profile > Password whenever you like — it is not required before you can start working.',
  ].join('\n');
  const params = new URLSearchParams({ view: 'cm', fs: '1', to: email ?? '', su: subject, body });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

const STATUS_OPTIONS = toStatusOptions(EMPLOYMENT_STATUS);

const TABS = [
  { key: 'users', label: 'Employees' },
  { key: 'departments', label: 'Departments' },
  { key: 'designations', label: 'Designations' },
  { key: 'company', label: 'Company' },
  { key: 'branches', label: 'Branches' },
  { key: 'warehouses', label: 'Warehouses' },
  { key: 'leaves', label: 'Leave' },
  { key: 'assets', label: 'Assets' },
  { key: 'audit-logs', label: 'Audit Logs' },
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
  const { data: allUsersData } = useUsersQuery({ pageSize: 100 });
  const { data: departmentsData } = useDepartmentsQuery({ pageSize: 100 });
  const { data: designationsData } = useDesignationsQuery({ pageSize: 100 });
  const { data: branchesData } = useBranchesQuery({ pageSize: 100 });
  const { data: warehousesData } = useWarehousesQuery({ pageSize: 100 });
  const { data: rolesData } = useRolesQuery({ pageSize: 100 });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const departments = useMemo(() => departmentsData?.data ?? [], [departmentsData]);
  const designations = useMemo(() => designationsData?.data ?? [], [designationsData]);
  const branches = useMemo(() => branchesData?.data ?? [], [branchesData]);
  const warehouses = useMemo(() => warehousesData?.data ?? [], [warehousesData]);
  const roles = useMemo(() => rolesData?.data ?? [], [rolesData]);

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
  const allUsers = useMemo(() => allUsersData?.data ?? [], [allUsersData]);
  const employeesById = useMemo(() => Object.fromEntries(allUsers.map((user) => [user.id, user])), [allUsers]);
  const rolesById = useMemo(() => Object.fromEntries(roles.map((role) => [role.id, role])), [roles]);

  const departmentOptions = departments.map((department) => ({ value: department.id, label: department.name }));
  const designationOptions = designations.map((designation) => ({ value: designation.id, label: designation.title }));
  const branchOptions = branches.map((branch) => ({ value: branch.id, label: branch.name }));
  const warehouseOptions = warehouses.map((warehouse) => ({ value: warehouse.id, label: warehouse.name }));
  const roleOptions = roles.map((role) => ({ value: role.id, label: role.name }));
  const employeeOptions = allUsers
    .filter((user) => user.id !== formState.user?.id)
    .map((user) => ({ value: user.id, label: getEmployeeFullName(user) }));

  const handleSubmit = (values) => {
    // Ch19.3 "Phone Number must be unique"
    const phoneTaken = allUsers.some((user) => user.phone === values.phone && user.id !== formState.user?.id);
    if (phoneTaken) {
      pushToast('error', 'Another employee already uses this phone number');
      return;
    }

    if (formState.user) {
      updateUser.mutateAsync({ id: formState.user.id, payload: values }).then(() => setFormState({ open: false, user: null }));
      return;
    }

    // confirmPassword is form-only — user.api.js's toBackendPayload only
    // picks the fields the backend actually accepts, so it's safe to pass
    // values through as-is here.
    const password = values.password || DEFAULT_TEMP_PASSWORD;
    createUser.mutateAsync({ ...values, password }).then((record) => {
      setFormState({ open: false, user: null });
      // Optional, one-time nudge (see pendingPasswordChange.js) — the
      // employee can skip it and keep working on their temp password.
      markPendingPasswordChange(record.phone);
      // Fallback visibility: if there's no default mail app registered on
      // this machine, mailto: silently does nothing — so the credentials
      // are always shown here too, not only inside the email draft.
      pushToast('info', `Login: ${record.phone} — Temp password: ${password}`);
      // record.email should always equal what was just typed in the form,
      // but fall back to it explicitly in case the backend ever omits the
      // field from its response — the "To" field must never end up blank.
      window.open(
        buildGmailComposeUrl({ email: record.email || values.email, phone: record.phone, password }),
        '_blank',
      );
    });
  };

  const handleConfirmDelete = () => {
    // Ch19.3 "Deleted Employees are soft deleted" — deactivate instead of
    // removing the record, so the employee stays visible/auditable.
    updateUser.mutate(
      { id: deleteTarget.id, payload: { employmentStatus: 'terminated' } },
      { onSettled: () => setDeleteTarget(null) },
    );
  };

  const handleDownloadList = () => {
    downloadCsv(
      'employees.csv',
      [
        { key: 'employeeCode', label: 'Employee code' },
        { key: 'name', label: 'Name', format: (_, row) => getEmployeeFullName(row) },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'primaryRole', label: 'Primary role', format: (_, row) => rolesById[row.primaryRole]?.name ?? row.primaryRole },
        {
          key: 'additionalRoles',
          label: 'Additional roles',
          format: (_, row) => (row.additionalRoles ?? []).map((role) => rolesById[role]?.name ?? role).join(', '),
        },
        { key: 'department', label: 'Department', format: (_, row) => departmentsById[row.departmentId]?.name ?? row.departmentName ?? '' },
        { key: 'designation', label: 'Designation', format: (_, row) => designationsById[row.designationId]?.title ?? row.designationTitle ?? '' },
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
            rolesById={rolesById}
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
      {activeTab === 'company' && <CompanyPanel />}
      {activeTab === 'branches' && <BranchesPanel />}
      {activeTab === 'warehouses' && <WarehousesPanel />}
      {activeTab === 'leaves' && <LeavesPanel employeesById={employeesById} employeeOptions={employeeOptions} />}
      {activeTab === 'assets' && <AssetsPanel employeesById={employeesById} employeeOptions={employeeOptions} />}
      {activeTab === 'audit-logs' && <AuditLogsPanel employeesById={employeesById} />}
      {activeTab === 'roles' && <RolePermissionsPanel />}

      <UserFormModal
        key={`${formState.open ? 'open' : 'closed'}-${formState.user?.id ?? 'new'}`}
        open={formState.open}
        initialValues={formState.user}
        departmentOptions={departmentOptions}
        designationOptions={designationOptions}
        branchOptions={branchOptions}
        warehouseOptions={warehouseOptions}
        employeeOptions={employeeOptions}
        roleOptions={roleOptions}
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
        employeesById={employeesById}
        rolesById={rolesById}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Deactivate employee"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={updateUser.isPending} onClick={handleConfirmDelete}>
              Deactivate
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Are you sure you want to deactivate{' '}
          <span className="font-medium text-text">{deleteTarget ? getEmployeeFullName(deleteTarget) : ''}</span>? Their
          record is kept for audit purposes and marked Terminated instead of being removed.
        </p>
      </AppModal>
    </div>
  );
}
