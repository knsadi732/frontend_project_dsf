import { useState } from 'react';
import { PowerOff, Power } from 'lucide-react';
import { useMachinesQuery } from '@/features/machines/queries/useMachinesQuery';
import { useCreateMachine } from '@/features/machines/mutations/useCreateMachine';
import { useReportMachineDown } from '@/features/machines/mutations/useReportMachineDown';
import { useResolveMachineDowntime } from '@/features/machines/mutations/useResolveMachineDowntime';
import { MachineFormModal } from '@/features/machines/components/MachineFormModal';
import { AppTable } from '@/components/ui/AppTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AppButton } from '@/components/ui/AppButton';
import { CreateButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const MACHINE_STATUS_VARIANT = { running: 'success', down: 'danger', maintenance: 'warning' };

// Superadmin alert widget: "is a major machine offline right now." Status
// flips automatically via report-down/resolve-downtime — never edited directly.
export function MachinesPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading } = useMachinesQuery({ page, pageSize });
  const createMachine = useCreateMachine();
  const reportDown = useReportMachineDown();
  const resolveDowntime = useResolveMachineDowntime();

  const handleSubmit = (values) => {
    createMachine.mutateAsync(values).then(() => setFormOpen(false));
  };

  const columns = [
    { key: 'name', header: 'Machine' },
    { key: 'machineType', header: 'Type', render: (row) => row.machineType || '—' },
    { key: 'warehouseName', header: 'Warehouse', render: (row) => row.warehouseName || '—' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} variantMap={MACHINE_STATUS_VARIANT} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.PRODUCTION} action={ACTIONS.EDIT}>
            {row.status === 'down' ? (
              <AppButton
                variant="success"
                size="sm"
                loading={resolveDowntime.isPending}
                onClick={(event) => { event.stopPropagation(); resolveDowntime.mutate(row.id); }}
                aria-label={`Resolve downtime for ${row.name}`}
                title="Mark running again"
              >
                <Power className="size-4" />
              </AppButton>
            ) : (
              <AppButton
                variant="danger"
                size="sm"
                loading={reportDown.isPending}
                onClick={(event) => { event.stopPropagation(); reportDown.mutate({ id: row.id, reason: '' }); }}
                aria-label={`Report ${row.name} down`}
                title="Report down"
              >
                <PowerOff className="size-4" />
              </AppButton>
            )}
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Shop-floor equipment — flag downtime the moment a major machine stops.</p>
        <Can module={MODULES.PRODUCTION} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormOpen(true)}>New machine</CreateButton>
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
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        emptyMessage="No machines yet"
      />

      <MachineFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} isSubmitting={createMachine.isPending} />
    </div>
  );
}
