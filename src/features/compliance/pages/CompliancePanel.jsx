import { useState } from 'react';
import { useGstProfileQuery } from '@/features/compliance/queries/useGstProfileQuery';
import { useStatutoryAuditsQuery } from '@/features/compliance/queries/useStatutoryAuditsQuery';
import { useCreateStatutoryAudit } from '@/features/compliance/mutations/useCreateStatutoryAudit';
import { useCrossVerifyLedger } from '@/features/compliance/mutations/useCrossVerifyLedger';
import { GstProfileCard } from '@/features/compliance/components/GstProfileCard';
import { LedgerCrossVerifyCard } from '@/features/compliance/components/LedgerCrossVerifyCard';
import { StatutoryAuditTable } from '@/features/compliance/components/StatutoryAuditTable';
import { StatutoryAuditFormModal } from '@/features/compliance/components/StatutoryAuditFormModal';
import { CreateButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function CompliancePanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formOpen, setFormOpen] = useState(false);

  const { data: gstProfile, isLoading: isGstLoading } = useGstProfileQuery();
  const { data, isLoading } = useStatutoryAuditsQuery({ page, pageSize });
  const createAudit = useCreateStatutoryAudit();
  const crossVerify = useCrossVerifyLedger();

  const handleSubmit = (values) => {
    createAudit.mutateAsync(values).then(() => setFormOpen(false));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <GstProfileCard profile={gstProfile} isLoading={isGstLoading} />
        <LedgerCrossVerifyCard
          onVerify={() => crossVerify.mutate()}
          isVerifying={crossVerify.isPending}
          result={crossVerify.data}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Statutory audit records.</p>
        <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormOpen(true)}>Record audit</CreateButton>
        </Can>
      </div>

      <StatutoryAuditTable
        audits={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      <StatutoryAuditFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createAudit.isPending}
      />
    </div>
  );
}
